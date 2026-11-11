import { NextRequest, NextResponse } from "next/server";
import { LIMITS, rateLimited, requireUser } from "@/lib/apiGuard";
import { groqChat, parseJsonReply, parseRetryAfter, type GroqMessage } from "@/lib/groq";

const LANGUAGE_NAMES = {
  en: "English",
  ta: "Tamil (தமிழ்)",
  te: "Telugu (తెలుగు)",
  kn: "Kannada (ಕನ್ನಡ)",
  ml: "Malayalam (മലയാളം)",
  hi: "Hindi (हिंदी)",
} as const;
type LangCode = keyof typeof LANGUAGE_NAMES;
const isLang = (v: unknown): v is LangCode => typeof v === "string" && Object.prototype.hasOwnProperty.call(LANGUAGE_NAMES, v);
const suffix = (l: LangCode) => l.toUpperCase();

// Only the languages that are asked for are generated. Output tokens are the scarce resource on
// Groq's free tier (about 1,000 a minute on the vision model), and six languages of Indic script
// need several thousand. The other languages are translated on demand (see translateFields).
function buildOcrPrompt(langs: LangCode[]): string {
  const perLanguage = langs.map(l => {
    const name = LANGUAGE_NAMES[l];
    const s = suffix(l);
    return `  "whatIsThis${s}": "2 short sentences in ${name}: what this file is.",
  "howToUse${s}": "2-3 sentences in ${name}: what the information means and how to use it.",
  "summary${s}": "3-4 sentences in ${name}: plain summary of the key text, numbers and terms.",
  "actionItems${s}": ["step 1 in ${name}", "step 2 in ${name}", "step 3 in ${name}"]`;
  }).join(",\n");
  return `You are an expert OCR and document analysis assistant for Indian farmers.
Analyze the image or document provided and read its actual text.
Write each language's fields in that language's own script. Keep numbers, names, dates and scheme acronyms exactly as in the document. Be concise.

Return ONLY a valid JSON object (no markdown fences) with exactly these keys:
{
  "documentType": "Document category, e.g. Soil Test Report, KCC Loan Sanction, Government Scheme Notice",
  "extractedTitle": "Main heading written in the document",
  "extractedDate": "Issue date or period found in the document",
  "issuerAuthority": "Issuing department or organization found in the document",
${perLanguage}
}`;
}

// Vision-capable model for images; text-only models can additionally handle PDF text
const GROQ_VISION_MODEL = process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b";
const GROQ_TEXT_MODELS = [process.env.GROQ_TEXT_MODEL || "qwen/qwen3.8-27b", "openai/gpt-oss-20b"];

// Serverless hosts cap request bodies (~4.5 MB on Vercel); PDFs are reduced to extracted text
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
// Groq accepts base64 images up to 4 MB, and base64 is ~33% larger than the raw file
const MAX_IMAGE_BYTES = 3 * 1000 * 1000;

// Seconds; vision OCR with a ~4k-token JSON reply is slow
export const maxDuration = 60;

type RawOcr = Record<string, unknown>;

const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v : undefined);
const strList = (v: unknown): string[] | undefined =>
  Array.isArray(v) && v.length > 0 && v.every(x => typeof x === "string") ? v : undefined;

function extractTextFromFileBuffer(buffer: Buffer): string {
  try {
    const str = buffer.toString("utf-8");
    const textMatches: string[] = [];

    const asciiWords = str.match(/[A-Za-z0-9,\.\-\:\/\s]{3,100}/g) || [];
    asciiWords.forEach((w) => {
      const trimmed = w.trim();
      if (
        trimmed.length > 3 &&
        !trimmed.includes("stream") &&
        !trimmed.includes("endstream") &&
        !trimmed.includes("obj") &&
        !trimmed.includes("PDF-")
      ) {
        textMatches.push(trimmed);
      }
    });

    return textMatches.slice(0, 80).join(" ");
  } catch {
    return "";
  }
}

function normalizeOcrResult(raw: RawOcr, fileName: string, langs: LangCode[]) {
  const issuingAuthority = raw.issuing_authority as { name?: unknown } | undefined;
  const summary = raw.summary as { text?: unknown } | string | undefined;
  const docType = str(raw.documentType) || str(raw.document_type) || "Analyzed Document";
  const title = str(raw.extractedTitle) || str(raw.title) || str(raw.document_title) || fileName.replace(/\.[^/.]+$/, "");
  const date = str(raw.extractedDate) || str(raw.date) || new Date().toLocaleDateString("en-IN");
  const issuer = str(raw.issuerAuthority) || str(raw.issuer) || str(issuingAuthority?.name) || "Document Issuing Entity";

  const whatEN = str(raw.whatIsThisEN) || str(raw.whatIsThis) || `This file "${fileName}" is a ${docType}.`;
  const howEN = str(raw.howToUseEN) || str(raw.howToUse) || "Review the extracted details carefully for your official records and farm planning.";
  const sumEN = str(raw.summaryEN) || str(summary) || (typeof summary === "object" ? str(summary?.text) : undefined) || whatEN;
  const actEN = strList(raw.actionItemsEN) || strList(raw.action_items) || strList(raw.actionItems) || ["Review the official details carefully.", "Verify the key information.", "Keep a safe copy.", "Contact your local agriculture office if unsure."];

  const result: Record<string, unknown> = {
    documentType: docType,
    extractedTitle: title,
    extractedDate: date,
    issuerAuthority: issuer,
    whatIsThisEN: whatEN,
    howToUseEN: howEN,
    summaryEN: sumEN,
    actionItemsEN: actEN,
  };
  // Languages the model actually wrote; every other language shows English until it is translated
  const generated: LangCode[] = ["en"];
  for (const l of Object.keys(LANGUAGE_NAMES) as LangCode[]) {
    if (l === "en") continue;
    const s = suffix(l);
    const what = langs.includes(l) ? str(raw[`whatIsThis${s}`]) : undefined;
    const how = langs.includes(l) ? str(raw[`howToUse${s}`]) : undefined;
    const sum = langs.includes(l) ? str(raw[`summary${s}`]) : undefined;
    const act = langs.includes(l) ? strList(raw[`actionItems${s}`]) : undefined;
    const ok = !!(what && sum);
    if (ok) generated.push(l);
    result[`whatIsThis${s}`] = ok ? what : whatEN;
    result[`howToUse${s}`] = ok ? how || howEN : howEN;
    result[`summary${s}`] = ok ? sum : sumEN;
    result[`actionItems${s}`] = ok && act ? act : actEN;
  }
  result.languages = generated;
  return result;
}

interface ScanFailure {
  status: number;
  retryAfterSeconds?: number;
}

// A wait this short is worth riding out inside the request instead of failing the scan
const MAX_INLINE_WAIT_SECONDS = 15;
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function callGroqOCR(promptText: string, langs: LangCode[], imageBase64?: string, mimeType?: string): Promise<{ parsed: RawOcr; modelName: string } | ScanFailure> {
  const text = `${buildOcrPrompt(langs)}\n\n${promptText}`;
  let content: GroqMessage["content"] = text;
  if (imageBase64) {
    const finalMime = mimeType === "image/jpg" ? "image/jpeg" : mimeType || "image/png";
    content = [
      { type: "text", text },
      { type: "image_url", image_url: { url: `data:${finalMime};base64,${imageBase64}` } }
    ];
  }

  // Stay inside the function's maxDuration so an error can still be returned
  const deadline = Date.now() + (maxDuration - 5) * 1000;
  // Only the vision model can read an image; text models can also handle PDF text
  const models = imageBase64 ? [GROQ_VISION_MODEL] : GROQ_TEXT_MODELS;
  let failure: ScanFailure = { status: 503 };
  for (const [i, modelName] of models.entries()) {
    const isLast = i === models.length - 1;
    for (let attempt = 0; attempt < 2; attempt++) {
      const remainingMs = deadline - Date.now();
      if (remainingMs < 5000) return failure;
      const result = await groqChat({
        model: modelName,
        messages: [{ role: "user", content }],
        temperature: 0.1,
        maxTokens: 2500,
        json: true,
        // Leave time for the next model if this one hangs
        timeoutMs: isLast ? remainingMs : Math.min(remainingMs, 35000)
      });
      if (result.ok) {
        const parsed = parseJsonReply(result.content);
        if (parsed) return { parsed, modelName };
        console.warn(`Groq OCR returned unparseable JSON from ${modelName} (finish: ${result.finishReason})`);
        failure = { status: 502 };
        break;
      }
      console.warn(`Groq OCR failed for model ${modelName} (status ${result.status}): ${result.error}`);
      if (result.status !== 429) {
        failure = { status: result.status === 0 ? 503 : result.status };
        break;
      }
      const wait = parseRetryAfter(result.error);
      failure = { status: 429, retryAfterSeconds: wait };
      // Rate limited: wait it out once when the wait is short, otherwise try the next model
      if (attempt === 0 && wait !== undefined && wait <= MAX_INLINE_WAIT_SECONDS && wait * 1000 < remainingMs - 10000) {
        await sleep(wait * 1000 + 300);
        continue;
      }
      break;
    }
  }
  return failure;
}

function failureResponse(f: ScanFailure) {
  if (f.status === 429) {
    const seconds = f.retryAfterSeconds ?? 30;
    return NextResponse.json(
      { error: `The AI scanner is busy right now (usage limit reached). Please try again in about ${seconds} seconds.`, retryAfterSeconds: seconds },
      { status: 429, headers: { "Retry-After": String(seconds) } }
    );
  }
  return NextResponse.json({ error: "The AI scanner is unavailable right now. Please try again in a few minutes." }, { status: 503 });
}

interface TranslatableFields {
  whatIsThis: string;
  howToUse: string;
  summary: string;
  actionItems: string[];
}

/** Translates the English result into one language with a text model (cheaper and faster than re-reading the image). */
async function translateFields(fields: TranslatableFields, to: LangCode): Promise<TranslatableFields | ScanFailure> {
  const prompt = `Translate the values of this JSON from English into ${LANGUAGE_NAMES[to]}, written in that language's own script.
Keep numbers, names, dates and scheme acronyms unchanged. Return ONLY a JSON object with exactly the same keys and structure (no markdown fences).

${JSON.stringify(fields)}`;
  let failure: ScanFailure = { status: 503 };
  // gpt-oss has a much larger per-minute allowance than the vision model, so it goes first
  for (const model of ["openai/gpt-oss-20b", GROQ_TEXT_MODELS[0]]) {
    const result = await groqChat({ model, messages: [{ role: "user", content: prompt }], temperature: 0.1, maxTokens: 2500, json: true, timeoutMs: 40000 });
    if (result.ok) {
      const parsed = parseJsonReply(result.content);
      const what = str(parsed?.whatIsThis);
      const sum = str(parsed?.summary);
      if (parsed && what && sum) {
        return { whatIsThis: what, howToUse: str(parsed.howToUse) || fields.howToUse, summary: sum, actionItems: strList(parsed.actionItems) || fields.actionItems };
      }
      failure = { status: 502 };
      continue;
    }
    console.warn(`Groq translate failed for model ${model} (status ${result.status}): ${result.error}`);
    failure = result.status === 429 ? { status: 429, retryAfterSeconds: parseRetryAfter(result.error) } : { status: result.status === 0 ? 503 : result.status };
  }
  return failure;
}

export async function GET() {
  return NextResponse.json({ status: "ok", service: "AgriPredict Groq OCR Engine" });
}

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function languagesFor(requested: unknown): LangCode[] {
  return isLang(requested) && requested !== "en" ? ["en", requested] : ["en"];
}

export async function POST(req: NextRequest) {
  const blocked = rateLimited(req, LIMITS.ocr) ?? (await requireUser(req));
  if (blocked) return blocked;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = ((await req.json().catch(() => null)) ?? {}) as Record<string, unknown>;

      if (body.action === "translate") {
        const to = body.to;
        const f = (body.fields ?? {}) as Record<string, unknown>;
        if (!isLang(to) || to === "en" || !str(f.whatIsThis) || !str(f.summary)) {
          return NextResponse.json({ error: "Invalid translation request" }, { status: 400 });
        }
        const fields: TranslatableFields = {
          whatIsThis: str(f.whatIsThis)!.slice(0, 2000),
          howToUse: (str(f.howToUse) || "").slice(0, 2000),
          summary: str(f.summary)!.slice(0, 4000),
          actionItems: (strList(f.actionItems) || []).slice(0, 8).map(x => x.slice(0, 400)),
        };
        const translated = await translateFields(fields, to);
        return "status" in translated ? failureResponse(translated) : NextResponse.json({ translated });
      }

      const demoKey = str(body.demoKey)?.slice(0, 120);
      const fileName = str(body.fileName)?.slice(0, 200);
      const langs = languagesFor(body.language);
      const promptText = `Analyze this sample government document: ${demoKey || fileName || "Document"}.`;

      const scan = await callGroqOCR(promptText, langs);
      if ("status" in scan) return failureResponse(scan);
      return NextResponse.json({ result: normalizeOcrResult(scan.parsed, fileName || "document.pdf", langs), mode: `⚡ Groq Vision AI (${scan.modelName})` });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");
      const langs = languagesFor(formData.get("language"));

      if (file instanceof File) {
        const fileName = (file.name || "uploaded_document").slice(0, 200);
        const lowerName = fileName.toLowerCase();
        const isPdf = lowerName.endsWith(".pdf") || file.type.includes("pdf");
        const limit = isPdf ? MAX_UPLOAD_BYTES : MAX_IMAGE_BYTES;
        if (file.size > limit) {
          return NextResponse.json(
            { error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Please upload ${isPdf ? "a PDF under 4 MB" : "an image under 3 MB"}.` },
            { status: 413 }
          );
        }

        let fileMime = file.type || "image/png";
        if (isPdf) fileMime = "application/pdf";
        else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) fileMime = "image/jpeg";
        else if (lowerName.endsWith(".webp")) fileMime = "image/webp";
        else if (lowerName.endsWith(".png")) fileMime = "image/png";

        if (!isPdf && !SUPPORTED_IMAGE_TYPES.includes(fileMime)) {
          return NextResponse.json(
            { error: "This image format is not supported. Please upload a JPG, PNG or WEBP photo (iPhone HEIC photos: take a screenshot or switch the camera to 'Most Compatible')." },
            { status: 415 }
          );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const extractedText = extractTextFromFileBuffer(buffer);

        let promptText = `Analyze this uploaded document/image file "${fileName}".`;
        if (extractedText && extractedText.length > 10) {
          promptText += `\n\nExtracted text lines from document:\n"${extractedText}"`;
        }

        // Images go to the vision model as base64; a PDF is reduced to its extracted text
        const scan = isPdf
          ? await callGroqOCR(promptText, langs)
          : await callGroqOCR(promptText, langs, buffer.toString("base64"), fileMime);
        if ("status" in scan) return failureResponse(scan);
        return NextResponse.json({ result: normalizeOcrResult(scan.parsed, fileName, langs), mode: `⚡ Groq Vision AI (${scan.modelName})` });
      }
    }

    return NextResponse.json({ error: "No file was received. Please choose a photo or PDF and try again." }, { status: 400 });
  } catch (err) {
    console.warn("OCR request failed:", err);
    return NextResponse.json({ error: "The scan failed. Please try again with a clearer photo or a smaller file." }, { status: 500 });
  }
}

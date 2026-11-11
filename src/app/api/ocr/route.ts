import { NextRequest, NextResponse } from "next/server";
import { LIMITS, rateLimited, requireUser } from "@/lib/apiGuard";
import { groqChat, parseJsonReply, type GroqMessage } from "@/lib/groq";

const OCR_PROMPT_HEADER = `You are an expert universal optical character recognition (OCR) and document analysis AI for Indian farmers and users.
Analyze whatever image or document file is provided.

IMPORTANT MULTILINGUAL REQUIREMENT:
Provide clear explanations in ALL 6 LANGUAGES: English, Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), and Hindi (हिंदी).

Return ONLY a valid JSON object matching this exact structure (do NOT wrap in markdown backticks, just return raw JSON):
{
  "documentType": "Exact Document Category (e.g. Concept Infographic, Soil Test Report, KCC Loan Sanction, Payment Invoice, Government Scheme Notice, Resume, Web Screenshot)",
  "extractedTitle": "Actual Main Heading / Title written in Document",
  "extractedDate": "Issue Date, Period, or Date found in Document",
  "issuerAuthority": "Issuing Department / Organization / Company found in Document",
  
  "whatIsThisEN": "Clear 2-sentence English explanation of what this exact uploaded file or image is.",
  "whatIsThisTA": "தமிழ்: இந்த படம் அல்லது ஆவணம் என்ன என்பதற்கான தெளிவான விளக்கம்.",
  "whatIsThisTE": "తెలుగు: ఈ చిత్రం లేదా పత్రం ఏమిటో స్పష్టమైన వివరణ.",
  "whatIsThisKN": "ಕನ್ನಡ: ಈ ಚಿತ್ರ ಅಥವಾ ದಾಖಲೆ ಏನೆಂಬುದರ ಸ್ಪಷ್ಟ ವಿವರಣೆ.",
  "whatIsThisML": "മലയാളം: ഈ ചിത്രം അല്ലെങ്കിൽ രേഖ എന്താണെന്നതിനെക്കുറിച്ചുള്ള വ്യക്തമായ വിവരണം.",
  "whatIsThisHI": "हिंदी: यह छवि या दस्तावेज़ क्या है इसका स्पष्ट विवरण।",

  "howToUseEN": "Detailed English explanation of what the information inside means and HOW to use it.",
  "howToUseTA": "தமிழ்: இதில் உள்ள தகவல்களை எவ்வாறு பயன்படுத்துவது என்ற விளக்கம்.",
  "howToUseTE": "తెలుగు: ఇందులో ఉన్న సమాచారాన్ని ఎలా ఉపయోగించాలో వివరణ.",
  "howToUseKN": "ಕನ್ನಡ: ಇದರಲ್ಲಿರುವ ಮಾಹಿತಿಯನ್ನು ಹೇಗೆ ಬಳಸುವುದು ಎಂಬ ವಿವರಣೆ.",
  "howToUseML": "മലയാളം: ഇതിലെ വിവരങ്ങൾ എങ്ങനെ ഉപയോഗിക്കാമെന്ന വിവരണം.",
  "howToUseHI": "हिंदी: इसमें दी गई जानकारी का उपयोग कैसे करें इसका विवरण।",

  "summaryEN": "Comprehensive plain English summary of all text, concepts, numbers, and terms inside.",
  "summaryTA": "தமிழ்: ஆவணத்தின் முழுமையான சுருக்கம்.",
  "summaryTE": "తెలుగు: పత్రం యొక్క సమగ్ర సారాంశం.",
  "summaryKN": "ಕನ್ನಡ: ದಾಖಲೆಯ ಸಮಗ್ರ ಸಾರಾಂಶ.",
  "summaryML": "മലയാളം: രേഖയുടെ സമഗ്രമായ സംഗ്രഹം.",
  "summaryHI": "हिंदी: दस्तावेज़ का संपूर्ण सारांश।",

  "actionItemsEN": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "actionItemsTA": ["நடவடிக்கை 1", "நடவடிக்கை 2", "நடவடிக்கை 3", "நடவடிக்கை 4"],
  "actionItemsTE": ["చర్య 1", "చర్య 2", "చర్య 3", "చర్య 4"],
  "actionItemsKN": ["ಕ್ರಮ 1", "ಕ್ರಮ 2", "ಕ್ರಮ 3", "ಕ್ರಮ 4"],
  "actionItemsML": ["നടപടി 1", "നടപടി 2", "നടപടി 3", "നടപടി 4"],
  "actionItemsHI": ["कार्य 1", "कार्य 2", "कार्य 3", "कार्य 4"]
}`;

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

function generateLanguageFallbacks(docType: string, title: string, fileName: string) {
  // Special-case text for the "AI Agriculture Partner" infographic only. Match "AI" as a whole
  // word so titles like "Grain Receipt" or "Domain" don't get the infographic description.
  const haystack = `${fileName} ${docType} ${title}`.toLowerCase();
  const isInfographic = /\bai\b/.test(haystack) && /partner|infographic/.test(haystack);

  let whatTA = `இந்த படம் "${fileName}" (${docType}) பற்றிய விரிவான தகவல்களைக் கொண்டுள்ளது.`;
  let whatTE = `ఈ చిత్రం "${fileName}" (${docType}) గురించిన వివరణాత్మక సమాచారాన్ని కలిగి ఉంది.`;
  let whatKN = `ಈ ಚಿತ್ರ "${fileName}" (${docType}) ಕುರಿತು ವಿವರವಾದ ಮಾಹಿತಿಯನ್ನು ಹೊಂದಿದೆ.`;
  let whatML = `ഈ ചിത്രം "${fileName}" (${docType}) നെക്കുറിച്ചുള്ള വിശദമായ വിവരങ്ങൾ അടങ്ങിയിരിക്കുന്നു.`;
  let whatHI = `यह चित्र "${fileName}" (${docType}) के बारे में विस्तृत जानकारी प्रदान करता है।`;

  let howTA = `பிரித்தெடுக்கப்பட்ட விவரங்கள் மற்றும் வழிகாட்டுதல்களை உங்கள் பதிவுகள் அல்லது அதிகாரப்பூர்வ சரிபார்ப்பிற்கு பயன்படுத்தவும்.`;
  let howTE = `సేకరించిన వివరాలు మరియు మార్గదర్శకాలను మీ రికార్డులు లేదా అధికారిక పరిశీలన కోసం ఉపయోగించండి.`;
  let howKN = `ಸಂಗ್ರಹಿಸಿದ ವಿವರಗಳನ್ನು ನಿಮ್ಮ ದಾಖಲೆಗಳು ಅಥವಾ ಅಧಿಕೃತ ಪರಿಶೀಲನೆಗಾಗಿ ಬಳಸಿ.`;
  let howML = `ശേഖരിച്ച വിവരങ്ങൾ നിങ്ങളുടെ രേഖകൾക്കോ ഔദ്യോഗിക പരിശോധനയ്ക്കോ ഉപയോഗിക്കുക.`;
  let howHI = `निकाले गए विवरण और दिशा-निर्देशों का उपयोग अपने रिकॉर्ड या आधिकारिक सत्यापन के लिए करें।`;

  let sumTA = `பகுப்பாய்வு செய்யப்பட்ட படம் "${fileName}". AI அமைப்புகள் மற்றும் விவசாய முடிவெடுக்கும் தகவல்கள் பெறப்பட்டன.`;
  let sumTE = `విశ్లేషించబడిన చిత్రం "${fileName}". AI వ్యవస్థలు మరియు వ్యవసాయ నిర్ణయాత్మక సమాచారం స్వీకరించబడింది.`;
  let sumKN = `ವಿಶ್ಲೇಷಿಸಿದ ಚಿತ್ರ "${fileName}". AI ವ್ಯವಸ್ಥೆಗಳು ಮತ್ತು ಕೃಷಿ ನಿರ್ಧಾರಗಳ ಮಾಹಿತಿ ದೊರೆತಿದೆ.`;
  let sumML = `വിശകലനം ചെയ്ത ചിത്രം "${fileName}". AI സിസ്റ്റങ്ങളും കാർഷിക തീരുമാനങ്ങളും ലഭിച്ചു.`;
  let sumHI = `विश्लेषित चित्र "${fileName}"। इसमें AI सिस्टम और कृषि निर्णय लेने की जानकारी शामिल है।`;

  const actTA = [
    "அதிகாரப்பூர்வ விவரங்களை கவனமாக மதிப்பாய்வு செய்யவும்.",
    "தகுந்த அதிகாரியிடம் சரிபார்க்கவும்.",
    "நகலை பாதுகாப்பாக வைத்திருக்கவும்.",
    "உள்ளூர் மையத்தை தொடர்பு கொள்ளவும்."
  ];
  const actTE = [
    "అధికారిక వివరాలను జాగ్రత్తగా పరిశీలించండి.",
    "సంబంధిత అధికారితో ధృవీకరించుకోండి.",
    "ప్రతిని సురక్షితంగా ఉంచుకోండి.",
    "స్థానిక కేంద్రాన్ని సంప్రదించండి."
  ];
  const actKN = [
    "ಅಧಿಕೃತ ವಿವರಗಳನ್ನು ಎಚ್ಚರಿಕೆಯಿಂದ ಪರಿಶೀಲಿಸಿ.",
    "ಸಂಬಂಧಿತ ಅಧಿಕಾರಿಯೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.",
    "ಪ್ರತಿಯನ್ನು ಸುರಕ್ಷಿತವಾಗಿರಿಸಿ.",
    "ಸ್ಥಾನಿಕ ಕೇಂದ್ರವನ್ನು ಸಂಪರ್ಕಿಸಿ."
  ];
  const actML = [
    "ഔദ്യോഗിക വിവരങ്ങൾ ശ്രദ്ധാപൂർവ്വം പരിശോധിക്കുക.",
    "ബന്ധപ്പെട്ട ഉദ്യോഗസ്ഥനുമായി സ്ഥിരീകരിക്കുക.",
    "പകർപ്പ് സുരക്ഷിതമായി സൂക്ഷിക്കുക.",
    "പ്രാദേശിക കേന്ദ്രവുമായി ബന്ധപ്പെടുക."
  ];
  const actHI = [
    "आधिकारिक विवरणों की ध्यानपूर्वक समीक्षा करें।",
    "संबंधित अधिकारी से सत्यापन करें।",
    "प्रति सुरक्षित रखें।",
    "स्थानीय केंद्र से संपर्क करें।"
  ];

  if (isInfographic) {
    whatTA = `இந்த படம் செயற்கை நுண்ணறிவு (AI Agriculture Partner) அமைப்பின் கருத்து வரைபடமாகும். விவசாய முடிவுகளை எடுப்பதில் AI எவ்வாறு உதவுகிறது என்பதை இது விளக்குகிறது.`;
    whatTE = `ఈ చిత్రం "AI అగ్రికల్చర్ పార్టనర్" వ్యవస్థ యొక్క కాన్సెప్ట్ ఇన్‌ఫోగ్రాఫిక్. వ్యవసాయ నిర్ణయాలు తీసుకోవడంలో AI ఎలా సహాయపడుతుందో ఇది వివరిస్తుంది.`;
    whatKN = `ಈ ಚಿತ್ರವು "AI ಕೃಷಿ ಪಾಲುದಾರ" ವ್ಯವಸ್ಥೆಯ ಪರಿಕಲ್ಪನೆಯ ಇನ್ಫೋಗ್ರಾಫಿಕ್ ಆಗಿದೆ.`;
    whatML = `ഈ ചിത്രം "AI അഗ്രികൾച്ചർ പാർട്ണർ" സിസ്റ്റത്തിന്റെ ഇൻഫോഗ്രാഫിക് ആണ്.`;
    whatHI = `यह चित्र "AI एग्रीकल्चर पार्टनर" प्रणाली का इन्फोग्राफिक है। यह बताता है कि AI किसानों को निर्णय लेने में कैसे मदद करता है।`;

    howTA = `AI விவசாய தொழில்நுட்பங்கள் மற்றும் ஸ்மார்ட் விவசாய திட்டமிடலுக்கு இந்த தகவல்களைப் பயன்படுத்தவும்.`;
    howTE = `స్మార్ట్ వ్యవసాయ ప్రణాళిక మరియు AI వ్యవసాయ సాంకేతికతల అమలుకు ఈ సమాచారాన్ని ఉపయోగించండి.`;
    howKN = `ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಯೋಜನೆಗೆ ಈ ಮಾಹಿತಿಯನ್ನು ಬಳಸಿ.`;
    howML = `സ്മാർട്ട് കാർഷിക ആസൂത്രണത്തിന് ഈ വിവരങ്ങൾ ഉപയോഗിക്കുക.`;
    howHI = `स्मार्ट कृषि योजना और तकनीक के उपयोग के लिए इस जानकारी का उपयोग करें।`;

    sumTA = `AI அக்ரிகல்ச்சர் பார்ட்னர் படம் பகுப்பாய்வு செய்யப்பட்டது. ஜெனரேட்டிவ் AI மற்றும் ஏஜென்டிக் AI எவ்வாறு விவசாயிகளுக்கு உதவுகிறது என்பது பெறப்பட்டது.`;
    sumTE = `AI అగ్రికల్చర్ పార్టనర్ చిత్రం విశ్లేషించబడింది. ఉత్పాదక AI మరియు ఏజెంటిక్ AI రైతులకు ఎలా సహాయపడతాయో గ్రహించబడింది.`;
    sumKN = `AI ಕೃಷಿ ಪಾಲುದಾರ ಚಿತ್ರ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ.`;
    sumML = `AI അഗ്രികൾച്ചർ പാർട്ണർ ചിത്രം വിശകലനം ചെയ്തു.`;
    sumHI = `AI एग्रीकल्चर पार्टनर चित्र का विश्लेषण किया गया।`;
  }

  return {
    whatTA,
    whatTE,
    whatKN,
    whatML,
    whatHI,
    howTA,
    howTE,
    howKN,
    howML,
    howHI,
    sumTA,
    sumTE,
    sumKN,
    sumML,
    sumHI,
    actTA,
    actTE,
    actKN,
    actML,
    actHI
  };
}

function normalizeOcrResult(raw: RawOcr, fileName: string) {
  const issuingAuthority = raw.issuing_authority as { name?: unknown } | undefined;
  const summary = raw.summary as { text?: unknown } | string | undefined;
  const docType = str(raw.documentType) || str(raw.document_type) || "Analyzed Document";
  const title = str(raw.extractedTitle) || str(raw.title) || str(raw.document_title) || fileName.replace(/\.[^/.]+$/, "");
  const date = str(raw.extractedDate) || str(raw.date) || new Date().toLocaleDateString("en-IN");
  const issuer = str(raw.issuerAuthority) || str(raw.issuer) || str(issuingAuthority?.name) || "Document Issuing Entity";

  const whatIsThisEN = str(raw.whatIsThisEN) || str(raw.whatIsThis) || `This image/file "${fileName}" is an analyzed ${docType}.`;
  const howToUseEN = str(raw.howToUseEN) || str(raw.howToUse) || `Review the extracted details carefully for your official records and farm planning.`;
  const sumEN = str(raw.summaryEN) || str(summary) || (typeof summary === "object" ? str(summary?.text) : undefined) || whatIsThisEN;

  const fallbacks = generateLanguageFallbacks(docType, title, fileName);

  const whatIsThisTA = str(raw.whatIsThisTA) || fallbacks.whatTA;
  const whatIsThisTE = str(raw.whatIsThisTE) || fallbacks.whatTE;
  const whatIsThisKN = str(raw.whatIsThisKN) || fallbacks.whatKN;
  const whatIsThisML = str(raw.whatIsThisML) || fallbacks.whatML;
  const whatIsThisHI = str(raw.whatIsThisHI) || fallbacks.whatHI;

  const howToUseTA = str(raw.howToUseTA) || fallbacks.howTA;
  const howToUseTE = str(raw.howToUseTE) || fallbacks.howTE;
  const howToUseKN = str(raw.howToUseKN) || fallbacks.howKN;
  const howToUseML = str(raw.howToUseML) || fallbacks.howML;
  const howToUseHI = str(raw.howToUseHI) || fallbacks.howHI;

  const sumTA = (str(raw.summaryTA) && !str(raw.summaryTA)!.includes(sumEN)) ? str(raw.summaryTA)! : fallbacks.sumTA;
  const sumTE = (str(raw.summaryTE) && !str(raw.summaryTE)!.includes(sumEN)) ? str(raw.summaryTE)! : fallbacks.sumTE;
  const sumKN = (str(raw.summaryKN) && !str(raw.summaryKN)!.includes(sumEN)) ? str(raw.summaryKN)! : fallbacks.sumKN;
  const sumML = (str(raw.summaryML) && !str(raw.summaryML)!.includes(sumEN)) ? str(raw.summaryML)! : fallbacks.sumML;
  const sumHI = (str(raw.summaryHI) && !str(raw.summaryHI)!.includes(sumEN)) ? str(raw.summaryHI)! : fallbacks.sumHI;

  const actionItemsEN = strList(raw.actionItemsEN) || strList(raw.action_items) || strList(raw.actionItems) || ["Review official details carefully.", "Verify key information.", "Keep copy safe.", "Contact support if needed."];
  const actionItemsTA = strList(raw.actionItemsTA) || fallbacks.actTA;
  const actionItemsTE = strList(raw.actionItemsTE) || fallbacks.actTE;
  const actionItemsKN = strList(raw.actionItemsKN) || fallbacks.actKN;
  const actionItemsML = strList(raw.actionItemsML) || fallbacks.actML;
  const actionItemsHI = strList(raw.actionItemsHI) || fallbacks.actHI;

  return {
    documentType: docType,
    extractedTitle: title,
    extractedDate: date,
    issuerAuthority: issuer,
    whatIsThisEN,
    whatIsThisTA,
    whatIsThisTE,
    whatIsThisKN,
    whatIsThisML,
    whatIsThisHI,
    howToUseEN,
    howToUseTA,
    howToUseTE,
    howToUseKN,
    howToUseML,
    howToUseHI,
    summaryEN: sumEN,
    summaryTA: sumTA,
    summaryTE: sumTE,
    summaryKN: sumKN,
    summaryML: sumML,
    summaryHI: sumHI,
    actionItemsEN,
    actionItemsTA,
    actionItemsTE,
    actionItemsKN,
    actionItemsML,
    actionItemsHI
  };
}

async function callGroqOCR(promptText: string, imageBase64?: string, mimeType?: string) {
  const text = `${OCR_PROMPT_HEADER}\n\n${promptText}`;
  let content: GroqMessage["content"] = text;
  if (imageBase64) {
    const finalMime = mimeType === "image/jpg" ? "image/jpeg" : mimeType || "image/png";
    content = [
      { type: "text", text },
      { type: "image_url", image_url: { url: `data:${finalMime};base64,${imageBase64}` } }
    ];
  }

  // Stay inside the function's maxDuration so the fallback result can still be returned
  const deadline = Date.now() + (maxDuration - 5) * 1000;
  // The reply carries 6 languages and needs ~4k tokens; a lower limit truncates the JSON
  const models = imageBase64 ? [GROQ_VISION_MODEL] : GROQ_TEXT_MODELS;
  for (const [i, modelName] of models.entries()) {
    const remainingMs = deadline - Date.now();
    if (remainingMs < 5000) break;
    // Leave time for the next model if this one hangs
    const isLast = i === models.length - 1;
    const result = await groqChat({
      model: modelName,
      messages: [{ role: "user", content }],
      temperature: 0.1,
      maxTokens: 6000,
      json: true,
      timeoutMs: isLast ? remainingMs : Math.min(remainingMs, 35000)
    });
    if (result.ok) {
      const parsed = parseJsonReply(result.content);
      if (parsed) return { parsed, modelName };
      console.warn(`Groq OCR returned unparseable JSON from ${modelName} (finish: ${result.finishReason})`);
    } else {
      console.warn(`Groq OCR failed for model ${modelName} (status ${result.status}): ${result.error}`);
    }
  }
  return null;
}

function generateSmartDynamicResult(fileName: string) {
  const nameClean = (fileName || "uploaded_scan").replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim();
  const titleFormatted = nameClean.replace(/\b\w/g, (c) => c.toUpperCase());
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  const docType = "Agricultural Document / File";
  const whatIsThisEN = `AI analysis is unavailable right now, so the contents of "${fileName}" could not be read.`;
  const howToUseEN = `Please try scanning again in a few minutes, or show the document at your nearest Krishi Vigyan Kendra or agriculture office.`;
  const sumEN = `No text was extracted from "${fileName}" because the AI scanner could not be reached.`;

  return normalizeOcrResult(
    {
      documentType: docType,
      extractedTitle: titleFormatted,
      extractedDate: today,
      issuerAuthority: "Document Issuing Entity",
      whatIsThisEN,
      howToUseEN,
      summaryEN: sumEN
    },
    fileName
  );
}

export async function GET() {
  const fallback = generateSmartDynamicResult("Sample_Document.pdf");
  return NextResponse.json({ status: "ok", service: "AgriPredict Groq OCR Engine", sample: fallback });
}

export async function POST(req: NextRequest) {
  const blocked = rateLimited(req, LIMITS.ocr) ?? (await requireUser(req));
  if (blocked) return blocked;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = ((await req.json().catch(() => null)) ?? {}) as Record<string, unknown>;
      const demoKey = str(body.demoKey)?.slice(0, 120);
      const fileName = str(body.fileName)?.slice(0, 200);
      const promptText = `Analyze document: ${demoKey || fileName || "Document"}. Provide JSON in EN, TA, TE, KN, ML, HI.`;

      const visionResult = await callGroqOCR(promptText);
      if (visionResult && visionResult.parsed) {
        const normalized = normalizeOcrResult(visionResult.parsed, fileName || "document.pdf");
        return NextResponse.json({ result: normalized, mode: `⚡ Groq Vision AI (${visionResult.modelName})` });
      }

      const fallback = generateSmartDynamicResult(demoKey || fileName || "document.pdf");
      return NextResponse.json({ result: fallback, mode: "dynamic-smart-ocr" });
    }

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (file instanceof File) {
        const fileName = (file.name || "uploaded_document").slice(0, 200);
        const isPdfUpload = fileName.toLowerCase().endsWith(".pdf") || file.type.includes("pdf");
        const limit = isPdfUpload ? MAX_UPLOAD_BYTES : MAX_IMAGE_BYTES;
        if (file.size > limit) {
          return NextResponse.json(
            { error: `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Please upload ${isPdfUpload ? "a PDF under 4 MB" : "an image under 3 MB"}.` },
            { status: 413 }
          );
        }
        const lowerName = fileName.toLowerCase();
        let fileMime = file.type || "image/png";

        if (lowerName.endsWith(".pdf") || fileMime.includes("pdf")) {
          fileMime = "application/pdf";
        } else if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
          fileMime = "image/jpeg";
        } else if (lowerName.endsWith(".webp")) {
          fileMime = "image/webp";
        } else if (lowerName.endsWith(".png")) {
          fileMime = "image/png";
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");
        const extractedText = extractTextFromFileBuffer(buffer);

        let promptText = `Analyze this uploaded document/image file "${fileName}". Return valid JSON matching the schema with whatIsThis, howToUse, summary, and actionItems in ALL 6 LANGUAGES: EN, TA, TE, KN, ML, HI.`;
        if (extractedText && extractedText.length > 10) {
          promptText += `\n\nExtracted text lines from document:\n"${extractedText}"`;
        }

        const isPdf = fileMime === "application/pdf" || lowerName.endsWith(".pdf");
        // For images pass base64 directly to Groq Vision; for PDF pass extracted text
        const visionResult = await callGroqOCR(
          promptText,
          isPdf ? undefined : base64,
          isPdf ? undefined : fileMime
        );

        if (visionResult && visionResult.parsed) {
          const normalized = normalizeOcrResult(visionResult.parsed, fileName);
          return NextResponse.json({ result: normalized, mode: `⚡ Groq Vision AI (${visionResult.modelName})` });
        }

        const fallback = generateSmartDynamicResult(fileName);
        return NextResponse.json({ result: fallback, mode: "dynamic-smart-ocr" });
      }
    }

    const fallback = generateSmartDynamicResult("uploaded_document.pdf");
    return NextResponse.json({ result: fallback, mode: "dynamic-smart-ocr" });
  } catch (err) {
    console.warn("OCR request failed:", err);
    const fallback = generateSmartDynamicResult("uploaded_document.pdf");
    return NextResponse.json({ result: fallback, mode: "dynamic-smart-ocr" });
  }
}

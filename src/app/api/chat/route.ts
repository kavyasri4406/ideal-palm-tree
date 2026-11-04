import { NextRequest, NextResponse } from "next/server";
import { getChatbotResponse, type Language } from "@/lib/chatbot";
import { groqChat, type GroqMessage } from "@/lib/groq";
import { CROPS } from "@/lib/cropData";

const SYSTEM_PROMPT = `You are AgriBot 🌱, an expert AI agriculture assistant helping Indian farmers.
You must speak in the language the user addresses you in: English, Tamil (தமிழ்), Telugu (తెలుగు), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), or Hindi (हिंदी).
If the farmer types in transliterated scripts like Tanglish, Teluglish, Kanglish, or Hinglish (e.g. "paddy rate eshtu ide?", "vana kalam lo e panta vesukovali?"), understand their query naturally and reply in their preferred language!
Provide expert advice about crop choices, schedules, organic/chemical pest and disease management, weather risk mitigation, market prices, MSP, and government schemes.
Make your responses highly structured, premium, and easy to read. Use bullet points and bold formatting where appropriate.
Keep answers concise, actionable, and focused on practical farming solutions.

Current official MSP / FRP figures (₹ per quintal) — Kharif 2026-27, Rabi 2027-28, sugarcane FRP 2026-27.
Always use these exact figures instead of older ones you may remember:
${CROPS.filter(c => c.msp > 0).map(c => `- ${c.name}: ₹${c.msp.toLocaleString("en-IN")}`).join("\n")}
For live mandi prices, tell the farmer to check the Mandi Price Comparison in the app (official Agmarknet data).`;

// Groq AI models, tried in order
const GROQ_CHAT_MODELS = [
  process.env.GROQ_TEXT_MODEL || "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b"
];

const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  hi: "Hindi"
};

const MAX_MESSAGE_CHARS = 2000;

// Seconds; Groq retries across models can take a while (serverless default limits may be lower)
export const maxDuration = 60;

async function callGroqAI(
  userMessage: string,
  userLang: Language,
  history: { role: string; content: string }[]
): Promise<{ content: string; model: string } | null> {
  const messages: GroqMessage[] = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\nThe user's selected language is: ${LANGUAGE_NAMES[userLang]}. Please respond in ${LANGUAGE_NAMES[userLang]} unless they specifically ask in another language.`
    },
    ...history.slice(-6).map((item): GroqMessage => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: String(item.content).slice(0, MAX_MESSAGE_CHARS)
    })),
    { role: "user", content: userMessage }
  ];

  // Stay inside the function's maxDuration so the offline fallback can still answer
  const deadline = Date.now() + (maxDuration - 8) * 1000;
  for (const model of GROQ_CHAT_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const remainingMs = deadline - Date.now();
      if (remainingMs < 3000) return null;
      const result = await groqChat({ model, messages, temperature: 0.3, maxTokens: 2048, timeoutMs: Math.min(30000, remainingMs) });
      if (result.ok) return { content: result.content, model };
      console.warn(`Groq call failed for model ${model} (status ${result.status}): ${result.error}`);
      // A bad key or bad request fails the same way on retry; move on
      if (!result.retryable) break;
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  let userMessage = "hello";
  let userLang: Language = "en";

  try {
    const body = await req.json() as {
      message?: unknown;
      history?: unknown;
      language?: unknown;
    };

    if (typeof body.message === "string" && body.message.trim()) {
      userMessage = body.message.trim().slice(0, MAX_MESSAGE_CHARS);
    }
    if (typeof body.language === "string" && body.language in LANGUAGE_NAMES) {
      userLang = body.language as Language;
    }
    const history = Array.isArray(body.history)
      ? body.history.filter((h): h is { role: string; content: string } =>
          typeof h?.role === "string" && typeof h?.content === "string")
      : [];

    // Primary AI: Groq Cloud AI Engine
    const groqResponse = await callGroqAI(userMessage, userLang, history);
    if (groqResponse) {
      return NextResponse.json({ response: groqResponse.content, mode: `⚡ Groq AI (${groqResponse.model})` });
    }
  } catch (error) {
    console.warn("Chat request failed, using offline AgriBot:", error);
  }

  // Fallback: Local offline AgriBot intelligence engine
  return NextResponse.json({ response: getChatbotResponse(userMessage, userLang), mode: "AgriBot AI Engine" });
}

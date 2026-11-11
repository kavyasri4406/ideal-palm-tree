// Minimal server-side client for Groq's OpenAI-compatible chat completions API

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

export interface GroqRequest {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  maxTokens?: number;
  /** Ask the model for a single JSON object (Groq JSON mode) */
  json?: boolean;
  timeoutMs?: number;
}

export type GroqResult =
  | { ok: true; content: string; finishReason: string }
  // `retryable` is false for errors that will fail the same way again (bad key, bad request)
  | { ok: false; status: number; retryable: boolean; error: string };

export function hasGroqKey(): boolean {
  return !!process.env.GROQ_API_KEY;
}

export async function groqChat(req: GroqRequest): Promise<GroqResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { ok: false, status: 0, retryable: false, error: "GROQ_API_KEY is not set" };

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: req.model,
        messages: req.messages,
        temperature: req.temperature ?? 0.3,
        max_tokens: req.maxTokens ?? 1024,
        ...(req.json ? { response_format: { type: "json_object" } } : {})
      }),
      signal: AbortSignal.timeout(req.timeoutMs ?? 30000)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const retryable = res.status === 408 || res.status === 429 || res.status >= 500;
      return { ok: false, status: res.status, retryable, error: text.slice(0, 300) };
    }

    const data = await res.json();
    const choice = data.choices?.[0];
    // Reasoning models (e.g. Qwen3) may prefix the answer with a <think>…</think> block. An
    // unclosed block (output truncated mid-reasoning) is only stripped when it leads the reply,
    // so a literal "<think>" later in a real answer can't swallow the rest of it.
    const content = typeof choice?.message?.content === "string"
      ? choice.message.content.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/^\s*<think>[\s\S]*$/, "").trim()
      : "";
    if (!content) return { ok: false, status: res.status, retryable: true, error: "Empty response" };
    return { ok: true, content, finishReason: choice.finish_reason ?? "" };
  } catch (err) {
    // Network failure or timeout
    return { ok: false, status: 0, retryable: true, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Parses a JSON object from a model reply, tolerating ```json fences. */
export function parseJsonReply(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/```(?:json)?\s*/g, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Seconds from Groq's "Please try again in 45.48s" / "1m5.2s" / "850ms" rate-limit message. */
export function parseRetryAfter(message: string): number | undefined {
  const m = /try again in\s+(?:(\d+)m)?\s*([\d.]+)\s*(ms|s)\b/i.exec(message);
  if (!m) return undefined;
  const value = parseFloat(m[2]) / (m[3].toLowerCase() === "ms" ? 1000 : 1);
  return Math.ceil((m[1] ? parseInt(m[1], 10) * 60 : 0) + value);
}

// Server-side guards for API routes: per-IP rate limits and Supabase sign-in checks, so the
// routes that spend Groq quota can't be called by anyone who finds the URL.

import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, type RateLimiter } from "@/lib/rateLimit";

const MINUTE = 60 * 1000;

// Requests per minute from one IP address
export const LIMITS = {
  chat: createRateLimiter(20, MINUTE),
  ocr: createRateLimiter(6, MINUTE),
  mandiPrices: createRateLimiter(40, MINUTE),
  priceHistory: createRateLimiter(40, MINUTE),
};

const TOKEN_CACHE_MS = 5 * MINUTE;
const MAX_CACHED_TOKENS = 1000;
const verifiedTokens = new Map<string, { userId: string; until: number }>();

export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || req.headers.get("x-real-ip") || "unknown";
}

/** Returns a 429 response when this IP is over the limit, otherwise null. */
export function rateLimited(req: NextRequest, limiter: RateLimiter): NextResponse | null {
  const result = limiter.check(clientIp(req));
  if (result.allowed) return null;
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
  );
}

/**
 * Checks the request carries a valid Supabase session (Authorization: Bearer <access token>).
 * Returns a 401/503 response to send back, or null when the caller may proceed.
 * When Supabase isn't configured, accounts exist only in the browser and the server has nothing
 * to verify, so the check is skipped and the rate limit is the only protection.
 */
export async function requireUser(req: NextRequest): Promise<NextResponse | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const token = /^Bearer\s+(.+)$/i.exec(req.headers.get("authorization") || "")?.[1];
  if (!token) return NextResponse.json({ error: "Please sign in to use this feature." }, { status: 401 });

  const now = Date.now();
  const cached = verifiedTokens.get(token);
  if (cached && cached.until > now) return null;

  try {
    const res = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: key, Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
    }
    const user = res.ok ? await res.json() : null;
    if (typeof user?.id !== "string") throw new Error(`Supabase auth HTTP ${res.status}`);
    if (verifiedTokens.size >= MAX_CACHED_TOKENS) verifiedTokens.clear();
    verifiedTokens.set(token, { userId: user.id, until: now + TOKEN_CACHE_MS });
    return null;
  } catch (err) {
    console.warn("Could not verify sign-in:", err);
    return NextResponse.json({ error: "Could not verify your sign-in. Please try again." }, { status: 503 });
  }
}

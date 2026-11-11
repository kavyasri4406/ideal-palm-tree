// Fixed-window rate limiter kept in memory. Pure (no imports) so it can be unit-tested.
// Limits are per server instance: on serverless hosting each warm instance counts separately,
// so treat this as a cap on abuse, not an exact quota.

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string, now?: number): RateLimitResult;
  size(): number;
}

const MAX_TRACKED_KEYS = 5000;

export function createRateLimiter(limit: number, windowMs: number): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();

  function prune(now: number) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) hits.delete(key);
    }
    // Still full of live windows: drop the oldest entries so memory stays bounded
    for (const key of hits.keys()) {
      if (hits.size < MAX_TRACKED_KEYS) break;
      hits.delete(key);
    }
  }

  return {
    check(key, now = Date.now()) {
      let entry = hits.get(key);
      if (!entry || entry.resetAt <= now) {
        if (hits.size >= MAX_TRACKED_KEYS) prune(now);
        entry = { count: 0, resetAt: now + windowMs };
        hits.set(key, entry);
      }
      if (entry.count >= limit) {
        return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
      }
      entry.count++;
      return { allowed: true, remaining: limit - entry.count, retryAfterSeconds: 0 };
    },
    size: () => hits.size,
  };
}

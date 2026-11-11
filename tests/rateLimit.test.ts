import { test } from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter } from "../src/lib/rateLimit.ts";

test("allows up to the limit, then blocks until the window resets", () => {
  const limiter = createRateLimiter(3, 60_000);
  const t0 = 1_000_000;
  assert.deepEqual(limiter.check("ip", t0), { allowed: true, remaining: 2, retryAfterSeconds: 0 });
  assert.equal(limiter.check("ip", t0 + 1).allowed, true);
  assert.equal(limiter.check("ip", t0 + 2).remaining, 0);

  const blocked = limiter.check("ip", t0 + 30_000);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 30);

  assert.equal(limiter.check("ip", t0 + 60_000).allowed, true);
});

test("counts each key separately", () => {
  const limiter = createRateLimiter(1, 60_000);
  assert.equal(limiter.check("a", 0).allowed, true);
  assert.equal(limiter.check("a", 1).allowed, false);
  assert.equal(limiter.check("b", 1).allowed, true);
});

test("blocked requests do not extend the window", () => {
  const limiter = createRateLimiter(1, 10_000);
  limiter.check("ip", 0);
  for (let t = 1000; t < 10_000; t += 1000) assert.equal(limiter.check("ip", t).allowed, false);
  assert.equal(limiter.check("ip", 10_000).allowed, true);
});

test("memory stays bounded when many different keys arrive", () => {
  const limiter = createRateLimiter(5, 60_000);
  for (let i = 0; i < 12_000; i++) limiter.check(`ip-${i}`, i);
  assert.ok(limiter.size() <= 5000, `tracked ${limiter.size()} keys`);
});

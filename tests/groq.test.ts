import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRetryAfter, parseJsonReply } from "../src/lib/groq.ts";

test("parseRetryAfter reads Groq's rate-limit messages", () => {
  assert.equal(parseRetryAfter("Rate limit reached ... Please try again in 45.48s. Need more tokens?"), 46);
  assert.equal(parseRetryAfter("Please try again in 16.342499999s."), 17);
  assert.equal(parseRetryAfter("Please try again in 1m5.2s."), 66);
  assert.equal(parseRetryAfter("Please try again in 850ms."), 1);
  assert.equal(parseRetryAfter("Something else went wrong"), undefined);
});

test("parseJsonReply tolerates code fences and surrounding text", () => {
  assert.deepEqual(parseJsonReply('```json\n{"a": 1}\n```'), { a: 1 });
  assert.deepEqual(parseJsonReply('Here you go: {"a": {"b": 2}} thanks'), { a: { b: 2 } });
  assert.equal(parseJsonReply("no json here"), null);
});

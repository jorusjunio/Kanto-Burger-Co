import assert from "node:assert/strict";
import test from "node:test";

import { signIntent, verifyIntentSignature } from "./signing";

const SECRET = "test-signing-secret";

test("a signature verifies against the same intent id and secret", () => {
  const intentId = "mock_KBC-1001_abcdef123456";
  const signature = signIntent(intentId, SECRET);

  assert.equal(verifyIntentSignature(intentId, signature, SECRET), true);
});

test("signing is deterministic for the same input", () => {
  assert.equal(signIntent("intent-x", SECRET), signIntent("intent-x", SECRET));
});

test("a tampered intent id fails verification", () => {
  const signature = signIntent("intent-original", SECRET);

  assert.equal(
    verifyIntentSignature("intent-tampered", signature, SECRET),
    false,
  );
});

test("a wrong secret fails verification", () => {
  const intentId = "intent-y";
  const signature = signIntent(intentId, SECRET);

  assert.equal(
    verifyIntentSignature(intentId, signature, "different-secret"),
    false,
  );
});

test("a malformed signature is rejected without throwing", () => {
  assert.equal(verifyIntentSignature("intent-z", "not-a-real-sig", SECRET), false);
  assert.equal(verifyIntentSignature("intent-z", "", SECRET), false);
});

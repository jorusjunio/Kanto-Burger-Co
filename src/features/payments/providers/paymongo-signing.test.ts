import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";

import { verifyPaymongoSignature } from "./paymongo-signing";

const SECRET = "test-webhook-secret";

function header(rawBody: string, secret: string, timestamp = "1700000000") {
  const digest = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  return `t=${timestamp},te=${digest}`;
}

test("a valid test-mode signature verifies", () => {
  const rawBody = JSON.stringify({ data: { id: "evt_1" } });
  assert.equal(
    verifyPaymongoSignature(rawBody, header(rawBody, SECRET), SECRET),
    true,
  );
});

test("accepts the live signature field when that's the one present", () => {
  const rawBody = JSON.stringify({ data: { id: "evt_2" } });
  const timestamp = "1700000000";
  const digest = crypto
    .createHmac("sha256", SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  assert.equal(
    verifyPaymongoSignature(rawBody, `t=${timestamp},li=${digest}`, SECRET),
    true,
  );
});

test("a tampered body fails verification", () => {
  const rawBody = JSON.stringify({ data: { id: "evt_3" } });
  const sig = header(rawBody, SECRET);

  assert.equal(
    verifyPaymongoSignature(JSON.stringify({ data: { id: "evt_tampered" } }), sig, SECRET),
    false,
  );
});

test("a wrong secret fails verification", () => {
  const rawBody = JSON.stringify({ data: { id: "evt_4" } });
  const sig = header(rawBody, SECRET);

  assert.equal(verifyPaymongoSignature(rawBody, sig, "different-secret"), false);
});

test("a missing or malformed header is rejected without throwing", () => {
  const rawBody = "{}";
  assert.equal(verifyPaymongoSignature(rawBody, null, SECRET), false);
  assert.equal(verifyPaymongoSignature(rawBody, "not-a-real-header", SECRET), false);
  assert.equal(verifyPaymongoSignature(rawBody, "t=1700000000", SECRET), false);
});

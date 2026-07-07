import crypto from "node:crypto";

import { getRequiredEnv } from "@/server/env";

/**
 * HMAC-SHA256 over the payment intent id. Proves a settlement callback
 * originated from a session we created — a customer can't POST a forged
 * "paid" for their own order without a valid signature. The secret is
 * injectable so unit tests don't depend on env.
 */
export function signIntent(
  intentId: string,
  secret: string = getRequiredEnv("PAYMENT_SIGNING_SECRET"),
): string {
  return crypto.createHmac("sha256", secret).update(intentId).digest("hex");
}

export function verifyIntentSignature(
  intentId: string,
  signature: string,
  secret: string = getRequiredEnv("PAYMENT_SIGNING_SECRET"),
): boolean {
  const expected = signIntent(intentId, secret);
  const expectedBuffer = Buffer.from(expected, "utf8");
  const providedBuffer = Buffer.from(signature, "utf8");

  // Length check first: timingSafeEqual throws on length mismatch.
  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

import crypto from "node:crypto";

type ParsedSignatureHeader = {
  timestamp: string;
  testSignature?: string;
  liveSignature?: string;
};

function parseSignatureHeader(header: string): ParsedSignatureHeader | null {
  const parts: Record<string, string> = {};

  for (const segment of header.split(",")) {
    const [key, value] = segment.split("=");
    if (key && value) parts[key] = value;
  }

  if (!parts.t) return null;

  return {
    timestamp: parts.t,
    testSignature: parts.te,
    liveSignature: parts.li,
  };
}

/**
 * Verifies PayMongo's `Paymongo-Signature` webhook header: HMAC-SHA256 over
 * `${timestamp}.${rawBody}` using the webhook's signing secret. The header
 * carries both a test (`te`) and live (`li`) digest; whichever one matches
 * depends on which secret this endpoint was registered with, so we accept
 * either matching the provided secret. `rawBody` must be the exact bytes
 * PayMongo sent, read before any JSON.parse, because re-serializing changes
 * the digest.
 */
export function verifyPaymongoSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader) return false;

  const parsed = parseSignatureHeader(signatureHeader);
  if (!parsed) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${parsed.timestamp}.${rawBody}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");

  for (const candidate of [parsed.testSignature, parsed.liveSignature]) {
    if (!candidate) continue;

    const candidateBuffer = Buffer.from(candidate, "utf8");
    if (
      expectedBuffer.length === candidateBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, candidateBuffer)
    ) {
      return true;
    }
  }

  return false;
}

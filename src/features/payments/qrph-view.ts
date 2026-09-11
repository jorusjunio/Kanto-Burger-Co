export type QrViewState = "active" | "confirming" | "expired" | "unavailable";

/**
 * PayMongo flips an expired intent back to `awaiting_payment_method` a moment
 * after `expires_at`. Waiting a little before calling it expired means
 * "Generate a new QR" mints a fresh code instead of resuming the dying one.
 */
export const EXPIRY_GRACE_MS = 10_000;

/** Which screen the QR Ph gateway should show. `now` is null until the
 *  component mounts, so the server render never depends on the clock. */
export function getQrViewState(input: {
  status: string;
  hasQrImage: boolean;
  expiresAtMs: number | null;
  now: number | null;
}): QrViewState {
  // Paid at PayMongo but our webhook hasn't settled the order yet.
  if (input.status === "processing" || input.status === "succeeded") {
    return "confirming";
  }

  if (input.status === "awaiting_payment_method") {
    return "expired";
  }

  if (
    input.expiresAtMs !== null &&
    input.now !== null &&
    input.now >= input.expiresAtMs + EXPIRY_GRACE_MS
  ) {
    return "expired";
  }

  if (input.status === "awaiting_next_action" && input.hasQrImage) {
    return "active";
  }

  return "unavailable";
}

/** `m:ss` countdown, clamped at zero. */
export function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

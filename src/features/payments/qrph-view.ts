export type QrViewState = "active" | "confirming" | "expired" | "unavailable";

/**
 * Grace period past `expires_at` before a QR counts as expired, so a payment
 * scanned in the last second has time to show up as processing first.
 */
export const EXPIRY_GRACE_MS = 10_000;

/**
 * True once a QR Ph code can no longer be paid. PayMongo's intent status is
 * not enough on its own: in practice it can stay `awaiting_next_action` long
 * after `expires_at`, so the timestamp is checked too. Shared by the pay page
 * and `resumeSession`, which must agree, or "Generate a new QR" would hand
 * back the same dead code.
 */
export function hasQrExpired(input: {
  status: string;
  expiresAtMs: number | null;
  now: number | null;
}): boolean {
  if (input.status === "awaiting_payment_method") {
    return true;
  }

  return (
    input.status === "awaiting_next_action" &&
    input.expiresAtMs !== null &&
    input.now !== null &&
    input.now >= input.expiresAtMs + EXPIRY_GRACE_MS
  );
}

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

  if (hasQrExpired(input)) {
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

export type PaymentOutcome = "SUCCEEDED" | "FAILED";

export interface CreatePaymentSessionInput {
  orderId: string;
  orderNumber: string;
  trackingToken: string;
  /** Order total in currency units (e.g. PHP). Amount is always re-read from
   *  the DB server-side — never trusted from the client. */
  amount: number;
}

export interface PaymentSession {
  /** Provider's intent/session id — persisted on the order and used as the
   *  idempotency key for settlement callbacks. */
  intentId: string;
  /** Where the customer is sent to complete payment. */
  redirectUrl: string;
}

export interface PaymentCallback {
  intentId: string;
  outcome: PaymentOutcome;
}

/**
 * Contract every payment provider implements. Swapping Mock → Maya/Stripe/
 * Xendit means adding one file that satisfies this interface; no checkout or
 * order-page code changes.
 */
export interface PaymentProvider {
  readonly id: string;
  createSession(input: CreatePaymentSessionInput): Promise<PaymentSession>;
  /** Normalize a provider-specific webhook body into a PaymentCallback. */
  parseCallback(payload: unknown): PaymentCallback;
  /**
   * Re-open an existing session so a customer can finish paying an order they
   * abandoned. Returns null when the session is gone (expired, consumed) and
   * the caller should mint a fresh one instead — minting unconditionally would
   * orphan a still-payable session, and a payment against it could no longer
   * be matched back to the order.
   */
  resumeSession(intentId: string): Promise<PaymentSession | null>;
}

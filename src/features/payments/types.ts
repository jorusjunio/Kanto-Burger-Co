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
}

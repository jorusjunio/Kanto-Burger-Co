import { z } from "zod";

import type {
  CreatePaymentSessionInput,
  PaymentProvider,
  PaymentSession,
  PaymentCallback,
} from "../types";

const callbackSchema = z.object({
  intentId: z.string().min(1),
  outcome: z.enum(["SUCCEEDED", "FAILED"]),
});

/**
 * Simulated payment gateway. `createSession` mints an intent id and points the
 * customer at our local mock gateway screen (Pay / Simulate failure). A real
 * provider would call its API here and return a hosted checkout URL instead —
 * same interface, so nothing downstream changes.
 */
export const mockPaymentProvider: PaymentProvider = {
  id: "mock",

  async createSession(
    input: CreatePaymentSessionInput,
  ): Promise<PaymentSession> {
    const intentId = `mock_${input.orderNumber}_${crypto
      .randomUUID()
      .replaceAll("-", "")
      .slice(0, 12)}`;

    return {
      intentId,
      redirectUrl: `/checkout/pay/${encodeURIComponent(intentId)}`,
    };
  },

  parseCallback(payload: unknown): PaymentCallback {
    return callbackSchema.parse(payload);
  },
};

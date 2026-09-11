import { z } from "zod";

import { getRequiredEnv } from "@/server/env";

import { hasQrExpired } from "../qrph-view";
import type {
  CreatePaymentSessionInput,
  PaymentCallback,
  PaymentProvider,
  PaymentSession,
} from "../types";

const PAYMONGO_API_BASE = "https://api.paymongo.com/v1";

export class PaymongoApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

function authHeader(): string {
  const secretKey = getRequiredEnv("PAYMONGO_SECRET_KEY");
  return `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`;
}

const errorResponseSchema = z.object({
  errors: z.array(z.object({ detail: z.string() })).nonempty(),
});

function extractErrorDetail(json: unknown): string | null {
  const parsed = errorResponseSchema.safeParse(json);
  return parsed.success ? parsed.data.errors[0].detail : null;
}

async function paymongoRequest(
  method: "GET" | "POST",
  path: string,
  attributes?: Record<string, unknown>,
): Promise<unknown> {
  const response = await fetch(`${PAYMONGO_API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: attributes ? JSON.stringify({ data: { attributes } }) : undefined,
  });

  const json: unknown = await response.json();

  if (!response.ok) {
    const message = extractErrorDetail(json) ?? `PayMongo request to ${path} failed (${response.status}).`;
    throw new PaymongoApiError(message, response.status);
  }

  return json;
}

const paymentIntentResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    attributes: z.object({
      client_key: z.string(),
    }),
  }),
});

const paymentMethodResponseSchema = z.object({
  data: z.object({ id: z.string() }),
});

const attachResponseSchema = z.object({
  data: z.object({
    attributes: z.object({
      status: z.string(),
      next_action: z
        .object({
          code: z
            .object({
              image_url: z.string().optional(),
              // Only present with a sandbox (sk_test_) key. It points to
              // PayMongo's hosted Authorize/Fail simulator. The real QR
              // image is a live P2M code that a real wallet app WILL settle,
              // so this must take priority whenever it's present.
              test_url: z.string().optional(),
              expires_at: z.string().optional(),
            })
            .optional(),
        })
        .nullable()
        .optional(),
    }),
  }),
});

const paymentEventSchema = z.object({
  data: z.object({
    attributes: z.object({
      type: z.enum(["payment.paid", "payment.failed"]),
      data: z.object({
        attributes: z.object({
          // Present when the payment came from a Payment Intent flow (QR Ph,
          // cards). Absent (source present instead) for the e-wallet Source
          // flow (GCash), kept for when that channel is verified/enabled.
          payment_intent_id: z.string().nullable().optional(),
          source: z.object({ id: z.string() }).nullable().optional(),
        }),
      }),
    }),
  }),
});

const eventTypeSchema = z.object({
  data: z.object({ attributes: z.object({ type: z.string() }) }),
});

/**
 * Real PayMongo gateway. Uses QR Ph (dynamic, single-use QR code) rather than
 * a GCash e-wallet Source: GCash-as-a-channel is gated behind PayMongo
 * business verification, but QR Ph is active immediately and any QR Ph-
 * capable app (including GCash) can scan it. Flow:
 *  1. Create a Payment Intent for the order total.
 *  2. Create a "qrph" Payment Method (billing details are optional).
 *  3. Attach the method to the intent. The response carries a QR code image
 *     (`next_action.code.image_url`) instead of a redirect URL, so our own
 *     `/checkout/pay/[intentId]` page renders it and polls for settlement.
 * Settlement still arrives as `payment.paid`/`payment.failed` webhooks, same
 * as the Source flow, so `parseCallback` and `settlePaymentWithDeps` are
 * unchanged.
 */
export const paymongoPaymentProvider: PaymentProvider = {
  id: "paymongo",

  async createSession(
    input: CreatePaymentSessionInput,
  ): Promise<PaymentSession> {
    const amountCentavos = Math.round(input.amount * 100);

    const intentJson = await paymongoRequest("POST", "/payment_intents", {
      amount: amountCentavos,
      currency: "PHP",
      payment_method_allowed: ["qrph"],
      description: `Order ${input.orderNumber}`,
    });
    const intent = paymentIntentResponseSchema.parse(intentJson);

    const methodJson = await paymongoRequest("POST", "/payment_methods", {
      type: "qrph",
    });
    const method = paymentMethodResponseSchema.parse(methodJson);

    await paymongoRequest("POST", `/payment_intents/${intent.data.id}/attach`, {
      payment_method: method.data.id,
      client_key: intent.data.attributes.client_key,
    });

    return {
      intentId: intent.data.id,
      redirectUrl: `/checkout/pay/${encodeURIComponent(intent.data.id)}`,
    };
  },

  parseCallback(payload: unknown): PaymentCallback {
    const parsed = paymentEventSchema.parse(payload);
    const event = parsed.data.attributes;
    const attrs = event.data.attributes;
    const intentId = attrs.payment_intent_id ?? attrs.source?.id;

    if (!intentId) {
      throw new Error("PayMongo payment event missing both payment_intent_id and source id.");
    }

    return {
      intentId,
      outcome: event.type === "payment.paid" ? "SUCCEEDED" : "FAILED",
    };
  },

  async resumeSession(intentId: string): Promise<PaymentSession | null> {
    try {
      // Only a QR that can no longer be paid gets replaced. A live one, or a
      // payment still processing or already succeeded but not yet settled by
      // the webhook, resumes the same intent so the customer can't pay twice.
      const { expired } = await getQrPhStatus(intentId);
      if (expired) return null;
    } catch (error) {
      // 404: the intent doesn't exist under the current key (e.g. created in
      // the other test/live mode), so treat it as gone. Anything else is
      // rethrown: minting a replacement during an outage could orphan a QR
      // the customer can still pay.
      if (error instanceof PaymongoApiError && error.status === 404) return null;
      throw error;
    }

    return {
      intentId,
      redirectUrl: `/checkout/pay/${encodeURIComponent(intentId)}`,
    };
  },
};

/** Reads just the event type, used by the webhook route to branch before
 *  picking the right schema to parse the rest of the payload with. */
export function getPaymongoEventType(payload: unknown): string | null {
  const parsed = eventTypeSchema.safeParse(payload);
  return parsed.success ? parsed.data.data.attributes.type : null;
}

/** Current status + QR code image (base64) for a Payment Intent, fetched
 *  fresh so the pay page always renders the live state. In sandbox, PayMongo
 *  also returns `testUrl` (its hosted Authorize/Fail simulator), which the
 *  pay page must prefer over the raw QR image: that image is a real P2M QR
 *  code that a real wallet app WILL attempt to settle even with a test key. */
export async function getQrPhStatus(paymentIntentId: string): Promise<{
  status: string;
  qrImageUrl: string | null;
  testUrl: string | null;
  expiresAt: string | null;
  /** The code can no longer be paid (see hasQrExpired), judged at fetch time
   *  so callers, including render code, never need to read the clock. */
  expired: boolean;
}> {
  const json = await paymongoRequest("GET", `/payment_intents/${paymentIntentId}`);
  const parsed = attachResponseSchema.parse(json);
  const status = parsed.data.attributes.status;
  const code = parsed.data.attributes.next_action?.code;
  const expiresAt = code?.expires_at ?? null;

  return {
    status,
    qrImageUrl: code?.image_url ?? null,
    testUrl: code?.test_url ?? null,
    expiresAt,
    expired: hasQrExpired({
      status,
      expiresAtMs: expiresAt ? Date.parse(expiresAt) : null,
      now: Date.now(),
    }),
  };
}

const chargeableSourceSchema = z.object({
  data: z.object({
    attributes: z.object({
      data: z.object({
        id: z.string(),
        attributes: z.object({ amount: z.number() }),
      }),
    }),
  }),
});

/** Extracts the source id + amount (centavos) from a `source.chargeable` event
 *  (only relevant once the GCash e-wallet Source channel is verified). */
export function getChargeableSource(
  payload: unknown,
): { id: string; amountCentavos: number } | null {
  const parsed = chargeableSourceSchema.safeParse(payload);
  if (!parsed.success) return null;

  const source = parsed.data.data.attributes.data;
  return { id: source.id, amountCentavos: source.attributes.amount };
}

/**
 * Step 2 of the GCash Source flow: once a Source is `chargeable`, actually
 * charge it by creating a Payment against it. Unused while GCash is gated
 * behind business verification, but kept ready: PayMongo rejects a second
 * charge attempt on an already-used source, so a retried webhook is safe.
 */
export async function chargeSource(
  sourceId: string,
  amountCentavos: number,
): Promise<void> {
  await paymongoRequest("POST", "/payments", {
    amount: amountCentavos,
    currency: "PHP",
    source: { id: sourceId, type: "source" },
  });
}

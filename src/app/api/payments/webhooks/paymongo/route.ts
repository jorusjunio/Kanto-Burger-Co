import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { settlePaymentWithDeps } from "@/features/payments/actions";
import {
  chargeSource,
  getChargeableSource,
  getPaymongoEventType,
  paymongoPaymentProvider,
} from "@/features/payments/providers/paymongo";
import { verifyPaymongoSignature } from "@/features/payments/providers/paymongo-signing";
import { getRequiredEnv } from "@/server/env";
import { prisma } from "@/server/db/prisma";
import { triggerRealtimeEvent } from "@/server/services/pusher";
import { logger } from "@/lib/logger";

/**
 * PayMongo webhook. GCash settles in two steps:
 *  1. `source.chargeable` — the customer paid at PayMongo's checkout; we turn
 *     the source into an actual Payment via `chargeSource`.
 *  2. `payment.paid` / `payment.failed` — the real settlement, handed to the
 *     same idempotent `settlePaymentWithDeps` the mock gateway uses.
 * Every other event type is acknowledged and ignored.
 */
export async function POST(request: Request) {
  // Read the raw body first — signature verification needs the exact bytes
  // PayMongo sent, before any JSON.parse/reserialize round-trip.
  const rawBody = await request.text();

  const secret = getRequiredEnv("PAYMONGO_WEBHOOK_SECRET");
  const signatureHeader = request.headers.get("paymongo-signature");

  if (!verifyPaymongoSignature(rawBody, signatureHeader, secret)) {
    logger.warn("Rejected PayMongo webhook with invalid signature");
    return NextResponse.json(
      { ok: false, message: "Invalid signature." },
      { status: 401 },
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  const eventType = getPaymongoEventType(payload);

  if (eventType === "source.chargeable") {
    const source = getChargeableSource(payload);
    if (!source) {
      logger.error("Malformed source.chargeable payload", null);
      return NextResponse.json({ ok: false, message: "Malformed payload." }, { status: 400 });
    }

    try {
      await chargeSource(source.id, source.amountCentavos);
    } catch (error) {
      logger.error("Failed to charge PayMongo source", error, { sourceId: source.id });
    }

    return NextResponse.json({ ok: true });
  }

  if (eventType !== "payment.paid" && eventType !== "payment.failed") {
    return NextResponse.json({ ok: true });
  }

  const callback = paymongoPaymentProvider.parseCallback(payload);

  const result = await settlePaymentWithDeps(callback, {
    prisma,
    revalidatePath,
    triggerRealtimeEvent,
  });

  if (!result.ok) {
    return NextResponse.json(result, { status: 404 });
  }

  return NextResponse.json(result);
}

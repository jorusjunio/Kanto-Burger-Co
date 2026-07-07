import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { settlePaymentWithDeps } from "@/features/payments/actions";
import { paymentProvider } from "@/features/payments/provider";
import { verifyIntentSignature } from "@/features/payments/signing";
import { prisma } from "@/server/db/prisma";
import { triggerRealtimeEvent } from "@/server/services/pusher";
import { logger } from "@/lib/logger";
import { paymentCallbackRateLimiter } from "@/lib/rate-limiter";

const bodySchema = z.object({
  intentId: z.string().min(1),
  outcome: z.enum(["SUCCEEDED", "FAILED"]),
  signature: z.string().min(1),
});

/**
 * Payment settlement webhook. In production this is what the gateway calls; in
 * the simulation the mock gateway screen posts here. Verifies the HMAC over the
 * intent id before doing any state change, then hands off to the idempotent
 * settlement action.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const { intentId, outcome, signature } = parsed.data;

  const rate = await paymentCallbackRateLimiter.check(intentId);
  if (!rate.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many attempts." },
      { status: 429 },
    );
  }

  if (!verifyIntentSignature(intentId, signature)) {
    logger.warn("Rejected payment callback with invalid signature", { intentId });
    return NextResponse.json(
      { ok: false, message: "Invalid signature." },
      { status: 401 },
    );
  }

  // Normalize through the active provider, then settle.
  const callback = paymentProvider.parseCallback({ intentId, outcome });

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

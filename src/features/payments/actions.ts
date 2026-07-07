import type { Order, Prisma } from "@/generated/prisma/client";
import { PaymentStatus } from "@/generated/prisma/enums";
import { logger } from "@/lib/logger";

import { assertCanSettleToPaid, isAlreadyPaid } from "./lifecycle";
import type { PaymentOutcome } from "./types";

type SettleOrderSnapshot = Pick<
  Order,
  "id" | "orderNumber" | "trackingToken" | "paymentMethod" | "paymentStatus"
>;

type SettleUpdatePayload = Pick<
  Order,
  "id" | "orderNumber" | "trackingToken" | "status" | "paymentStatus"
>;

/**
 * Narrow, injectable dependencies — mirrors the DI pattern in
 * `admin/orders/action-handlers.ts` so settlement is testable without a live DB.
 */
export type SettlePaymentDeps = {
  prisma: {
    order: {
      findUnique: (
        args: Prisma.OrderFindUniqueArgs,
      ) => Promise<SettleOrderSnapshot | null>;
      update: (args: Prisma.OrderUpdateArgs) => Promise<SettleUpdatePayload>;
    };
  };
  revalidatePath: (path: string) => void;
  triggerRealtimeEvent: (
    channel: string,
    event: string,
    payload: Record<string, unknown>,
  ) => Promise<void>;
};

export type SettlePaymentInput = {
  intentId: string;
  outcome: PaymentOutcome;
};

export type SettlePaymentResult =
  | {
      ok: true;
      paymentStatus: PaymentStatus;
      orderNumber: string;
      trackingToken: string;
    }
  | { ok: false; message: string };

async function emitOrderUpdated(
  deps: SettlePaymentDeps,
  order: SettleUpdatePayload,
) {
  deps.revalidatePath("/admin/orders");
  deps.revalidatePath("/admin/reports");
  deps.revalidatePath(`/order/${order.orderNumber}`);

  const payload = {
    id: order.id,
    orderNumber: order.orderNumber,
    trackingToken: order.trackingToken,
    status: order.status,
    paymentStatus: order.paymentStatus,
    timestamp: Date.now(),
  };

  try {
    // Reuse the exact channels the admin dashboard + customer tracker listen on.
    await deps.triggerRealtimeEvent("admin-orders", "order-updated", payload);
    await deps.triggerRealtimeEvent(
      `order-${order.trackingToken}`,
      "order-updated",
      payload,
    );
  } catch (error) {
    logger.error("Failed to emit payment settlement events", error, {
      orderNumber: order.orderNumber,
    });
  }
}

/**
 * Settle a payment from a verified gateway callback. Idempotent: keyed on the
 * unique paymentIntentId, a repeated SUCCEEDED callback on an already-PAID order
 * is a no-op. A FAILED outcome leaves the order PENDING so it can be retried.
 */
export async function settlePaymentWithDeps(
  input: SettlePaymentInput,
  deps: SettlePaymentDeps,
): Promise<SettlePaymentResult> {
  const order = await deps.prisma.order.findUnique({
    where: { paymentIntentId: input.intentId },
    select: {
      id: true,
      orderNumber: true,
      trackingToken: true,
      paymentMethod: true,
      paymentStatus: true,
    },
  });

  if (!order) {
    return { ok: false, message: "Payment session not found." };
  }

  // Failure: keep it PENDING (retryable), no state change.
  if (input.outcome === "FAILED") {
    return {
      ok: true,
      paymentStatus: order.paymentStatus,
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
    };
  }

  // Idempotent success: already settled, nothing to do.
  if (isAlreadyPaid(order)) {
    return {
      ok: true,
      paymentStatus: PaymentStatus.PAID,
      orderNumber: order.orderNumber,
      trackingToken: order.trackingToken,
    };
  }

  // Guard: only a PENDING gateway order may transition to PAID.
  assertCanSettleToPaid(order);

  const updated = await deps.prisma.order.update({
    where: { id: order.id },
    data: { paymentStatus: PaymentStatus.PAID, paidAt: new Date() },
    select: {
      id: true,
      orderNumber: true,
      trackingToken: true,
      status: true,
      paymentStatus: true,
    },
  });

  await emitOrderUpdated(deps, updated);

  return {
    ok: true,
    paymentStatus: updated.paymentStatus,
    orderNumber: updated.orderNumber,
    trackingToken: updated.trackingToken,
  };
}

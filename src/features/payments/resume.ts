import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/enums";

import type { PaymentProvider } from "./types";

export type ResumableOrder = {
  id: string;
  orderNumber: string;
  trackingToken: string;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentIntentId: string | null;
  paymentProvider: string | null;
  gcashReference: string | null;
};

/** Injectable dependencies (same DI pattern as `settlePaymentWithDeps`), so
 *  the resume-vs-mint decision is testable without a DB or a live gateway. */
export type ResumePaymentDeps = {
  findOrder: (orderNumber: string) => Promise<ResumableOrder | null>;
  saveSession: (
    orderId: string,
    intentId: string,
    providerId: string,
  ) => Promise<void>;
  provider: PaymentProvider;
};

export type ResumePaymentResult =
  | { ok: true; redirectUrl: string }
  | { ok: false; message: string };

/** Pure eligibility check, shared by the server action and the order tracker
 *  so the button is only shown when the action would actually accept it. */
export function canResumePayment(
  order: Pick<
    ResumableOrder,
    "status" | "paymentMethod" | "paymentStatus" | "gcashReference"
  >,
): boolean {
  return (
    order.paymentMethod === PaymentMethod.GCASH &&
    order.paymentStatus === PaymentStatus.PENDING &&
    order.status !== OrderStatus.CANCELLED &&
    // Legacy manual flow: the customer already sent money to the shop's GCash
    // number and submitted a reference for staff to verify. Opening an
    // online payment on top of that would charge them twice.
    !order.gcashReference
  );
}

/**
 * Lets a customer finish paying an order whose payment session failed to
 * open, was abandoned, or expired. Reuses the existing session whenever the
 * provider says it's still payable, and only mints a new one when it isn't:
 * replacing a live session would orphan it, and a payment against the orphan
 * could never be matched back to this order.
 */
export async function resumePaymentWithDeps(
  input: { orderNumber: string; trackingToken: string },
  deps: ResumePaymentDeps,
): Promise<ResumePaymentResult> {
  const order = await deps.findOrder(input.orderNumber);

  // Same ownership check as the order tracker: the tracking token is the
  // customer's proof they placed this order.
  if (!order || order.trackingToken !== input.trackingToken) {
    return { ok: false, message: "Order not found." };
  }

  if (order.paymentStatus === PaymentStatus.PAID) {
    return { ok: false, message: "This order is already paid." };
  }

  if (!canResumePayment(order)) {
    return { ok: false, message: "This order can't be paid online." };
  }

  // A session id only means something to the provider that issued it. After
  // a PAYMENT_PROVIDER switch, fall through and mint one with the new provider.
  if (order.paymentIntentId && order.paymentProvider === deps.provider.id) {
    const resumed = await deps.provider.resumeSession(order.paymentIntentId);
    if (resumed) {
      return { ok: true, redirectUrl: resumed.redirectUrl };
    }
  }

  const session = await deps.provider.createSession({
    orderId: order.id,
    orderNumber: order.orderNumber,
    trackingToken: order.trackingToken,
    amount: order.total,
  });

  await deps.saveSession(order.id, session.intentId, deps.provider.id);

  return { ok: true, redirectUrl: session.redirectUrl };
}

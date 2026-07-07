import { PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";

/**
 * Payment methods that settle automatically through the gateway. CASH and COD
 * are paid in person and must never be auto-settled. GCash now routes through
 * the automated gateway (formerly a manual reference-number flow).
 */
export const GATEWAY_PAYMENT_METHODS: readonly PaymentMethod[] = [
  PaymentMethod.GCASH,
];

export function isGatewayPaymentMethod(method: PaymentMethod): boolean {
  return GATEWAY_PAYMENT_METHODS.includes(method);
}

export class PaymentSettlementError extends Error {}

type OrderPaymentSnapshot = {
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
};

/**
 * A gateway order may auto-settle to PAID only from PENDING. This is the guard
 * that keeps CASH/COD or already-final orders from being flipped by a callback.
 */
export function canSettleToPaid(order: OrderPaymentSnapshot): boolean {
  return (
    isGatewayPaymentMethod(order.paymentMethod) &&
    order.paymentStatus === PaymentStatus.PENDING
  );
}

/** True when the order is already settled — a repeat callback is a no-op. */
export function isAlreadyPaid(order: OrderPaymentSnapshot): boolean {
  return order.paymentStatus === PaymentStatus.PAID;
}

export function assertCanSettleToPaid(order: OrderPaymentSnapshot): void {
  if (!canSettleToPaid(order)) {
    throw new PaymentSettlementError(
      `Cannot settle a ${order.paymentMethod} order in ${order.paymentStatus} status to PAID.`,
    );
  }
}

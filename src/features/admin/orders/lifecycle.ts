import { OrderStatus } from "@/generated/prisma/enums";

export const allowedStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY, OrderStatus.CANCELLED],
  READY: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  OUT_FOR_DELIVERY: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
};

export function isAllowedStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
) {
  return (
    currentStatus === nextStatus ||
    allowedStatusTransitions[currentStatus].includes(nextStatus)
  );
}

export function assertAllowedStatusTransition(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus,
) {
  if (!isAllowedStatusTransition(currentStatus, nextStatus)) {
    throw new Error(`Cannot move order from ${currentStatus} to ${nextStatus}.`);
  }
}

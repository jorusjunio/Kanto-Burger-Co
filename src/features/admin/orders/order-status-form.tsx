import { Button } from "@/components/ui/button";
import { OrderStatus, PaymentMethod } from "@/generated/prisma/enums";

import { updateOrderStatus, updatePaymentStatus } from "./actions";
import { allowedStatusTransitions } from "./lifecycle";

type OrderStatusFormProps = {
  orderId: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
};

const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready",
  OUT_FOR_DELIVERY: "Out for delivery",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const paymentStatuses = [
  ["UNPAID", "Unpaid"],
  ["PENDING", "Pending"],
  ["PAID", "Paid"],
];

export function OrderStatusForm({
  orderId,
  status,
  paymentMethod,
  paymentStatus,
}: OrderStatusFormProps) {
  const currentStatus = status as OrderStatus;
  const orderStatuses = [
    currentStatus,
    ...(allowedStatusTransitions[currentStatus] ?? []),
  ];
  const canUpdateOrderStatus = orderStatuses.length > 1;
  const visiblePaymentStatuses =
    paymentMethod === PaymentMethod.GCASH
      ? paymentStatuses
      : paymentStatuses.filter(([value]) => value !== "PENDING");

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <form action={updateOrderStatus} className="space-y-2">
        <input type="hidden" name="orderId" value={orderId} />
        <label
          htmlFor="status"
          className="block text-sm font-bold text-zinc-950"
        >
          Order status
        </label>
        <div className="flex gap-2">
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="h-9 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-950"
          >
            {orderStatuses.map((value) => (
              <option key={value} value={value}>
                {orderStatusLabels[value]}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={!canUpdateOrderStatus}>
            Update
          </Button>
        </div>
      </form>

      <form action={updatePaymentStatus} className="space-y-2">
        <input type="hidden" name="orderId" value={orderId} />
        <label
          htmlFor="paymentStatus"
          className="block text-sm font-bold text-zinc-950"
        >
          Payment status
        </label>
        <div className="flex gap-2">
          <select
            id="paymentStatus"
            name="paymentStatus"
            defaultValue={paymentStatus}
            className="h-9 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-950"
          >
            {visiblePaymentStatuses.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button type="submit">Update</Button>
        </div>
      </form>
    </div>
  );
}

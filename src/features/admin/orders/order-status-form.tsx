import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const triggerClassName =
  "h-10 w-full flex-1 rounded-xl border-2 border-orange-900/10 bg-white px-3.5 text-sm font-bold text-[#25130b] shadow-sm transition-all duration-300 ease-out hover:border-orange-900/20 focus-visible:border-red-500/50 focus-visible:ring-4 focus-visible:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60";

const updateButtonClassName =
  "h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 px-5 font-black text-white shadow-lg shadow-red-600/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/40 active:translate-y-0 active:scale-[0.97] disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none";

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
    <div className="grid gap-4 sm:grid-cols-2">
      <form action={updateOrderStatus} className="space-y-2">
        <input type="hidden" name="orderId" value={orderId} />
        <label
          htmlFor="status"
          className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-orange-950/50"
        >
          <span className="size-1.5 rounded-full bg-red-600" />
          Order status
        </label>
        <div className="flex gap-2">
          <Select
            name="status"
            defaultValue={status}
            disabled={!canUpdateOrderStatus}
          >
            <SelectTrigger id="status" className={triggerClassName}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map((value) => (
                <SelectItem key={value} value={value}>
                  {orderStatusLabels[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="submit"
            disabled={!canUpdateOrderStatus}
            className={updateButtonClassName}
          >
            Update
          </Button>
        </div>
      </form>

      <form action={updatePaymentStatus} className="space-y-2">
        <input type="hidden" name="orderId" value={orderId} />
        <label
          htmlFor="paymentStatus"
          className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-orange-950/50"
        >
          <span className="size-1.5 rounded-full bg-amber-500" />
          Payment status
        </label>
        <div className="flex gap-2">
          <Select name="paymentStatus" defaultValue={paymentStatus}>
            <SelectTrigger id="paymentStatus" className={triggerClassName}>
              <SelectValue placeholder="Select payment status" />
            </SelectTrigger>
            <SelectContent>
              {visiblePaymentStatuses.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" className={updateButtonClassName}>
            Update
          </Button>
        </div>
      </form>
    </div>
  );
}

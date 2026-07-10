import { Check, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/generated/prisma/enums";

import { updateOrderStatus, updatePaymentStatus } from "./actions";
import { allowedStatusTransitions } from "./lifecycle";

type OrderStatusFormProps = {
  orderId: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
};

// Verb labels for each transition target — the button says what the click does,
// not what the order currently is.
const statusActionLabels: Record<OrderStatus, string> = {
  PENDING: "Reopen",
  PREPARING: "Start preparing",
  READY: "Mark ready",
  OUT_FOR_DELIVERY: "Send out for delivery",
  COMPLETED: "Complete order",
  CANCELLED: "Cancel order",
};

const primaryButtonClassName =
  "h-10 rounded-full bg-red-600 px-5 text-sm font-bold text-white transition-colors duration-200 hover:bg-red-700 active:scale-[0.99]";

const cancelButtonClassName =
  "h-10 rounded-full px-5 text-sm font-bold text-orange-950/50 transition-colors hover:bg-red-50 hover:text-red-700";

const sectionLabelClassName =
  "flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-orange-950/50";

function StatusButton({
  orderId,
  target,
  variant,
}: {
  orderId: string;
  target: OrderStatus;
  variant: "primary" | "cancel";
}) {
  return (
    <form action={updateOrderStatus}>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="status" value={target} />
      <Button
        type="submit"
        variant={variant === "cancel" ? "ghost" : "default"}
        className={
          variant === "cancel" ? cancelButtonClassName : primaryButtonClassName
        }
      >
        {statusActionLabels[target]}
      </Button>
    </form>
  );
}

function PaymentButton({
  orderId,
  target,
  label,
  variant = "primary",
}: {
  orderId: string;
  target: PaymentStatus;
  label: string;
  variant?: "primary" | "ghost";
}) {
  return (
    <form action={updatePaymentStatus}>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="paymentStatus" value={target} />
      <Button
        type="submit"
        variant={variant === "ghost" ? "ghost" : "default"}
        className={
          variant === "ghost" ? cancelButtonClassName : primaryButtonClassName
        }
      >
        {label}
      </Button>
    </form>
  );
}

export function OrderStatusForm({
  orderId,
  status,
  paymentMethod,
  paymentStatus,
}: OrderStatusFormProps) {
  const currentStatus = status as OrderStatus;
  const currentPayment = paymentStatus as PaymentStatus;
  const forwardTransitions = allowedStatusTransitions[currentStatus] ?? [];
  const advanceTargets = forwardTransitions.filter(
    (target) => target !== OrderStatus.CANCELLED,
  );
  const canCancel = forwardTransitions.includes(OrderStatus.CANCELLED);
  const isGcash = paymentMethod === PaymentMethod.GCASH;
  const isPaid = currentPayment === PaymentStatus.PAID;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {/* Order status — one button per allowed next step, no free-choice dropdown */}
      <div className="space-y-2.5">
        <p className={sectionLabelClassName}>
          <span className="size-1.5 rounded-full bg-red-600" />
          Order status
        </p>
        {advanceTargets.length === 0 && !canCancel ? (
          <p className="flex items-center gap-1.5 text-sm font-bold text-stone-400">
            <Lock className="size-3.5" aria-hidden="true" />
            Order closed
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {advanceTargets.map((target) => (
              <StatusButton
                key={target}
                orderId={orderId}
                target={target}
                variant="primary"
              />
            ))}
            {canCancel ? (
              <StatusButton
                orderId={orderId}
                target={OrderStatus.CANCELLED}
                variant="cancel"
              />
            ) : null}
          </div>
        )}
      </div>

      {/* Payment — shaped by method: cash is a simple toggle, GCash adds verify */}
      <div className="space-y-2.5">
        <p className={sectionLabelClassName}>
          <span className="size-1.5 rounded-full bg-amber-500" />
          Payment {isGcash ? "(GCash)" : `(${paymentMethod})`}
        </p>
        {isPaid ? (
          <p className="flex items-center gap-1.5 text-sm font-bold text-emerald-600">
            <Check className="size-4" aria-hidden="true" />
            Paid
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <PaymentButton
              orderId={orderId}
              target={PaymentStatus.PAID}
              label="Mark as paid"
            />
            {isGcash && currentPayment !== PaymentStatus.PENDING ? (
              <PaymentButton
                orderId={orderId}
                target={PaymentStatus.PENDING}
                label="Awaiting verification"
                variant="ghost"
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

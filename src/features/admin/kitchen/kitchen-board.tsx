"use client";

import { useEffect, useState } from "react";
import { Clock, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrderStatus, OrderType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

import { updateOrderStatus } from "../orders/actions";

export type KitchenOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  orderType: string;
  items: Array<{ id: string; name: string; quantity: number }>;
  createdAt: Date;
};

/**
 * The single forward move the crew makes from each active state. READY splits by
 * order type: a delivery order goes out for delivery, a pickup order is done.
 */
function nextStep(status: string, orderType: string) {
  switch (status) {
    case OrderStatus.PENDING:
      return { status: OrderStatus.PREPARING, label: "Start cooking" };
    case OrderStatus.PREPARING:
      return { status: OrderStatus.READY, label: "Mark ready" };
    case OrderStatus.READY:
      return orderType === OrderType.DELIVERY
        ? { status: OrderStatus.OUT_FOR_DELIVERY, label: "Send out for delivery" }
        : { status: OrderStatus.COMPLETED, label: "Complete order" };
    case OrderStatus.OUT_FOR_DELIVERY:
      return { status: OrderStatus.COMPLETED, label: "Mark delivered" };
    default:
      return null;
  }
}

function useMinutesAgo(createdAt: Date) {
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    const compute = () =>
      setMinutes(Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60000)));
    compute();
    const interval = setInterval(compute, 30000);
    return () => clearInterval(interval);
  }, [createdAt]);

  return minutes;
}

function formatAge(minutes: number) {
  if (minutes === 0) return "just now";
  if (minutes < 60) return `${minutes} min`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h`;
  return `${Math.floor(minutes / (60 * 24))}d`;
}

/** Short, shout-across-the-kitchen code — the last segment of the order number. */
function shortCode(orderNumber: string) {
  return orderNumber.split("-").at(-1) ?? orderNumber;
}

/* ─── Stages, in the order the crew works them ─── */
const stages = [
  { status: OrderStatus.PENDING, label: "New", dot: "bg-red-500" },
  { status: OrderStatus.PREPARING, label: "Cooking", dot: "bg-amber-500" },
  { status: OrderStatus.READY, label: "Ready", dot: "bg-emerald-500" },
  { status: OrderStatus.OUT_FOR_DELIVERY, label: "Out for delivery", dot: "bg-sky-500" },
] as const;

function KitchenCard({ order }: { order: KitchenOrder }) {
  const step = nextStep(order.status, order.orderType);
  const minutes = useMinutesAgo(order.createdAt);

  // Waiting orders escalate visually: quiet → amber (8m) → red (15m).
  const urgency =
    minutes === null || minutes < 8
      ? "none"
      : minutes < 15
        ? "warn"
        : "late";

  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-orange-900/10">
      {/* Urgency rail */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 top-0 h-0.5",
          urgency === "late" && "bg-red-500",
          urgency === "warn" && "bg-amber-400",
        )}
      />

      <div className="flex items-start justify-between gap-3 p-5 pb-0">
        <div className="min-w-0">
          {/* Big glanceable code; the full number stays for receipts/lookup. */}
          <p className="font-mono text-2xl font-black leading-none tracking-wide text-[#25130b]">
            {shortCode(order.orderNumber)}
          </p>
          <p className="mt-1.5 truncate text-[11px] font-medium text-orange-950/40">
            {order.orderNumber} · {order.customerName}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
              order.orderType === OrderType.DELIVERY
                ? "bg-amber-500/10 text-amber-700"
                : "bg-orange-950/5 text-orange-950/55",
            )}
          >
            {order.orderType}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-xs font-bold tabular-nums",
              urgency === "late"
                ? "text-red-600"
                : urgency === "warn"
                  ? "text-amber-600"
                  : "text-orange-950/35",
            )}
          >
            <Clock className="size-3.5" aria-hidden="true" />
            {minutes === null ? "—" : formatAge(minutes)}
          </span>
        </div>
      </div>

      <ul className="mt-4 flex-1 space-y-2 border-t border-orange-900/6 px-5 pt-4">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-baseline gap-2.5">
            <span className="min-w-7 font-mono text-base font-black text-red-700">
              {item.quantity}&times;
            </span>
            <span className="text-[15px] font-semibold leading-snug text-[#25130b]">
              {item.name}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 p-5 pt-4">
        {step ? (
          <form action={updateOrderStatus} className="flex-1">
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="status" value={step.status} />
            <Button
              type="submit"
              className="h-11 w-full rounded-full bg-red-600 text-sm font-bold text-white transition-colors duration-200 hover:bg-red-700 active:scale-[0.99]"
            >
              {step.label}
            </Button>
          </form>
        ) : null}
        <form action={updateOrderStatus}>
          <input type="hidden" name="orderId" value={order.id} />
          <input type="hidden" name="status" value={OrderStatus.CANCELLED} />
          <Button
            type="submit"
            variant="ghost"
            className="h-11 rounded-full px-3.5 text-xs font-bold text-orange-950/40 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            Cancel
          </Button>
        </form>
      </div>

    </div>
  );
}

export function KitchenBoard({ orders }: { orders: KitchenOrder[] }) {
  const grouped = stages
    .map((stage) => ({
      ...stage,
      orders: orders.filter((order) => order.status === stage.status),
    }))
    .filter((stage) => stage.orders.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-red-700">
            Kitchen
          </p>
          <h1 className="mt-1 text-2xl font-black text-[#25130b]">
            Live Orders
          </h1>
        </div>

        {/* Stage tally — one glance tells the crew where the load is. */}
        {orders.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            {grouped.map((stage) => (
              <span
                key={stage.status}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-orange-950/60 ring-1 ring-orange-900/10"
              >
                <span className={cn("size-1.5 rounded-full", stage.dot)} />
                {stage.orders.length} {stage.label.toLowerCase()}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-[420px] flex-col items-center justify-center rounded-xl bg-white p-8 text-center ring-1 ring-orange-900/10">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-orange-950/5 text-orange-950/40">
            <UtensilsCrossed aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-[#25130b]">All caught up</h2>
          <p className="mt-2 max-w-md text-orange-950/45">
            No active orders right now. New orders appear here automatically.
          </p>
        </div>
      ) : (
        grouped.map((stage) => (
          <section key={stage.status}>
            <div className="mb-3 flex items-center gap-2">
              <span className={cn("size-2 rounded-full", stage.dot)} />
              <h2 className="text-[13px] font-black uppercase tracking-wide text-[#25130b]">
                {stage.label}
              </h2>
              <span className="text-xs font-bold text-orange-950/35 tabular-nums">
                {stage.orders.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {stage.orders.map((order) => (
                <KitchenCard key={order.id} order={order} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

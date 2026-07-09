"use client";

import { useEffect, useState } from "react";
import { Clock, UtensilsCrossed } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrderStatus, OrderType } from "@/generated/prisma/enums";

import { updateOrderStatus } from "../orders/actions";
import { OrderStatusBadge } from "../orders/order-badges";

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
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / (60 * 24))}d ago`;
}

function TimeAgo({ createdAt }: { createdAt: Date }) {
  const minutes = useMinutesAgo(createdAt);

  // null until the client effect runs — avoids an SSR/client hydration mismatch.
  const label = minutes === null ? "—" : formatAge(minutes);

  // Orders sitting for a while glow amber, then red — a gentle nudge to the crew.
  const tone =
    minutes !== null && minutes >= 15
      ? "text-red-600"
      : minutes !== null && minutes >= 8
        ? "text-amber-600"
        : "text-stone-500";

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${tone}`}>
      <Clock className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

function KitchenCard({ order }: { order: KitchenOrder }) {
  const step = nextStep(order.status, order.orderType);

  return (
    <div className="flex flex-col rounded-xl bg-white p-5 ring-1 ring-orange-900/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-black leading-none text-[#25130b]">
            {order.orderNumber}
          </p>
          <p className="mt-1 font-bold text-stone-700">{order.customerName}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <OrderStatusBadge value={order.status} />
          <span className="text-[10px] font-black uppercase tracking-wider text-stone-500">
            {order.orderType}
          </span>
        </div>
      </div>

      <ul className="mt-4 space-y-1.5 border-t border-dashed border-orange-900/10 pt-4">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-baseline gap-2 text-sm">
            <span className="min-w-8 font-black text-red-700">
              {item.quantity}&times;
            </span>
            <span className="font-medium text-[#25130b]">{item.name}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between">
        <TimeAgo createdAt={order.createdAt} />
      </div>

      <div className="mt-3 flex items-center gap-2">
        {step ? (
          <form action={updateOrderStatus} className="flex-1">
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="status" value={step.status} />
            <Button
              type="submit"
              className="h-10 w-full rounded-full bg-red-600 text-sm font-bold text-white transition-colors duration-200 hover:bg-red-700 active:scale-[0.99]"
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
            className="h-10 rounded-full px-4 text-sm font-bold text-orange-950/50 transition-colors hover:bg-red-50 hover:text-red-700"
          >
            Cancel
          </Button>
        </form>
      </div>
    </div>
  );
}

export function KitchenBoard({ orders }: { orders: KitchenOrder[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-red-700">
            Kitchen
          </p>
          <h1 className="mt-1 text-2xl font-black text-[#25130b]">
            Live Orders
          </h1>
          <p className="mt-1 text-sm text-orange-950/45">
            Oldest first. Cards clear once completed.
          </p>
        </div>
        {orders.length > 0 ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-700/8 px-3 py-1.5 text-xs font-bold text-red-700">
            <span className="size-1.5 rounded-full bg-red-600" />
            {orders.length} active
          </span>
        ) : null}
      </div>

      {orders.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl bg-white p-8 text-center ring-1 ring-orange-900/10">
          <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-orange-950/5 text-orange-950/40">
            <UtensilsCrossed aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-[#25130b]">All caught up</h2>
          <p className="mt-2 max-w-md text-stone-500">
            No active orders right now. New orders appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <KitchenCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

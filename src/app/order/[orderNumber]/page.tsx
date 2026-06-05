import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getOrderByNumber } from "@/features/orders/queries";
import { RealtimeOrderListener } from "@/features/orders/realtime-order-listener";
import { formatPeso } from "@/lib/format";

type OrderPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { orderNumber } = await params;
  const { token = "" } = await searchParams;
  const order = await getOrderByNumber(orderNumber, token);

  return (
    <main className="storefront-bg min-h-screen">
      <RealtimeOrderListener
        channelName={`order-${order.trackingToken}`}
        events={["order-updated"]}
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="kanto-card rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <CheckCircle2 aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-red-700">
                Order received
              </p>
              <h1 className="food-heading mt-2 text-4xl leading-none">
                {order.orderNumber}
              </h1>
              <p className="mt-2 font-medium text-orange-950/65">
                We received your order. Save this number for pickup, delivery,
                or GCash verification.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-lg border border-orange-900/10 bg-orange-50 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-zinc-500">Customer</p>
              <p className="font-bold text-[#25130b]">{order.customerName}</p>
            </div>
            <div>
              <p className="text-zinc-500">Status</p>
              <p className="font-bold text-[#25130b]">{order.status}</p>
            </div>
            <div>
              <p className="text-zinc-500">Order type</p>
              <p className="font-bold text-[#25130b]">{order.orderType}</p>
            </div>
            <div>
              <p className="text-zinc-500">Payment</p>
              <p className="font-bold text-[#25130b]">
                {order.paymentMethod} / {order.paymentStatus}
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                    className="flex justify-between gap-4 border-b border-orange-900/10 pb-3 text-sm"
              >
                <div>
                  <p className="font-black text-[#25130b]">
                    {item.quantity}x {item.productName}
                  </p>
                  {Array.isArray(item.selectedAddOns) &&
                  item.selectedAddOns.length > 0 ? (
                    <p className="mt-1 text-zinc-500">
                      Add-ons selected
                    </p>
                  ) : null}
                  {item.notes ? (
                    <p className="mt-1 text-zinc-500">Note: {item.notes}</p>
                  ) : null}
                </div>
                <p className="font-black text-red-700">
                  {formatPeso(Number(item.totalPrice))}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-bold">{formatPeso(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Delivery fee</span>
              <span className="font-bold">
                {formatPeso(Number(order.deliveryFee))}
              </span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-3 text-base">
              <span className="font-black text-[#25130b]">Total</span>
              <span className="font-black text-red-700">
                {formatPeso(Number(order.total))}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button className="kanto-button font-black" asChild>
              <Link href="/menu">Order More</Link>
            </Button>
            <Button
              variant="outline"
              className="border-orange-900/20 bg-white/80 font-black text-orange-950 hover:text-red-700"
              asChild
            >
              <Link href="/">Back Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

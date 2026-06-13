import { CheckCircle2, Clock, Package, Truck, Wallet, Smartphone } from "lucide-react";
import { getOrderByNumber } from "@/features/orders/queries";
import { RealtimeOrderListener } from "@/features/orders/realtime-order-listener";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";
import { OrderReceiptClient } from "@/features/orders/components/order-receipt-client";

type OrderPageProps = {
  params: Promise<{
    orderNumber: string;
  }>;
  searchParams: Promise<{
    token?: string;
  }>;
};

function getStatusBadge(status: string) {
  const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
    PENDING: {
      color: "text-amber-700",
      bgColor: "bg-amber-100",
      icon: Clock,
    },
    PREPARING: {
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      icon: Package,
    },
    READY: {
      color: "text-emerald-700",
      bgColor: "bg-emerald-100",
      icon: CheckCircle2,
    },
    OUT_FOR_DELIVERY: {
      color: "text-purple-700",
      bgColor: "bg-purple-100",
      icon: Truck,
    },
    COMPLETED: {
      color: "text-green-700",
      bgColor: "bg-green-100",
      icon: CheckCircle2,
    },
    CANCELLED: {
      color: "text-red-700",
      bgColor: "bg-red-100",
      icon: Clock,
    },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wide">
      <div className={cn("relative flex size-2 items-center justify-center", config.bgColor)}>
        <div className={cn("absolute size-2 rounded-full", config.bgColor, "animate-pulse")} />
        <Icon className={cn("relative size-2", config.color)} />
      </div>
      <span className={config.color}>{status}</span>
    </div>
  );
}


export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { orderNumber } = await params;
  const { token = "" } = await searchParams;
  const order = await getOrderByNumber(orderNumber, token);

  return (
    <main className="storefront-bg min-h-screen flex items-center justify-center px-4 py-10">
      <RealtimeOrderListener
        channelName={`order-${order.trackingToken}`}
        events={["order-updated"]}
      />
      <div className="mx-auto w-full max-w-3xl sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-orange-900/10 bg-white/95 shadow-2xl backdrop-blur-xl">
          {/* Receipt Header */}
          <div className="border-b-2 border-dashed border-orange-900/10 bg-gradient-to-br from-orange-50/50 to-white p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-600/30">
                <CheckCircle2 className="size-4 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-red-700">
                    Order received
                  </p>
                  {getStatusBadge(order.status)}
                </div>
                <h1 className="food-heading mt-1 text-xl leading-none sm:text-2xl">
                  {order.orderNumber}
                </h1>
                <p className="mt-1 text-[11px] font-medium text-orange-950/65 sm:text-xs">
                  Save this number for pickup, delivery, or GCash verification.
                </p>
              </div>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4">
            <div className="rounded-lg border border-orange-900/8 bg-orange-50/40 p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wide text-orange-950/40">Customer</p>
              <p className="mt-0.5 text-xs font-black text-[#25130b]">{order.customerName}</p>
              <p className="mt-0.5 text-[10px] font-medium text-orange-950/60">{order.customerPhone}</p>
            </div>
            <div className="rounded-lg border border-orange-900/8 bg-orange-50/40 p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wide text-orange-950/40">Order Type</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                {order.orderType === "DELIVERY" ? (
                  <Truck className="size-3 text-red-700" />
                ) : (
                  <Package className="size-3 text-red-700" />
                )}
                <p className="text-xs font-black text-[#25130b]">{order.orderType}</p>
              </div>
              {order.orderType === "DELIVERY" && order.deliveryAddress && (
                <p className="mt-0.5 text-[10px] font-medium text-orange-950/60">{order.deliveryAddress}</p>
              )}
            </div>
            <div className="rounded-lg border border-orange-900/8 bg-orange-50/40 p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wide text-orange-950/40">Payment Method</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                {order.paymentMethod === "GCASH" ? (
                  <Smartphone className="size-3 text-red-700" />
                ) : (
                  <Wallet className="size-3 text-red-700" />
                )}
                <p className="text-xs font-black text-[#25130b]">{order.paymentMethod}</p>
              </div>
            </div>
            <div className="rounded-lg border border-orange-900/8 bg-orange-50/40 p-2.5">
              <p className="text-[9px] font-bold uppercase tracking-wide text-orange-950/40">Payment Status</p>
              <p className="mt-0.5 text-xs font-black text-[#25130b]">{order.paymentStatus}</p>
            </div>
          </div>

          {/* Items List */}
          <div className="border-y-2 border-dashed border-orange-900/10 px-3 py-3 sm:px-4 sm:py-4">
            <h2 className="text-[10px] font-black uppercase tracking-wide text-[#25130b]">Order Items</h2>
            <div className="mt-2 space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 border-b border-orange-900/8 pb-2 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-red-100 text-[8px] font-black text-red-700">
                        {item.quantity}
                      </span>
                      <div>
                        <p className="text-xs font-black text-[#25130b]">{item.productName}</p>
                        {Array.isArray(item.selectedAddOns) && item.selectedAddOns.length > 0 && (
                          <p className="mt-0.5 text-[9px] text-orange-950/50">
                            Add-ons: {item.selectedAddOns.map((a) => (a as { name: string }).name).join(", ")}
                          </p>
                        )}
                        {item.notes && (
                          <p className="mt-0.5 text-[9px] text-orange-950/50">Note: {item.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="shrink-0 text-xs font-black text-red-700 tabular-nums">
                    {formatPeso(Number(item.totalPrice))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total Section */}
          <div className="space-y-2 px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-orange-950/50">Subtotal</span>
              <span className="font-bold text-[#25130b] tabular-nums">{formatPeso(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-orange-950/50">Delivery fee</span>
              <span className="font-bold text-[#25130b] tabular-nums">{formatPeso(Number(order.deliveryFee))}</span>
            </div>
            <div className="relative flex justify-between border-t-2 border-dashed border-orange-900/10 pt-2 text-sm">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-px w-6 bg-orange-900/10" />
              </div>
              <span className="relative text-[10px] font-black text-[#25130b]">Total</span>
              <span className="relative text-sm font-black text-red-700 tabular-nums">{formatPeso(Number(order.total))}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-orange-900/8 bg-gradient-to-br from-orange-50/30 to-white px-3 py-3 sm:px-4 sm:py-4">
            <OrderReceiptClient orderNumber={order.orderNumber} token={token} />
          </div>
        </div>
      </div>
    </main>
  );
}

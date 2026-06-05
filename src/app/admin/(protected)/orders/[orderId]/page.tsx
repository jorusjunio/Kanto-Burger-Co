import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/features/admin/orders/order-badges";
import { OrderStatusForm } from "@/features/admin/orders/order-status-form";
import { getAdminOrder } from "@/features/admin/orders/queries";
import { formatPeso } from "@/lib/format";

type AdminOrderPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

type SelectedAddOn = {
  name?: unknown;
  price?: unknown;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(value);
}

function getAddOnNames(value: unknown) {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((addOn: SelectedAddOn) =>
      typeof addOn.name === "string" ? addOn.name : "",
    )
    .filter(Boolean)
    .join(", ");
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { orderId } = await params;
  const order = await getAdminOrder(orderId);

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
          <Link href="/admin/orders">
            <ArrowLeft aria-hidden="true" />
            Back to Orders
          </Link>
        </Button>

        <div className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-red-700">
                Order details
              </p>
              <h1 className="mt-2 text-3xl font-black text-zinc-950">
                {order.orderNumber}
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Created {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <OrderStatusBadge value={order.status} />
              <PaymentStatusBadge value={order.paymentStatus} />
            </div>
          </div>

          <div className="grid gap-6 py-5 lg:grid-cols-[1fr_360px]">
            <section className="space-y-5">
              <OrderStatusForm
                orderId={order.id}
                status={order.status}
                paymentMethod={order.paymentMethod}
                paymentStatus={order.paymentStatus}
              />

              <div>
                <h2 className="text-lg font-black text-zinc-950">Items</h2>
                <div className="mt-3 space-y-3">
                  {order.items.map((item) => {
                    const addOnNames = getAddOnNames(item.selectedAddOns);

                    return (
                      <article
                        key={item.id}
                        className="rounded-lg border border-zinc-200 p-4"
                      >
                        <div className="flex justify-between gap-4">
                          <div>
                            <h3 className="font-black text-zinc-950">
                              {item.quantity}x {item.productName}
                            </h3>
                            <p className="mt-1 text-sm text-zinc-500">
                              {formatPeso(Number(item.unitPrice))} each
                            </p>
                            {addOnNames ? (
                              <p className="mt-2 text-sm text-zinc-600">
                                Add-ons: {addOnNames}
                              </p>
                            ) : null}
                            {item.notes ? (
                              <p className="mt-1 text-sm text-zinc-600">
                                Note: {item.notes}
                              </p>
                            ) : null}
                          </div>
                          <p className="font-black text-zinc-950">
                            {formatPeso(Number(item.totalPrice))}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-lg border border-zinc-200 p-4">
                <h2 className="text-lg font-black text-zinc-950">Customer</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-zinc-500">Name</dt>
                    <dd className="font-bold text-zinc-950">
                      {order.customerName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Phone</dt>
                    <dd className="font-bold text-zinc-950">
                      {order.customerPhone}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Order type</dt>
                    <dd className="font-bold text-zinc-950">
                      {order.orderType}
                    </dd>
                  </div>
                  {order.deliveryAddress ? (
                    <div>
                      <dt className="text-zinc-500">Delivery address</dt>
                      <dd className="font-bold text-zinc-950">
                        {order.deliveryAddress}
                      </dd>
                    </div>
                  ) : null}
                  {order.notes ? (
                    <div>
                      <dt className="text-zinc-500">Order notes</dt>
                      <dd className="font-bold text-zinc-950">{order.notes}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className="rounded-lg border border-zinc-200 p-4">
                <h2 className="text-lg font-black text-zinc-950">Payment</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Method</dt>
                    <dd className="font-bold text-zinc-950">
                      {order.paymentMethod}
                    </dd>
                  </div>
                  {order.gcashReference ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-zinc-500">GCash ref</dt>
                      <dd className="font-bold text-zinc-950">
                        {order.gcashReference}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between border-t border-zinc-200 pt-3">
                    <dt className="text-zinc-500">Subtotal</dt>
                    <dd className="font-bold text-zinc-950">
                      {formatPeso(Number(order.subtotal))}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Delivery</dt>
                    <dd className="font-bold text-zinc-950">
                      {formatPeso(Number(order.deliveryFee))}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-3 text-base">
                    <dt className="font-black text-zinc-950">Total</dt>
                    <dd className="font-black text-zinc-950">
                      {formatPeso(Number(order.total))}
                    </dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}

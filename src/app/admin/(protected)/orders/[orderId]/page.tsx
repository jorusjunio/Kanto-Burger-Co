import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireManagerPage } from "@/features/admin/auth/guards";
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
  name?: string;
  price?: string | number;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
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

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="shrink-0 text-xs font-bold uppercase tracking-wide text-orange-950/40">
        {label}
      </dt>
      <dd className="min-w-0 text-right text-sm font-bold text-[#25130b]">
        {value}
      </dd>
    </div>
  );
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  await requireManagerPage();
  const { orderId } = await params;
  const order = await getAdminOrder(orderId);

  const cardClassName = "rounded-xl bg-white p-6 ring-1 ring-orange-900/10";
  const cardTitleClassName =
    "text-[13px] font-black uppercase tracking-wide text-[#25130b]";

  return (
    <div className="space-y-5">
      {/* Back link */}
      <Link
        href="/admin/orders"
        className="group inline-flex items-center gap-1.5 text-xs font-bold text-orange-950/50 transition-colors hover:text-red-700"
      >
        <ArrowLeft
          className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-red-700">
            Order
          </p>
          <h1 className="mt-1 font-mono text-2xl font-black tracking-tight text-[#25130b]">
            {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-orange-950/45">
            Placed {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <OrderStatusBadge value={order.status} />
          <PaymentStatusBadge value={order.paymentStatus} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        {/* ── Left column ── */}
        <div className="space-y-5">
          {/* Manage */}
          <section className={`${cardClassName} animate-fade-in`}>
            <h2 className={cardTitleClassName}>Manage</h2>
            <div className="mt-4">
              <OrderStatusForm
                orderId={order.id}
                status={order.status}
                paymentMethod={order.paymentMethod}
                paymentStatus={order.paymentStatus}
              />
            </div>
          </section>

          {/* Items — receipt style with totals footer */}
          <section
            className={`${cardClassName} animate-fade-in`}
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className={cardTitleClassName}>Items</h2>
              <span className="text-xs font-bold text-orange-950/40 tabular-nums">
                {order.items.length} line{order.items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="mt-3 divide-y divide-orange-900/6">
              {order.items.map((item) => {
                const addOnNames = getAddOnNames(item.selectedAddOns);

                return (
                  <div key={item.id} className="py-3.5 first:pt-0">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="min-w-0 text-sm font-bold text-[#25130b]">
                        <span className="mr-2 font-mono text-xs font-black text-red-700">
                          {item.quantity}×
                        </span>
                        {item.productName}
                        <span className="ml-2 text-xs font-medium text-orange-950/40">
                          {formatPeso(Number(item.unitPrice))} each
                        </span>
                      </p>
                      <p className="shrink-0 text-sm font-black text-[#25130b] tabular-nums">
                        {formatPeso(Number(item.totalPrice))}
                      </p>
                    </div>
                    {addOnNames ? (
                      <p className="mt-1 truncate pl-7 text-xs font-medium text-orange-950/45">
                        + {addOnNames}
                      </p>
                    ) : null}
                    {item.notes ? (
                      <p className="mt-1 pl-7 text-xs font-medium italic text-orange-950/45">
                        “{item.notes}”
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="mt-2 space-y-2 border-t border-orange-900/10 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-orange-950/50">Subtotal</span>
                <span className="font-bold text-[#25130b] tabular-nums">
                  {formatPeso(Number(order.subtotal))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-orange-950/50">
                  Delivery fee
                </span>
                <span className="font-bold text-[#25130b] tabular-nums">
                  {formatPeso(Number(order.deliveryFee))}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-orange-900/10 pt-3">
                <span className="text-sm font-black text-[#25130b]">Total</span>
                <span className="text-xl font-black text-red-700 tabular-nums">
                  {formatPeso(Number(order.total))}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">
          <section
            className={`${cardClassName} animate-fade-in`}
            style={{ animationDelay: "150ms" }}
          >
            <h2 className={cardTitleClassName}>Customer</h2>
            <dl className="mt-3 divide-y divide-orange-900/6">
              <DetailRow label="Name" value={order.customerName} />
              <DetailRow label="Phone" value={order.customerPhone} />
              <DetailRow label="Type" value={order.orderType} />
              {order.deliveryAddress ? (
                <DetailRow
                  label="Address"
                  value={
                    <span className="block text-xs font-medium leading-relaxed text-orange-950/70">
                      {order.deliveryAddress}
                    </span>
                  }
                />
              ) : null}
            </dl>
            {order.notes ? (
              <p className="mt-4 rounded-lg bg-orange-950/[0.03] px-3.5 py-3 text-xs font-medium italic leading-relaxed text-orange-950/60">
                “{order.notes}”
              </p>
            ) : null}
          </section>

          <section
            className={`${cardClassName} animate-fade-in`}
            style={{ animationDelay: "200ms" }}
          >
            <h2 className={cardTitleClassName}>Payment</h2>
            <dl className="mt-3 divide-y divide-orange-900/6">
              <DetailRow label="Method" value={order.paymentMethod} />
              {order.gcashReference ? (
                <DetailRow
                  label="GCash ref"
                  value={
                    <span className="font-mono text-xs">
                      {order.gcashReference}
                    </span>
                  }
                />
              ) : null}
              {order.paymentIntentId ? (
                <DetailRow
                  label="Intent"
                  value={
                    <span className="block truncate font-mono text-[11px] text-orange-950/60">
                      {order.paymentIntentId}
                    </span>
                  }
                />
              ) : null}
              {order.paidAt ? (
                <DetailRow label="Paid at" value={formatDate(order.paidAt)} />
              ) : null}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}

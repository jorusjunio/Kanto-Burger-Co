import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertTriangle, BarChart3, CreditCard, PackageSearch } from "lucide-react";

import { UserRole } from "@/generated/prisma/enums";
import { PaymentStatusBadge } from "@/features/admin/orders/order-badges";
import { getAdminReports } from "@/features/admin/reports/queries";
import { formatPeso } from "@/lib/format";
import { getCurrentSession } from "@/server/auth/session";

function maxValue(values: number[]) {
  return Math.max(...values, 1);
}

export default async function AdminReportsPage() {
  const session = await getCurrentSession();

  if (session?.user.role !== UserRole.ADMIN) {
    redirect("/kitchen");
  }

  const reports = await getAdminReports();
  const maxDailyRevenue = maxValue(
    reports.dailySales.map((day) => day.revenue),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-red-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#25130b]">Reports</h1>
        <p className="mt-2 text-stone-500">
          Review sales, order volume, payment status, and stock alerts.
        </p>
      </div>

      {/* Summary Metrics */}
      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-white p-4 ring-1 ring-orange-900/10 animate-fade-in" style={{ animationDelay: '0ms' }}>
          <p className="text-sm font-bold text-stone-500">Today sales</p>
          <p className="mt-2 text-2xl font-black text-[#25130b]">
            {formatPeso(reports.summary.todayRevenue)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-orange-900/10 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <p className="text-sm font-bold text-stone-500">Today orders</p>
          <p className="mt-2 text-2xl font-black text-[#25130b]">
            {reports.summary.todayOrderCount}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-orange-900/10 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <p className="text-sm font-bold text-stone-500">30-day sales</p>
          <p className="mt-2 text-2xl font-black text-[#25130b]">
            {formatPeso(reports.summary.thirtyDayRevenue)}
          </p>
        </div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-orange-900/10 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p className="text-sm font-bold text-stone-500">30-day orders</p>
          <p className="mt-2 text-2xl font-black text-[#25130b]">
            {reports.summary.thirtyDayOrderCount}
          </p>
        </div>
      </section>

      {/* Daily Sales & Payment Status */}
      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl bg-white p-5 ring-1 ring-orange-900/10 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-red-700" aria-hidden="true" />
            <h2 className="font-black text-[#25130b]">Daily sales</h2>
          </div>
          <div className="mt-6 flex h-64 items-end gap-3">
            {reports.dailySales.map((day) => (
              <div key={day.key} className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex h-48 items-end rounded bg-stone-100 px-2">
                  <div
                    className="w-full rounded-t bg-red-700"
                    style={{
                      height: `${Math.max((day.revenue / maxDailyRevenue) * 100, day.revenue > 0 ? 8 : 0)}%`,
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-[#25130b]">
                    {formatPeso(day.revenue)}
                  </p>
                  <p className="text-xs text-stone-500">{day.label}</p>
                  <p className="text-xs text-stone-500">
                    {day.orderCount} orders
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 ring-1 ring-orange-900/10 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-red-700" aria-hidden="true" />
            <h2 className="font-black text-[#25130b]">Payment status</h2>
          </div>
          <div className="mt-5 space-y-3">
            {reports.paymentStatusTotals.length === 0 ? (
              <p className="text-sm text-stone-500">No payment data yet.</p>
            ) : (
              reports.paymentStatusTotals.map((payment) => (
                <div
                  key={payment.status}
                  className="flex items-center justify-between gap-4 border-b border-stone-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <PaymentStatusBadge value={payment.status} />
                    <p className="mt-1 text-xs text-stone-500">
                      {payment.orderCount} orders
                    </p>
                  </div>
                  <p className="font-black text-[#25130b]">
                    {formatPeso(payment.revenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Top Products & Low Stock */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 ring-1 ring-orange-900/10 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center gap-2">
            <PackageSearch className="size-5 text-red-700" aria-hidden="true" />
            <h2 className="font-black text-[#25130b]">Top products</h2>
          </div>
          <div className="mt-5 space-y-3">
            {reports.topProducts.length === 0 ? (
              <p className="text-sm text-stone-500">No product sales yet.</p>
            ) : (
              reports.topProducts.map((product) => (
                <div
                  key={product.productName}
                  className="flex items-center justify-between gap-4 border-b border-stone-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-bold text-[#25130b]">
                      {product.productName}
                    </p>
                    <p className="text-xs text-stone-500">
                      {product.quantity} sold
                    </p>
                  </div>
                  <p className="font-black text-[#25130b]">
                    {formatPeso(product.revenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 ring-1 ring-orange-900/10 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-red-700" aria-hidden="true" />
            <h2 className="font-black text-[#25130b]">Low stock</h2>
          </div>
          <div className="mt-5 space-y-3">
            {reports.lowStockProducts.length === 0 ? (
              <p className="text-sm text-stone-500">No low-stock products.</p>
            ) : (
              reports.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-4 border-b border-stone-100 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <Link
                      href={`/admin/menu/${product.id}/edit`}
                      className="font-bold text-[#25130b] hover:text-red-700"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-stone-500">
                      {product.categoryName}
                    </p>
                  </div>
                  <p className="text-sm font-black text-[#25130b]">
                    {product.stockQuantity} / {product.lowStockThreshold}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

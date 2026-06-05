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
    redirect("/admin/orders");
  }

  const reports = await getAdminReports();
  const maxDailyRevenue = maxValue(
    reports.dailySales.map((day) => day.revenue),
  );

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-wide text-red-700">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-black text-zinc-950">Reports</h1>
          <p className="mt-2 text-zinc-600">
            Review sales, order volume, payment status, and stock alerts.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm font-bold text-zinc-500">Today sales</p>
            <p className="mt-2 text-2xl font-black text-zinc-950">
              {formatPeso(reports.summary.todayRevenue)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm font-bold text-zinc-500">Today orders</p>
            <p className="mt-2 text-2xl font-black text-zinc-950">
              {reports.summary.todayOrderCount}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm font-bold text-zinc-500">30-day sales</p>
            <p className="mt-2 text-2xl font-black text-zinc-950">
              {formatPeso(reports.summary.thirtyDayRevenue)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm font-bold text-zinc-500">30-day orders</p>
            <p className="mt-2 text-2xl font-black text-zinc-950">
              {reports.summary.thirtyDayOrderCount}
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-5 text-red-700" aria-hidden="true" />
              <h2 className="font-black text-zinc-950">Daily sales</h2>
            </div>
            <div className="mt-6 flex h-64 items-end gap-3">
              {reports.dailySales.map((day) => (
                <div key={day.key} className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex h-48 items-end rounded bg-zinc-100 px-2">
                    <div
                      className="w-full rounded-t bg-red-700"
                      style={{
                        height: `${Math.max((day.revenue / maxDailyRevenue) * 100, day.revenue > 0 ? 8 : 0)}%`,
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-zinc-950">
                      {formatPeso(day.revenue)}
                    </p>
                    <p className="text-xs text-zinc-500">{day.label}</p>
                    <p className="text-xs text-zinc-500">
                      {day.orderCount} orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-red-700" aria-hidden="true" />
              <h2 className="font-black text-zinc-950">Payment status</h2>
            </div>
            <div className="mt-5 space-y-3">
              {reports.paymentStatusTotals.length === 0 ? (
                <p className="text-sm text-zinc-500">No payment data yet.</p>
              ) : (
                reports.paymentStatusTotals.map((payment) => (
                  <div
                    key={payment.status}
                    className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <PaymentStatusBadge value={payment.status} />
                      <p className="mt-1 text-xs text-zinc-500">
                        {payment.orderCount} orders
                      </p>
                    </div>
                    <p className="font-black text-zinc-950">
                      {formatPeso(payment.revenue)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <PackageSearch className="size-5 text-red-700" aria-hidden="true" />
              <h2 className="font-black text-zinc-950">Top products</h2>
            </div>
            <div className="mt-5 space-y-3">
              {reports.topProducts.length === 0 ? (
                <p className="text-sm text-zinc-500">No product sales yet.</p>
              ) : (
                reports.topProducts.map((product) => (
                  <div
                    key={product.productName}
                    className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-bold text-zinc-950">
                        {product.productName}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {product.quantity} sold
                      </p>
                    </div>
                    <p className="font-black text-zinc-950">
                      {formatPeso(product.revenue)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-red-700" aria-hidden="true" />
              <h2 className="font-black text-zinc-950">Low stock</h2>
            </div>
            <div className="mt-5 space-y-3">
              {reports.lowStockProducts.length === 0 ? (
                <p className="text-sm text-zinc-500">No low-stock products.</p>
              ) : (
                reports.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <Link
                        href={`/admin/menu/${product.id}/edit`}
                        className="font-bold text-zinc-950 hover:text-red-700"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-zinc-500">
                        {product.categoryName}
                      </p>
                    </div>
                    <p className="text-sm font-black text-zinc-950">
                      {product.stockQuantity} / {product.lowStockThreshold}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

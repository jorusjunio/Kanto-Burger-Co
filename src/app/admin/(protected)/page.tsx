import { Clock, ShoppingCart, TrendingUp, Utensils } from "lucide-react";

import { formatPeso } from "@/lib/format";
import { SalesAnalyticsChart } from "@/features/admin/sales-analytics-chart";
import { RecentOrdersTable } from "@/features/admin/recent-orders-table";
import { OrderBreakdowns } from "@/features/admin/order-breakdowns";

export default async function AdminDashboardPage() {
  // TODO: Replace with actual data from database
  const metrics = {
    totalSalesToday: 15420,
    pendingOrders: 12,
    completedOrdersToday: 28,
    topSellingProducts: [
      { name: "Kanto Burger Special", quantity: 45 },
      { name: "Cheese Burger", quantity: 32 },
      { name: "Bacon Burger", quantity: 28 },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales Today */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-orange-900/10 bg-gradient-to-br from-white to-orange-50/50 px-6 py-5 shadow-lg shadow-orange-900/5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-950/40">
                Total Sales Today
              </p>
              <p className="mt-2 text-2xl font-black text-[#25130b] tabular-nums">
                {formatPeso(metrics.totalSalesToday)}
              </p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-600/30">
              <TrendingUp className="size-6 text-white" />
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-red-600/20 bg-gradient-to-br from-red-50 to-orange-50/50 px-6 py-5 shadow-lg shadow-red-600/10">
          {/* Liquid Wave Background */}
          <div
            className="absolute bottom-0 left-0 right-0 overflow-hidden"
            style={{ height: `${Math.min((metrics.pendingOrders / 30) * 100, 100)}%` }}
          >
            {/* Wave 1 */}
            <div className="absolute bottom-0 left-0 right-0 h-full">
              <svg
                className="absolute bottom-0 w-[200%] h-full animate-wave-1"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                style={{ animationDuration: '8s' }}
              >
                <path
                  fill="rgba(220, 38, 38, 0.1)"
                  d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                />
              </svg>
            </div>
            {/* Wave 2 */}
            <div className="absolute bottom-0 left-0 right-0 h-full">
              <svg
                className="absolute bottom-0 w-[200%] h-full animate-wave-2"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                style={{ animationDuration: '12s' }}
              >
                <path
                  fill="rgba(185, 28, 28, 0.15)"
                  d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                />
              </svg>
            </div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-700/70">
                Pending Orders
              </p>
              <p className="mt-2 text-2xl font-black text-red-700 tabular-nums">
                {metrics.pendingOrders}
              </p>
            </div>
            <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 shadow-lg shadow-red-600/30">
              <Clock className="size-6 text-white" />
              <div className="absolute -top-1 -right-1 flex size-3 items-center justify-center rounded-full bg-amber-400 shadow-sm">
                <div className="size-2 rounded-full bg-amber-400 animate-ping" />
              </div>
            </div>
          </div>
        </div>

        {/* Completed Orders Today */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-orange-900/10 bg-gradient-to-br from-white to-orange-50/50 px-6 py-5 shadow-lg shadow-orange-900/5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-950/40">
                Completed Today
              </p>
              <p className="mt-2 text-2xl font-black text-[#25130b] tabular-nums">
                {metrics.completedOrdersToday}
              </p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-lg shadow-emerald-600/30">
              <ShoppingCart className="size-6 text-white" />
            </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-orange-900/10 bg-gradient-to-br from-white to-orange-50/50 px-6 py-5 shadow-lg shadow-orange-900/5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-orange-950/40">
                Top Product
              </p>
              <p className="mt-2 text-sm font-black text-[#25130b]">
                {metrics.topSellingProducts[0].name}
              </p>
              <p className="mt-1 text-xs font-medium text-orange-950/60">
                {metrics.topSellingProducts[0].quantity} sold
              </p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/30">
              <Utensils className="size-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Split Layout: Sales Analytics Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Sales Analytics Chart (2/3 space) */}
        <div className="lg:col-span-2 bg-white/80 rounded-3xl p-6 shadow-sm border border-stone-100">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b] mb-4">
            Sales Analytics Today
          </h2>
          <SalesAnalyticsChart />
        </div>

        {/* Column 2: Top Selling Products (1/3 space) */}
        <div className="rounded-2xl border-2 border-orange-900/10 bg-gradient-to-br from-white to-orange-50/50 px-6 py-5 shadow-lg shadow-orange-900/5">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b]">
            Top Selling Products Today
          </h2>
          <div className="mt-4 space-y-3">
            {metrics.topSellingProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center gap-4 rounded-xl border border-orange-900/8 bg-white/60 px-4 py-3 shadow-sm"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-xs font-black text-white shadow-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-[#25130b]">{product.name}</p>
                </div>
                <p className="text-xs font-black text-red-700 tabular-nums">
                  {product.quantity} sold
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders + Order Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Recent Orders Table (2/3 space) */}
        <div className="lg:col-span-2 bg-white/80 rounded-3xl p-6 shadow-sm border border-stone-100">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b] mb-4">
            Recent Orders
          </h2>
          <RecentOrdersTable />
        </div>

        {/* Column 2: Order Methods & Payments Breakdowns (1/3 space) */}
        <div className="rounded-2xl border-2 border-orange-900/10 bg-gradient-to-br from-white to-orange-50/50 px-6 py-5 shadow-lg shadow-orange-900/5">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b] mb-4">
            Order Breakdowns
          </h2>
          <OrderBreakdowns />
        </div>
      </div>
    </div>
  );
}

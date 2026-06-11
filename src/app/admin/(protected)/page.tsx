import { Clock, ShoppingCart, TrendingUp, Utensils } from "lucide-react";

import { formatPeso } from "@/lib/format";

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
          <div className="flex items-start justify-between">
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

      {/* Top Selling Products List */}
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
  );
}

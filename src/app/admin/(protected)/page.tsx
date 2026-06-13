import { Clock, ShoppingCart, TrendingUp, Utensils } from "lucide-react";

import { formatPeso } from "@/lib/format";
import { prisma } from "@/server/db/prisma";
import { SalesAnalyticsChart } from "@/features/admin/sales-analytics-chart";
import { RecentOrdersTable } from "@/features/admin/recent-orders-table";
import { OrderBreakdowns } from "@/features/admin/order-breakdowns";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function moneyValue(value: unknown) {
  return Number(value);
}

function percentage(value: number, total: number) {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

async function getDashboardData() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const thirtyDayStart = new Date(todayStart.getTime() - 29 * DAY_MS);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: thirtyDayStart,
      },
    },
    include: {
      items: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const activeOrders = orders.filter((order) => order.status !== "CANCELLED");
  const todayOrders = activeOrders.filter(
    (order) => order.createdAt >= todayStart,
  );
  const pendingOrders = activeOrders.filter((order) =>
    ["PENDING", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(
      order.status,
    ),
  );
  const completedOrdersToday = todayOrders.filter(
    (order) => order.status === "COMPLETED",
  );

  const topSellingProducts = Object.values(
    todayOrders.reduce<
      Record<string, { name: string; quantity: number; revenue: number }>
    >((totals, order) => {
      for (const item of order.items) {
        const key = item.productId ?? item.productName;
        const current = totals[key] ?? {
          name: item.productName,
          quantity: 0,
          revenue: 0,
        };

        current.quantity += item.quantity;
        current.revenue += moneyValue(item.totalPrice);
        totals[key] = current;
      }

      return totals;
    }, {}),
  )
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, 3);

  const salesByHour = Array.from({ length: 7 }, (_, index) => {
    const hour = 6 + index * 2;
    const bucketStart = new Date(todayStart);
    bucketStart.setHours(hour, 0, 0, 0);
    const bucketEnd = new Date(todayStart);
    bucketEnd.setHours(hour + 2, 0, 0, 0);

    return {
      time: new Intl.DateTimeFormat("en-PH", {
        hour: "numeric",
        hour12: true,
      }).format(bucketStart),
      sales: todayOrders
        .filter(
          (order) =>
            order.createdAt >= bucketStart && order.createdAt < bucketEnd,
        )
        .reduce((total, order) => total + moneyValue(order.total), 0),
    };
  });

  const orderTypeCounts = activeOrders.reduce<Record<string, number>>(
    (totals, order) => {
      totals[order.orderType] = (totals[order.orderType] ?? 0) + 1;
      return totals;
    },
    {},
  );
  const paymentCounts = activeOrders.reduce<Record<string, number>>(
    (totals, order) => {
      totals[order.paymentMethod] = (totals[order.paymentMethod] ?? 0) + 1;
      return totals;
    },
    {},
  );

  return {
    totalSalesToday: todayOrders.reduce(
      (total, order) => total + moneyValue(order.total),
      0,
    ),
    pendingOrders: pendingOrders.length,
    completedOrdersToday: completedOrdersToday.length,
    topSellingProducts:
      topSellingProducts.length > 0
        ? topSellingProducts
        : [{ name: "No sales yet", quantity: 0 }],
    salesByHour,
    recentOrders: orders.slice(0, 5).map((order) => ({
      orderNo: order.orderNumber,
      customer: order.customerName,
      time: new Intl.DateTimeFormat("en-PH", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(order.createdAt),
      amount: moneyValue(order.total),
      status: order.status,
    })),
    orderTypes: [
      {
        label: "Pickup",
        value: percentage(orderTypeCounts.PICKUP ?? 0, activeOrders.length),
        color: "bg-red-500",
      },
      {
        label: "Delivery",
        value: percentage(orderTypeCounts.DELIVERY ?? 0, activeOrders.length),
        color: "bg-amber-500",
      },
    ],
    paymentMethods: [
      {
        label: "Cash",
        value: percentage(paymentCounts.CASH ?? 0, activeOrders.length),
        color: "bg-emerald-500",
      },
      {
        label: "COD",
        value: percentage(paymentCounts.COD ?? 0, activeOrders.length),
        color: "bg-orange-500",
      },
      {
        label: "GCash",
        value: percentage(paymentCounts.GCASH ?? 0, activeOrders.length),
        color: "bg-blue-500",
      },
    ],
  };
}

export default async function AdminDashboardPage() {
  const metrics = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales Today */}
        <div className="relative overflow-hidden rounded-2xl border border-white bg-white/90 px-6 py-5 shadow-md shadow-stone-100/50 animate-fade-in" style={{ animationDelay: '0ms' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">
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
        <div className="relative overflow-hidden rounded-2xl border border-white bg-white/90 px-6 py-5 shadow-md shadow-stone-100/50 animate-fade-in" style={{ animationDelay: '100ms' }}>
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
        <div className="relative overflow-hidden rounded-2xl border border-white bg-white/90 px-6 py-5 shadow-md shadow-stone-100/50 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">
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
        <div className="relative overflow-hidden rounded-2xl border border-white bg-white/90 px-6 py-5 shadow-md shadow-stone-100/50 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">
                Top Product
              </p>
              <p className="mt-2 text-sm font-black text-[#25130b]">
                {metrics.topSellingProducts[0].name}
              </p>
              <p className="mt-1 text-xs font-medium text-stone-500">
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
        <div className="lg:col-span-2 border border-white bg-white/90 rounded-3xl p-6 shadow-md shadow-stone-100/50 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b] mb-4">
            Sales Analytics Today
          </h2>
          <SalesAnalyticsChart data={metrics.salesByHour} />
        </div>

        {/* Column 2: Top Selling Products (1/3 space) */}
        <div className="border border-white bg-white/90 rounded-2xl px-6 py-5 shadow-md shadow-stone-100/50 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b]">
            Top Selling Products Today
          </h2>
          <div className="mt-4 space-y-3">
            {metrics.topSellingProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center gap-4 rounded-xl border border-stone-100 bg-white/60 px-4 py-3 shadow-sm"
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
        <div className="lg:col-span-2 border border-white bg-white/90 rounded-3xl p-6 shadow-md shadow-stone-100/50 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b] mb-4">
            Recent Orders
          </h2>
          <RecentOrdersTable data={metrics.recentOrders} />
        </div>

        {/* Column 2: Order Methods & Payments Breakdowns (1/3 space) */}
        <div className="border border-white bg-white/90 rounded-2xl px-6 py-5 shadow-md shadow-stone-100/50 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b] mb-4">
            Order Breakdowns
          </h2>
          <OrderBreakdowns
            orderTypes={metrics.orderTypes}
            paymentMethods={metrics.paymentMethods}
          />
        </div>
      </div>
    </div>
  );
}

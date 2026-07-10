import Link from "next/link";
import { ArrowRight, Clock, ShoppingCart, TrendingUp, Utensils } from "lucide-react";

import { requireManagerPage } from "@/features/admin/auth/guards";
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

  // One point per bucket with both metrics, so the chart can switch between
  // revenue and order count without refetching.
  const bucketize = (start: Date, end: Date, label: string) => {
    const bucket = activeOrders.filter(
      (order) => order.createdAt >= start && order.createdAt < end,
    );
    return {
      label,
      revenue: bucket.reduce(
        (total, order) => total + moneyValue(order.total),
        0,
      ),
      orders: bucket.length,
    };
  };

  const hourFormat = new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    hour12: true,
  });
  const dayFormat = new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
  });
  const weekdayFormat = new Intl.DateTimeFormat("en-PH", { weekday: "short" });

  const salesSeries = {
    // Full day in 3h buckets so no order ever falls outside the chart and the
    // chart total always matches the stat cards.
    today: Array.from({ length: 8 }, (_, index) => {
      const start = new Date(todayStart);
      start.setHours(index * 3, 0, 0, 0);
      const end = new Date(todayStart);
      end.setHours(index * 3 + 3, 0, 0, 0);
      return bucketize(start, end, hourFormat.format(start));
    }),
    week: Array.from({ length: 7 }, (_, index) => {
      const start = new Date(todayStart.getTime() - (6 - index) * DAY_MS);
      const end = new Date(start.getTime() + DAY_MS);
      return bucketize(start, end, weekdayFormat.format(start));
    }),
    month: Array.from({ length: 30 }, (_, index) => {
      const start = new Date(todayStart.getTime() - (29 - index) * DAY_MS);
      const end = new Date(start.getTime() + DAY_MS);
      return bucketize(start, end, dayFormat.format(start));
    }),
  };

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
    salesSeries,
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
  await requireManagerPage();
  const metrics = await getDashboardData();

  const stats = [
    {
      label: "Total Sales Today",
      value: formatPeso(metrics.totalSalesToday),
      Icon: TrendingUp,
      iconClass: "bg-red-700/8 text-red-700",
      href: "/admin/reports",
    },
    {
      label: "Pending Orders",
      value: String(metrics.pendingOrders),
      Icon: Clock,
      iconClass: "bg-amber-500/10 text-amber-600",
      valueClass: metrics.pendingOrders > 0 ? "text-red-700" : undefined,
      href: "/admin/orders",
    },
    {
      label: "Completed Today",
      value: String(metrics.completedOrdersToday),
      Icon: ShoppingCart,
      iconClass: "bg-emerald-600/8 text-emerald-700",
      href: "/admin/orders",
    },
    {
      label: "Top Product",
      value: metrics.topSellingProducts[0].name,
      sub: `${metrics.topSellingProducts[0].quantity} sold`,
      Icon: Utensils,
      iconClass: "bg-orange-950/5 text-orange-950/60",
      valueClass: "text-sm leading-snug",
      href: "/admin/menu",
    },
  ];

  const todayLabel = new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-red-700">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-black text-[#25130b]">Dashboard</h1>
        <p className="mt-1 text-sm font-medium text-orange-950/40">
          {todayLabel}
        </p>
      </div>

      {/* Metrics Grid — each card links to where you act on it */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(
          ({ label, value, sub, Icon, iconClass, valueClass, href }, index) => (
            <Link
              key={label}
              href={href}
              className="admin-card group rounded-xl bg-white p-5 ring-1 ring-orange-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:ring-orange-900/25 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-orange-950/40">
                    {label}
                  </p>
                  <p
                    className={`mt-2 truncate text-2xl font-black text-[#25130b] tabular-nums ${valueClass ?? ""}`}
                  >
                    {value}
                  </p>
                  {sub ? (
                    <p className="mt-0.5 text-xs font-medium text-orange-950/40">
                      {sub}
                    </p>
                  ) : null}
                </div>
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 ${iconClass}`}
                >
                  <Icon className="size-4" />
                </span>
              </div>
            </Link>
          ),
        )}
      </div>

      {/* Split Layout: Sales Analytics Chart + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Sales Analytics Chart (2/3 space) */}
        <div className="admin-card lg:col-span-2 rounded-xl bg-white p-6 ring-1 ring-orange-900/10 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <SalesAnalyticsChart series={metrics.salesSeries} />
        </div>

        {/* Column 2: Top Selling Products (1/3 space) */}
        <div className="admin-card rounded-xl bg-white p-6 ring-1 ring-orange-900/10 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <h2 className="text-[13px] font-black uppercase tracking-wide text-[#25130b]">
            Top Sellers Today
          </h2>
          <div className="mt-3 divide-y divide-orange-900/6">
            {metrics.topSellingProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span className="w-5 shrink-0 font-mono text-xs font-bold text-orange-950/35">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="min-w-0 flex-1 truncate text-sm font-bold text-[#25130b]">
                  {product.name}
                </p>
                <p className="shrink-0 text-xs font-bold text-orange-950/45 tabular-nums">
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
        <div className="admin-card lg:col-span-2 rounded-xl bg-white p-6 ring-1 ring-orange-900/10 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-black uppercase tracking-wide text-[#25130b]">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="group inline-flex items-center gap-1 text-xs font-bold text-orange-950/45 transition-colors hover:text-red-700"
            >
              View all
              <ArrowRight
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
          <RecentOrdersTable data={metrics.recentOrders} />
        </div>

        {/* Column 2: Order Methods & Payments Breakdowns (1/3 space) */}
        <div className="admin-card rounded-xl bg-white p-6 ring-1 ring-orange-900/10 animate-fade-in" style={{ animationDelay: '700ms' }}>
          <h2 className="text-[13px] font-black uppercase tracking-wide text-[#25130b] mb-4">
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

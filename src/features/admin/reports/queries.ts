import { prisma } from "@/server/db/prisma";

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function moneyValue(value: unknown) {
  return Number(value);
}

export async function getAdminReports() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const sevenDayStart = new Date(todayStart.getTime() - 6 * DAY_MS);
  const thirtyDayStart = new Date(todayStart.getTime() - 29 * DAY_MS);

  const [orders, products] = await Promise.all([
    prisma.order.findMany({
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
    }),
    prisma.product.findMany({
      where: {
        trackStock: true,
      },
      include: {
        category: true,
      },
      orderBy: [{ stockQuantity: "asc" }, { name: "asc" }],
      take: 100,
    }),
  ]);

  const activeOrders = orders.filter((order) => order.status !== "CANCELLED");
  const todayOrders = activeOrders.filter(
    (order) => order.createdAt >= todayStart,
  );

  const dailySales = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sevenDayStart.getTime() + index * DAY_MS);
    const key = dateKey(date);
    const dayOrders = activeOrders.filter(
      (order) => dateKey(order.createdAt) === key,
    );

    return {
      key,
      label: new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "numeric",
      }).format(date),
      orderCount: dayOrders.length,
      revenue: dayOrders.reduce(
        (total, order) => total + moneyValue(order.total),
        0,
      ),
    };
  });

  const paymentStatusTotals = Object.values(
    orders.reduce<
      Record<
        string,
        {
          status: string;
          orderCount: number;
          revenue: number;
        }
      >
    >((totals, order) => {
      const current = totals[order.paymentStatus] ?? {
        status: order.paymentStatus,
        orderCount: 0,
        revenue: 0,
      };

      current.orderCount += 1;
      current.revenue += moneyValue(order.total);
      totals[order.paymentStatus] = current;
      return totals;
    }, {}),
  );

  const topProducts = Object.values(
    activeOrders.reduce<
      Record<
        string,
        {
          productName: string;
          quantity: number;
          revenue: number;
        }
      >
    >((totals, order) => {
      for (const item of order.items) {
        const key = item.productId ?? item.productName;
        const current = totals[key] ?? {
          productName: item.productName,
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
    .slice(0, 5);

  const lowStockProducts = products
    .filter((product) => product.stockQuantity <= product.lowStockThreshold)
    .slice(0, 10)
    .map((product) => ({
      id: product.id,
      name: product.name,
      categoryName: product.category.name,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
    }));

  return {
    summary: {
      todayRevenue: todayOrders.reduce(
        (total, order) => total + moneyValue(order.total),
        0,
      ),
      todayOrderCount: todayOrders.length,
      thirtyDayRevenue: activeOrders.reduce(
        (total, order) => total + moneyValue(order.total),
        0,
      ),
      thirtyDayOrderCount: activeOrders.length,
    },
    dailySales,
    paymentStatusTotals,
    topProducts,
    lowStockProducts,
  };
}

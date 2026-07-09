import { notFound } from "next/navigation";

import { OrderStatus } from "@/generated/prisma/enums";
import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";

/**
 * Active orders for the kitchen board — everything still being worked on, oldest
 * first so the crew clears the queue in the order it came in. Closed orders
 * (Completed / Cancelled) drop off the board entirely.
 */
export async function getKitchenOrders() {
  try {
    return await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY],
        },
      },
      orderBy: { createdAt: "asc" },
      include: {
        items: true,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch kitchen orders", error);
    throw new Error("Unable to load kitchen orders. Please try again.");
  }
}

export async function getAdminOrders() {
  try {
    return await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
      take: 50,
    });
  } catch (error) {
    logger.error("Failed to fetch admin orders", error);
    throw new Error("Unable to load orders. Please try again.");
  }
}

export async function getAdminOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!order) {
      notFound();
    }

    return order;
  } catch (error) {
    logger.error("Failed to fetch admin order", error, { orderId });
    throw new Error("Unable to load order. Please try again.");
  }
}

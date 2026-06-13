import { notFound } from "next/navigation";

import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";

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

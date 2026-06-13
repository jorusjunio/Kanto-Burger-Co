import { notFound } from "next/navigation";

import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";

export async function getOrderByNumber(orderNumber: string, trackingToken: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          orderBy: { id: "asc" },
        },
      },
    });

    if (!order || order.trackingToken !== trackingToken) {
      notFound();
    }

    return order;
  } catch (error) {
    logger.error("Failed to fetch order", error, { orderNumber });
    throw new Error("Unable to load order. Please try again.");
  }
}

import { notFound } from "next/navigation";

import { prisma } from "@/server/db/prisma";

export async function getOrderByNumber(orderNumber: string, trackingToken: string) {
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
}

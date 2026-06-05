import { notFound } from "next/navigation";

import { prisma } from "@/server/db/prisma";

export async function getAdminOrders() {
  return prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
    take: 50,
  });
}

export async function getAdminOrder(orderId: string) {
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
}

import { notFound } from "next/navigation";

import { prisma } from "@/server/db/prisma";

export async function getAdminMenuProducts() {
  return prisma.product.findMany({
    orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
    include: {
      category: true,
      addOns: {
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function getAdminMenuCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getAdminMenuCategoriesWithProductCounts() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
}

export async function getAdminMenuProduct(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      addOns: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return product;
}

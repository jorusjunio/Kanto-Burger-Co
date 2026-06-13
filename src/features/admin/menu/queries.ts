import { notFound } from "next/navigation";

import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";

export async function getAdminMenuProducts() {
  try {
    return await prisma.product.findMany({
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
      include: {
        category: true,
        addOns: {
          orderBy: { name: "asc" },
        },
      },
    });
  } catch (error) {
    logger.error("Failed to fetch admin menu products", error);
    throw new Error("Unable to load menu products. Please try again.");
  }
}

export async function getAdminMenuCategories() {
  try {
    return await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  } catch (error) {
    logger.error("Failed to fetch admin menu categories", error);
    throw new Error("Unable to load menu categories. Please try again.");
  }
}

export async function getAdminMenuCategoriesWithProductCounts() {
  try {
    return await prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  } catch (error) {
    logger.error("Failed to fetch admin menu categories with counts", error);
    throw new Error("Unable to load menu categories. Please try again.");
  }
}

export async function getAdminMenuProduct(productId: string) {
  try {
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
  } catch (error) {
    logger.error("Failed to fetch admin menu product", error, { productId });
    throw new Error("Unable to load product. Please try again.");
  }
}

import { unstable_cache } from "next/cache";

import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";

import type { MenuCategory } from "./types";

async function fetchMenuCategories(): Promise<MenuCategory[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          where: { isActive: true },
          orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
          include: {
            addOns: {
              orderBy: { name: "asc" },
            },
          },
        },
      },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder,
      products: category.products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: Number(product.price),
        imageUrl: product.imageUrl,
        isFeatured: product.isFeatured,
        isAvailable: product.isAvailable,
        trackStock: product.trackStock,
        stockQuantity: product.stockQuantity,
        lowStockThreshold: product.lowStockThreshold,
        addOns: product.addOns.map((addOn) => ({
          id: addOn.id,
          name: addOn.name,
          price: Number(addOn.price),
          isAvailable: addOn.isAvailable,
        })),
      })),
    }));
  } catch (error) {
    logger.error("Failed to fetch menu categories", error);
    throw new Error("Unable to load menu. Please try again.");
  }
}

export const getMenuCategories = unstable_cache(
  fetchMenuCategories,
  ["menu-categories"],
  { revalidate: 60 },
);

export async function getFeaturedProducts() {
  try {
    const categories = await getMenuCategories();

    return categories
      .flatMap((category) => category.products)
      .filter((product) => product.isFeatured)
      .slice(0, 4);
  } catch (error) {
    logger.error("Failed to fetch featured products", error);
    throw new Error("Unable to load featured products. Please try again.");
  }
}

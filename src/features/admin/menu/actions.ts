"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminRoleSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { uploadProductImage } from "@/server/services/cloudinary";

import {
  imageFileSchema,
  money,
  parseAddOns,
  readAvailabilityToggle,
  readCategoryForm,
  readProductForm,
  readProductId,
  resolveSlug,
} from "./action-helpers";

async function resolveImageUrl(formData: FormData, fallbackUrl?: string | null) {
  const imageFile = imageFileSchema.parse(formData.get("imageFile"));

  if (imageFile && imageFile.size > 0) {
    const upload = await uploadProductImage(imageFile);
    return upload.secure_url;
  }

  return fallbackUrl || null;
}

function revalidateAdminMenu() {
  revalidatePath("/menu");
  revalidatePath("/admin/menu");
  revalidatePath("/admin/categories");
}

export async function createCategory(formData: FormData) {
  await requireAdminRoleSession();

  const values = readCategoryForm(formData);
  const slug = resolveSlug(values.slug, values.name);

  await prisma.category.create({
    data: {
      name: values.name,
      slug,
      sortOrder: values.sortOrder,
    },
  });

  revalidateAdminMenu();
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdminRoleSession();

  const values = readCategoryForm(formData);
  const slug = resolveSlug(values.slug, values.name);

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: values.name,
      slug,
      sortOrder: values.sortOrder,
    },
  });

  revalidateAdminMenu();
}
export async function createProduct(formData: FormData) {
  await requireAdminRoleSession();

  const values = readProductForm(formData);
  const slug = resolveSlug(values.slug, values.name);
  const imageUrl = await resolveImageUrl(formData, values.imageUrl);

  await prisma.product.create({
    data: {
      categoryId: values.categoryId,
      name: values.name,
      slug,
      description: values.description,
      price: money(values.price),
      imageUrl,
      isFeatured: values.isFeatured,
      isAvailable: values.isAvailable,
      trackStock: values.trackStock,
      stockQuantity: values.stockQuantity,
      lowStockThreshold: values.lowStockThreshold,
      addOns: {
        create: parseAddOns(values.addOns),
      },
    },
  });

  revalidateAdminMenu();
  redirect("/admin/menu");
}

export async function updateProduct(productId: string, formData: FormData) {
  await requireAdminRoleSession();

  const values = readProductForm(formData);
  const slug = resolveSlug(values.slug, values.name);
  const imageUrl = await resolveImageUrl(formData, values.imageUrl);

  await prisma.$transaction(async (tx) => {
    await tx.addOn.deleteMany({
      where: { productId },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        categoryId: values.categoryId,
        name: values.name,
        slug,
        description: values.description,
        price: money(values.price),
        imageUrl,
        isFeatured: values.isFeatured,
        isAvailable: values.isAvailable,
        trackStock: values.trackStock,
        stockQuantity: values.stockQuantity,
        lowStockThreshold: values.lowStockThreshold,
        addOns: {
          create: parseAddOns(values.addOns),
        },
      },
    });
  });

  revalidateAdminMenu();
  redirect("/admin/menu");
}

export async function toggleProductAvailability(formData: FormData) {
  await requireAdminRoleSession();

  const { productId, isAvailable } = readAvailabilityToggle(formData);

  await prisma.product.update({
    where: { id: productId },
    data: { isAvailable },
  });

  revalidateAdminMenu();
}

/**
 * Delete a product. To protect order history and avoid a foreign-key crash,
 * products already referenced by an OrderItem are SOFT-deleted (isActive=false),
 * keeping the row so past orders and reports still resolve the product. Products
 * never ordered are safe to HARD-delete (add-ons cascade away).
 */
export async function deleteProduct(formData: FormData) {
  await requireAdminRoleSession();

  const productId = readProductId(formData);

  const referencedByOrders = await prisma.orderItem.count({
    where: { productId },
  });

  if (referencedByOrders > 0) {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: false, isAvailable: false },
    });
  } else {
    await prisma.product.delete({
      where: { id: productId },
    });
  }

  revalidateAdminMenu();
}



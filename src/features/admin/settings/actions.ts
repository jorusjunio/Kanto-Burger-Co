"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdminRoleSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

const settingsSchema = z.object({
  deliveryFee: z.coerce
    .number()
    .min(0, "Delivery fee cannot be negative.")
    .max(9999, "Delivery fee looks too large."),
  isAcceptingOrders: z.boolean(),
});

export async function updateStoreSettings(formData: FormData) {
  await requireAdminRoleSession();

  const values = settingsSchema.parse({
    deliveryFee: formData.get("deliveryFee"),
    isAcceptingOrders: formData.get("isAcceptingOrders") === "on",
  });

  await prisma.storeSettings.upsert({
    where: { id: "store" },
    update: {
      deliveryFee: values.deliveryFee.toFixed(2),
      isAcceptingOrders: values.isAcceptingOrders,
    },
    create: {
      id: "store",
      deliveryFee: values.deliveryFee.toFixed(2),
      isAcceptingOrders: values.isAcceptingOrders,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
}

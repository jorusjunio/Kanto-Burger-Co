"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";
import { triggerRealtimeEvent } from "@/server/services/pusher";

import type { AdminOrderActionDeps } from "./action-handlers";
import {
  updateOrderStatusWithDeps,
  updatePaymentStatusWithDeps,
} from "./action-handlers";

const deps: AdminOrderActionDeps = {
  requireAdminSession,
  prisma: prisma as unknown as AdminOrderActionDeps["prisma"],
  revalidatePath,
  triggerRealtimeEvent: triggerRealtimeEvent as AdminOrderActionDeps["triggerRealtimeEvent"],
};

export async function updateOrderStatus(formData: FormData) {
  await updateOrderStatusWithDeps(formData, deps);
}

export async function updatePaymentStatus(formData: FormData) {
  await updatePaymentStatusWithDeps(formData, deps);
}

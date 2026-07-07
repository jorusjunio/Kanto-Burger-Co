import { z } from "zod";

import type { Order, OrderItem, Prisma, Product } from "@/generated/prisma/client";
import {
  PaymentMethod,
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/enums";
import { logger } from "@/lib/logger";

import { assertAllowedStatusTransition } from "./lifecycle";

const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  // Enum values sourced from the generated Prisma enum so this schema stays in
  // lockstep with the DB enum and lifecycle.ts — single source of truth, no
  // hand-duplicated string list to drift.
  status: z.enum(OrderStatus),
});

const updatePaymentStatusSchema = z.object({
  orderId: z.string().min(1),
  paymentStatus: z.enum(PaymentStatus),
});

// Dependency-injection contract types. Kept intentionally narrow (only the
// fields these handlers actually read/write) so tests can inject lightweight
// mocks — but every field shape is now derived from the generated Prisma models
// and arg types. A schema change that renames or retypes a column now fails
// compilation here instead of drifting silently out of sync.

type OrderUpdatePayload = Pick<
  Order,
  "id" | "orderNumber" | "trackingToken" | "status" | "paymentStatus"
> & { timestamp?: number };

/** Order + line items read inside the status transaction to restore stock. */
type OrderWithRestockItems = Pick<Order, "status"> & {
  items: Array<
    Pick<OrderItem, "quantity" | "productId"> & {
      product: Pick<Product, "id" | "trackStock"> | null;
    }
  >;
};

/** Atomic stock-increment issued when an active order is cancelled. */
type RestockProductArgs = {
  where: Pick<Product, "id">;
  data: { stockQuantity: { increment: number } };
};

export type OrderTransactionClient = {
  order: {
    findUnique: (
      args: Prisma.OrderFindUniqueArgs,
    ) => Promise<OrderWithRestockItems | null>;
    update: (args: Prisma.OrderUpdateArgs) => Promise<OrderUpdatePayload>;
  };
  product: {
    update: (args: RestockProductArgs) => Promise<{ count: number }>;
  };
};

type OrderPrismaClient = {
  $transaction: <T>(
    callback: (tx: OrderTransactionClient) => Promise<T>,
  ) => Promise<T>;
  order: {
    findUnique: (
      args: Prisma.OrderFindUniqueArgs,
    ) => Promise<Pick<Order, "paymentMethod"> | null>;
    update: (args: Prisma.OrderUpdateArgs) => Promise<OrderUpdatePayload>;
  };
};

export type AdminOrderActionDeps = {
  requireAdminSession: () => Promise<{ user: { id: string; role?: string } }>;
  prisma: OrderPrismaClient;
  revalidatePath: (path: string) => void;
  triggerRealtimeEvent: (
    channel: string,
    event: string,
    payload: OrderUpdatePayload,
  ) => Promise<void>;
};

function revalidateOrderViews(
  revalidatePath: AdminOrderActionDeps["revalidatePath"],
  orderNumber: string,
) {
  revalidatePath("/admin/orders");
  revalidatePath("/admin/reports");
  revalidatePath(`/order/${orderNumber}`);
}

async function triggerOrderUpdatedEvents(
  triggerRealtimeEvent: AdminOrderActionDeps["triggerRealtimeEvent"],
  order: OrderUpdatePayload,
) {
  try {
    await triggerRealtimeEvent("admin-orders", "order-updated", {
      ...order,
      timestamp: Date.now(),
    });
    await triggerRealtimeEvent(`order-${order.trackingToken}`, "order-updated", {
      ...order,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error("Failed to trigger order update events", error);
    // Don't throw - event failure shouldn't break the main operation
  }
}

export async function updateOrderStatusWithDeps(
  formData: FormData,
  deps: AdminOrderActionDeps,
) {
  await deps.requireAdminSession();

  const parsed = updateOrderStatusSchema.parse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });

  const nextStatus = parsed.status;

  const order = await deps.prisma.$transaction(async (tx) => {
    const currentOrder = await tx.order.findUnique({
      where: { id: parsed.orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                trackStock: true,
              },
            },
          },
        },
      },
    });

    if (!currentOrder) {
      throw new Error("Order not found.");
    }

    assertAllowedStatusTransition(currentOrder.status, nextStatus);

    const updatedOrder = await tx.order.update({
      where: { id: parsed.orderId },
      data: { status: nextStatus },
      select: {
        id: true,
        orderNumber: true,
        trackingToken: true,
        status: true,
        paymentStatus: true,
      },
    });

    if (
      nextStatus === OrderStatus.CANCELLED &&
      currentOrder.status !== OrderStatus.CANCELLED
    ) {
      await Promise.all(
        currentOrder.items.map((item) => {
          if (!item.product?.trackStock || !item.productId) {
            return Promise.resolve();
          }

          return tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          });
        }),
      );
    }

    return updatedOrder;
  });

  revalidateOrderViews(deps.revalidatePath, order.orderNumber);
  await triggerOrderUpdatedEvents(deps.triggerRealtimeEvent, order);
}

export async function updatePaymentStatusWithDeps(
  formData: FormData,
  deps: AdminOrderActionDeps,
) {
  await deps.requireAdminSession();

  const parsed = updatePaymentStatusSchema.parse({
    orderId: formData.get("orderId"),
    paymentStatus: formData.get("paymentStatus"),
  });

  const currentOrder = await deps.prisma.order.findUnique({
    where: { id: parsed.orderId },
    select: {
      paymentMethod: true,
    },
  });

  if (!currentOrder) {
    throw new Error("Order not found.");
  }

  if (
    parsed.paymentStatus === PaymentStatus.PENDING &&
    currentOrder.paymentMethod !== PaymentMethod.GCASH
  ) {
    throw new Error("Pending payment verification is only available for GCash orders.");
  }

  const order = await deps.prisma.order.update({
    where: { id: parsed.orderId },
    data: { paymentStatus: parsed.paymentStatus },
    select: {
      id: true,
      orderNumber: true,
      trackingToken: true,
      status: true,
      paymentStatus: true,
    },
  });

  revalidateOrderViews(deps.revalidatePath, order.orderNumber);
  await triggerOrderUpdatedEvents(deps.triggerRealtimeEvent, order);
}

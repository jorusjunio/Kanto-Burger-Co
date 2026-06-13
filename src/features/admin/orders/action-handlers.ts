import { z } from "zod";

import {
  PaymentMethod,
  OrderStatus,
  PaymentStatus,
} from "@/generated/prisma/enums";

import { assertAllowedStatusTransition } from "./lifecycle";

const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum([
    "PENDING",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "COMPLETED",
    "CANCELLED",
  ]),
});

const updatePaymentStatusSchema = z.object({
  orderId: z.string().min(1),
  paymentStatus: z.enum(["UNPAID", "PENDING", "PAID"]),
});

type OrderUpdatePayload = {
  id: string;
  orderNumber: string;
  trackingToken: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  timestamp?: number;
};

type ProductUpdateInput = {
  where: { id: string };
  data: {
    stockQuantity: {
      increment: number;
    };
  };
};

type OrderFindUniqueArgs = {
  where: { id: string };
  include?: {
    items?: {
      include?: {
        product?: {
          select?: {
            id: boolean;
            trackStock: boolean;
          };
        };
      };
    };
  };
};

type OrderUpdateArgs = {
  where: { id: string };
  data: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
  };
  select?: {
    id: boolean;
    orderNumber: boolean;
    trackingToken: boolean;
    status: boolean;
    paymentStatus: boolean;
  };
};

type OrderPaymentMethodArgs = {
  where: { id: string };
  select?: {
    paymentMethod: boolean;
  };
};

export type OrderTransactionClient = {
  order: {
    findUnique: (args: OrderFindUniqueArgs) => Promise<{
      status: OrderStatus;
      items: Array<{
        quantity: number;
        productId: string | null;
        product: {
          id: string;
          trackStock: boolean;
        } | null;
      }>;
    } | null>;
    update: (args: OrderUpdateArgs) => Promise<OrderUpdatePayload>;
  };
  product: {
    update: (args: ProductUpdateInput) => Promise<{ count: number }>;
  };
};

type OrderPrismaClient = {
  $transaction: <T>(
    callback: (tx: OrderTransactionClient) => Promise<T>,
  ) => Promise<T>;
  order: {
    findUnique: (args: OrderPaymentMethodArgs) => Promise<{
      paymentMethod: PaymentMethod;
    } | null>;
    update: (args: OrderUpdateArgs) => Promise<OrderUpdatePayload>;
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
    console.error("Failed to trigger order update events:", error);
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

  const nextStatus = parsed.status as OrderStatus;

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
    data: { paymentStatus: parsed.paymentStatus as PaymentStatus },
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

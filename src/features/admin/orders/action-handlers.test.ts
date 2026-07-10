import assert from "node:assert/strict";
import test from "node:test";

import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/generated/prisma/enums";

import type {
  AdminOrderActionDeps,
  OrderTransactionClient,
} from "./action-handlers";
import {
  updateOrderStatusWithDeps,
  updatePaymentStatusWithDeps,
} from "./action-handlers";

function formData(values: Record<string, string>) {
  const form = new FormData();

  for (const [key, value] of Object.entries(values)) {
    form.set(key, value);
  }

  return form;
}

function orderPayload(overrides: Partial<{
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}> = {}) {
  return {
    id: "order-1",
    orderNumber: "KBC-1001",
    trackingToken: "track-1001",
    status: overrides.status ?? OrderStatus.PREPARING,
    paymentStatus: overrides.paymentStatus ?? PaymentStatus.UNPAID,
  };
}

test("admin order status updates require an authenticated session before database work", async () => {
  let didStartTransaction = false;
  const deps: AdminOrderActionDeps = {
    requireAdminSession: async () => {
      throw new Error("Unauthorized");
    },
    prisma: {
      $transaction: (async <T>(
        _cb: (tx: OrderTransactionClient) => Promise<T>,
      ): Promise<T> => {
        void _cb;
        didStartTransaction = true;
        return orderPayload() as T;
      }) as AdminOrderActionDeps['prisma']['$transaction'],
      order: {
        findUnique: async () => ({ paymentMethod: PaymentMethod.GCASH }),
        update: async () => orderPayload(),
      },
    },
    revalidatePath: () => {},
    triggerRealtimeEvent: async () => {},
  };

  await assert.rejects(
    updateOrderStatusWithDeps(
      formData({ orderId: "order-1", status: OrderStatus.CANCELLED }),
      deps,
    ),
    /Unauthorized/,
  );
  assert.equal(didStartTransaction, false);
});

test("cancelling an active order restores tracked product stock once per tracked item", async () => {
  const productUpdates: unknown[] = [];
  const revalidatedPaths: string[] = [];
  const realtimeEvents: string[] = [];
  const deps: AdminOrderActionDeps = {
    requireAdminSession: async () => ({ user: { id: "admin-1" } }),
    prisma: {
      $transaction: (<T>(
        callback: (tx: OrderTransactionClient) => Promise<T>,
      ): Promise<T> =>
        callback({
          order: {
            findUnique: async () => ({
              status: OrderStatus.PREPARING,
              paymentStatus: PaymentStatus.UNPAID,
              items: [
                {
                  quantity: 3,
                  productId: "tracked-product",
                  product: { id: "tracked-product", trackStock: true },
                },
                {
                  quantity: 2,
                  productId: "untracked-product",
                  product: { id: "untracked-product", trackStock: false },
                },
                {
                  quantity: 1,
                  productId: null,
                  product: null,
                },
              ],
            }),
            update: async () =>
              orderPayload({
                status: OrderStatus.CANCELLED,
              }),
          },
          product: {
            update: async (args: { where: { id: string }; data: { stockQuantity: { increment: number } } }) => {
              productUpdates.push(args);
              return { count: 1 };
            },
          },
        })) as AdminOrderActionDeps['prisma']['$transaction'],
      order: {
        findUnique: async () => ({ paymentMethod: PaymentMethod.GCASH }),
        update: async () => orderPayload(),
      },
    },
    revalidatePath: (path) => {
      revalidatedPaths.push(path);
    },
    triggerRealtimeEvent: async (channel, event) => {
      realtimeEvents.push(`${channel}:${event}`);
    },
  };

  await updateOrderStatusWithDeps(
    formData({ orderId: "order-1", status: OrderStatus.CANCELLED }),
    deps,
  );

  assert.deepEqual(productUpdates, [
    {
      where: { id: "tracked-product" },
      data: {
        stockQuantity: {
          increment: 3,
        },
      },
    },
  ]);
  assert.deepEqual(revalidatedPaths, [
    "/admin/orders",
    "/kitchen",
    "/admin/reports",
    "/order/KBC-1001",
  ]);
  assert.deepEqual(realtimeEvents, [
    "admin-orders:order-updated",
    "order-track-1001:order-updated",
  ]);
});

test("completing an unpaid order auto-settles its payment to PAID", async () => {
  const orderUpdates: Array<{ data: Record<string, unknown> }> = [];
  const deps: AdminOrderActionDeps = {
    requireAdminSession: async () => ({ user: { id: "staff-1" } }),
    prisma: {
      $transaction: (<T>(
        callback: (tx: OrderTransactionClient) => Promise<T>,
      ): Promise<T> =>
        callback({
          order: {
            findUnique: async () => ({
              status: OrderStatus.READY,
              paymentStatus: PaymentStatus.UNPAID,
              items: [],
            }),
            update: async (args: { data: Record<string, unknown> }) => {
              orderUpdates.push(args);
              return orderPayload({
                status: OrderStatus.COMPLETED,
                paymentStatus: PaymentStatus.PAID,
              });
            },
          },
          product: {
            update: async () => ({ count: 0 }),
          },
        })) as AdminOrderActionDeps['prisma']['$transaction'],
      order: {
        findUnique: async () => ({ paymentMethod: PaymentMethod.CASH }),
        update: async () => orderPayload(),
      },
    },
    revalidatePath: () => {},
    triggerRealtimeEvent: async () => {},
  };

  await updateOrderStatusWithDeps(
    formData({ orderId: "order-1", status: OrderStatus.COMPLETED }),
    deps,
  );

  assert.equal(orderUpdates.length, 1);
  assert.deepEqual(orderUpdates[0].data, {
    status: OrderStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
  });
});

test("completing an already-paid order leaves its payment untouched", async () => {
  const orderUpdates: Array<{ data: Record<string, unknown> }> = [];
  const deps: AdminOrderActionDeps = {
    requireAdminSession: async () => ({ user: { id: "staff-1" } }),
    prisma: {
      $transaction: (<T>(
        callback: (tx: OrderTransactionClient) => Promise<T>,
      ): Promise<T> =>
        callback({
          order: {
            findUnique: async () => ({
              status: OrderStatus.READY,
              paymentStatus: PaymentStatus.PAID,
              items: [],
            }),
            update: async (args: { data: Record<string, unknown> }) => {
              orderUpdates.push(args);
              return orderPayload({ status: OrderStatus.COMPLETED });
            },
          },
          product: {
            update: async () => ({ count: 0 }),
          },
        })) as AdminOrderActionDeps['prisma']['$transaction'],
      order: {
        findUnique: async () => ({ paymentMethod: PaymentMethod.CASH }),
        update: async () => orderPayload(),
      },
    },
    revalidatePath: () => {},
    triggerRealtimeEvent: async () => {},
  };

  await updateOrderStatusWithDeps(
    formData({ orderId: "order-1", status: OrderStatus.COMPLETED }),
    deps,
  );

  assert.equal(orderUpdates.length, 1);
  assert.deepEqual(orderUpdates[0].data, { status: OrderStatus.COMPLETED });
});

test("payment status updates validate input and refresh order views", async () => {
  const orderUpdates: unknown[] = [];
  const revalidatedPaths: string[] = [];
  const realtimeEvents: string[] = [];
  const deps: AdminOrderActionDeps = {
    requireAdminSession: async () => ({ user: { id: "staff-1" } }),
    prisma: {
      $transaction: (async <T>(
        _cb: (tx: OrderTransactionClient) => Promise<T>,
      ): Promise<T> => {
        void _cb;
        return orderPayload() as T;
      }) as AdminOrderActionDeps['prisma']['$transaction'],
      order: {
        findUnique: async () => ({ paymentMethod: PaymentMethod.GCASH }),
        update: async (args) => {
          orderUpdates.push(args);
          return orderPayload({
            paymentStatus: PaymentStatus.PAID,
          });
        },
      },
    },
    revalidatePath: (path) => {
      revalidatedPaths.push(path);
    },
    triggerRealtimeEvent: async (channel, event) => {
      realtimeEvents.push(`${channel}:${event}`);
    },
  };

  await updatePaymentStatusWithDeps(
    formData({ orderId: "order-1", paymentStatus: PaymentStatus.PAID }),
    deps,
  );

  assert.deepEqual(orderUpdates, [
    {
      where: { id: "order-1" },
      data: { paymentStatus: PaymentStatus.PAID },
      select: {
        id: true,
        orderNumber: true,
        trackingToken: true,
        status: true,
        paymentStatus: true,
      },
    },
  ]);
  assert.deepEqual(revalidatedPaths, [
    "/admin/orders",
    "/kitchen",
    "/admin/reports",
    "/order/KBC-1001",
  ]);
  assert.deepEqual(realtimeEvents, [
    "admin-orders:order-updated",
    "order-track-1001:order-updated",
  ]);
});

test("payment status updates reject pending verification for non-GCash orders", async () => {
  let didUpdateOrder = false;
  const deps: AdminOrderActionDeps = {
    requireAdminSession: async () => ({ user: { id: "staff-1" } }),
    prisma: {
      $transaction: (async <T>(
        _cb: (tx: OrderTransactionClient) => Promise<T>,
      ): Promise<T> => {
        void _cb;
        return orderPayload() as T;
      }) as AdminOrderActionDeps['prisma']['$transaction'],
      order: {
        findUnique: async () => ({ paymentMethod: PaymentMethod.CASH }),
        update: async () => {
          didUpdateOrder = true;
          return orderPayload();
        },
      },
    },
    revalidatePath: () => {},
    triggerRealtimeEvent: async () => {},
  };

  await assert.rejects(
    updatePaymentStatusWithDeps(
      formData({ orderId: "order-1", paymentStatus: PaymentStatus.PENDING }),
      deps,
    ),
    /only available for GCash/,
  );
  assert.equal(didUpdateOrder, false);
});

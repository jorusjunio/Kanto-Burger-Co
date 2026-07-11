"use server";

import { revalidatePath } from "next/cache";
import { PaymentStatus } from "@/generated/prisma/enums";
import { prisma } from "@/server/db/prisma";
import { triggerRealtimeEvent } from "@/server/services/pusher";
import { logger } from "@/lib/logger";
import { checkoutRateLimiter } from "@/lib/rate-limiter";
import { paymentProvider } from "@/features/payments/provider";
import { getStoreSettings } from "@/features/admin/settings/queries";

import type { CreateOrderResult } from "./types";
import { createOrderSchema } from "./validation";

class CheckoutError extends Error {}

function money(value: number) {
  return value.toFixed(2);
}

function makeOrderNumber() {
  const now = new Date();
  const datePart = [
    now.getFullYear().toString().slice(-2),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const timePart = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `KBC-${datePart}-${timePart}-${randomPart}`;
}

function makeTrackingToken() {
  return crypto.randomUUID().replaceAll("-", "");
}

export async function createOrder(
  input: unknown,
): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid checkout details.",
    };
  }

  const values = parsed.data;

  // Rate limiting based on customer phone
  const rateLimitResult = await checkoutRateLimiter.check(values.customerPhone);
  if (!rateLimitResult.allowed) {
    logger.warn("Rate limit exceeded for checkout", { customerPhone: values.customerPhone });
    return {
      ok: false,
      message: "Too many checkout attempts. Please try again later.",
    };
  }

  // Manager-editable business settings — fee and the master ordering switch.
  const settings = await getStoreSettings();
  if (!settings.isAcceptingOrders) {
    return {
      ok: false,
      message:
        "Sorry — we're not taking orders right now. Please check back later.",
    };
  }

  const productIds = [...new Set(values.items.map((item) => item.productId))];
  const deliveryFee =
    values.orderType === "DELIVERY" ? Number(settings.deliveryFee) : 0;
  const orderNumber = makeOrderNumber();
  const trackingToken = makeTrackingToken();

  let orderId = "";
  let orderTotal = 0;

  try {
    const createdOrder = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          name: true,
          price: true,
          isAvailable: true,
          trackStock: true,
          stockQuantity: true,
          addOns: {
            where: {
              isAvailable: true,
            },
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
      const productById = new Map(
        products.map((product) => [product.id, product]),
      );

      const orderItems = values.items.map((item) => {
        const product = productById.get(item.productId);

        if (!product || !product.isAvailable) {
          throw new CheckoutError(`${item.name} is no longer available.`);
        }

        if (product.trackStock && product.stockQuantity < item.quantity) {
          throw new CheckoutError(
            `${product.name} only has ${product.stockQuantity} left.`,
          );
        }

        const requestedAddOnIds = item.addOns.map((addOn) => addOn.id);
        const uniqueRequestedAddOnIds = new Set(requestedAddOnIds);

        if (uniqueRequestedAddOnIds.size !== requestedAddOnIds.length) {
          throw new CheckoutError(`Invalid add-ons selected for ${product.name}.`);
        }

        const availableAddOnById = new Map(
          product.addOns.map((addOn) => [addOn.id, addOn]),
        );
        const selectedAddOns = requestedAddOnIds.map((addOnId) => {
          const addOn = availableAddOnById.get(addOnId);

          if (!addOn) {
            throw new CheckoutError(
              `Invalid add-ons selected for ${product.name}.`,
            );
          }

          return {
            id: addOn.id,
            name: addOn.name,
            price: Number(addOn.price),
          };
        });
        const addOnsTotal = selectedAddOns.reduce(
          (sum, addOn) => sum + addOn.price,
          0,
        );
        const unitPrice = Number(product.price) + addOnsTotal;

        return {
          product,
          create: {
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: money(unitPrice),
            totalPrice: money(unitPrice * item.quantity),
            selectedAddOns,
            notes: item.notes || null,
          },
        };
      });
      const subtotal = orderItems.reduce(
        (sum, item) => sum + Number(item.create.totalPrice),
        0,
      );
      const total = subtotal + deliveryFee;

      const order = await tx.order.create({
        data: {
          orderNumber,
          trackingToken,
          customerName: values.customerName,
          customerPhone: values.customerPhone,
          orderType: values.orderType,
          deliveryAddress:
            values.orderType === "DELIVERY" ? values.deliveryAddress : null,
          paymentMethod: values.paymentMethod,
          paymentStatus:
            values.paymentMethod === "GCASH"
              ? PaymentStatus.PENDING
              : PaymentStatus.UNPAID,
          // Manual GCash reference retired — GCash now settles via the
          // automated payment gateway, so no reference is collected.
          gcashReference: null,
          subtotal: money(subtotal),
          deliveryFee: money(deliveryFee),
          total: money(total),
          notes: values.notes || null,
          items: {
            create: orderItems.map((item) => item.create),
          },
        },
      });

      await Promise.all(
        orderItems.map(async (item) => {
          if (!item.product.trackStock) {
            return Promise.resolve();
          }

          const update = await tx.product.updateMany({
            where: {
              id: item.product.id,
              stockQuantity: {
                gte: item.create.quantity,
              },
            },
            data: {
              stockQuantity: {
                decrement: item.create.quantity,
              },
            },
          });

          if (update.count !== 1) {
            throw new CheckoutError(
              `${item.product.name} does not have enough stock left.`,
            );
          }
        }),
      );

      return order;
    });

    orderId = createdOrder.id;
    orderTotal = Number(createdOrder.total);
  } catch (error) {
    logger.error("Checkout failed", error, { orderNumber });
    return {
      ok: false,
      message:
        error instanceof CheckoutError
          ? error.message
          : "Order could not be created. Please try again.",
    };
  }

  revalidatePath("/menu");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/reports");

  await triggerRealtimeEvent("admin-orders", "order-created", {
    orderNumber,
    trackingToken,
    timestamp: Date.now(),
  });

  // Automated gateway: for online (GCash) orders, open a payment session and
  // hand the customer a redirect URL. Runs AFTER the order transaction commits,
  // so it never touches the stock-decrement locking. A failure here leaves a
  // valid PENDING order the customer can still pay from their tracker.
  let redirectUrl: string | undefined;
  if (values.paymentMethod === "GCASH") {
    try {
      const session = await paymentProvider.createSession({
        orderId,
        orderNumber,
        trackingToken,
        amount: orderTotal,
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentIntentId: session.intentId,
          paymentProvider: paymentProvider.id,
        },
      });

      redirectUrl = session.redirectUrl;
    } catch (error) {
      logger.error("Failed to open payment session", error, { orderNumber });
    }
  }

  return {
    ok: true,
    orderNumber,
    trackingToken,
    redirectUrl,
  };
}


"use server";

import { PaymentStatus } from "@/generated/prisma/enums";
import { logger } from "@/lib/logger";
import { paymentResumeRateLimiter } from "@/lib/rate-limiter";
import { prisma } from "@/server/db/prisma";

import { paymentProvider } from "./provider";
import { resumePaymentWithDeps, type ResumePaymentResult } from "./resume";

export async function resumePayment(
  orderNumber: string,
  trackingToken: string,
): Promise<ResumePaymentResult> {
  const rate = await paymentResumeRateLimiter.check(orderNumber);
  if (!rate.allowed) {
    return {
      ok: false,
      message: "Too many attempts. Please wait a few minutes and try again.",
    };
  }

  try {
    return await resumePaymentWithDeps(
      { orderNumber, trackingToken },
      {
        provider: paymentProvider,
        async findOrder(number) {
          const order = await prisma.order.findUnique({
            where: { orderNumber: number },
            select: {
              id: true,
              orderNumber: true,
              trackingToken: true,
              total: true,
              status: true,
              paymentMethod: true,
              paymentStatus: true,
              paymentIntentId: true,
              paymentProvider: true,
              gcashReference: true,
            },
          });
          return order ? { ...order, total: Number(order.total) } : null;
        },
        async saveSession(orderId, intentId, providerId) {
          // Guarded on PENDING so a webhook that settles the order mid-request
          // can't have its paying intent id overwritten.
          await prisma.order.update({
            where: { id: orderId, paymentStatus: PaymentStatus.PENDING },
            data: { paymentIntentId: intentId, paymentProvider: providerId },
          });
        },
      },
    );
  } catch (error) {
    logger.error("Failed to resume payment session", error, { orderNumber });
    return {
      ok: false,
      message: "Couldn't open the payment page. Please try again.",
    };
  }
}

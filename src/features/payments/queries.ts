import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";

/** Load the minimal order data the mock gateway screen needs, by intent id. */
export async function getPaymentSessionByIntentId(intentId: string) {
  try {
    return await prisma.order.findUnique({
      where: { paymentIntentId: intentId },
      select: {
        orderNumber: true,
        trackingToken: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
      },
    });
  } catch (error) {
    logger.error("Failed to load payment session", error, { intentId });
    throw new Error("Unable to load payment session. Please try again.");
  }
}

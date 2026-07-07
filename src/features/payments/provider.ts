import { logger } from "@/lib/logger";

import { mockPaymentProvider } from "./providers/mock";
import type { PaymentProvider } from "./types";

// Registry of available providers. Add real providers (maya, stripe, xendit)
// here as they're implemented — each just satisfies the PaymentProvider
// interface, so the rest of the app is untouched.
const providers: Record<string, PaymentProvider> = {
  mock: mockPaymentProvider,
};

/** Resolve the active provider from PAYMENT_PROVIDER (defaults to mock). */
export function getPaymentProvider(): PaymentProvider {
  const id = process.env.PAYMENT_PROVIDER ?? "mock";
  const provider = providers[id];

  if (!provider) {
    logger.warn(
      `Unknown PAYMENT_PROVIDER "${id}" — falling back to the mock provider.`,
    );
    return mockPaymentProvider;
  }

  return provider;
}

export const paymentProvider = getPaymentProvider();

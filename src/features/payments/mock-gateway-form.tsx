"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { PaymentOutcome } from "./types";

type MockGatewayFormProps = {
  intentId: string;
  signature: string;
  orderNumber: string;
  trackingToken: string;
};

/**
 * Simulates the customer-facing step at an external gateway. "Pay" and
 * "Simulate failure" both POST to our settlement webhook with the signed intent
 * — success routes to the order tracker, failure stays here so the customer can
 * retry the same PENDING order.
 */
export function MockGatewayForm({
  intentId,
  signature,
  orderNumber,
  trackingToken,
}: MockGatewayFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState<PaymentOutcome | null>(null);

  async function submit(outcome: PaymentOutcome) {
    setPending(outcome);

    try {
      const response = await fetch("/api/payments/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intentId, outcome, signature }),
      });
      const data = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !data.ok) {
        toast.error(data.message ?? "Payment could not be processed.");
        setPending(null);
        return;
      }

      if (outcome === "SUCCEEDED") {
        toast.success("Payment successful!");
        router.push(`/order/${orderNumber}?token=${trackingToken}`);
        return;
      }

      toast.error("Payment failed. You can try again.");
      setPending(null);
    } catch {
      toast.error("Network error. Please try again.");
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        size="lg"
        className="h-12 w-full bg-gradient-to-r from-emerald-600 to-emerald-700 font-black text-white hover:from-emerald-700 hover:to-emerald-800"
        disabled={pending !== null}
        onClick={() => submit("SUCCEEDED")}
      >
        {pending === "SUCCEEDED" ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <ShieldCheck aria-hidden="true" />
        )}
        Pay now
      </Button>

      <Button
        size="lg"
        variant="outline"
        className="h-12 w-full font-bold"
        disabled={pending !== null}
        onClick={() => submit("FAILED")}
      >
        {pending === "FAILED" ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          <XCircle aria-hidden="true" />
        )}
        Simulate failure
      </Button>
    </div>
  );
}

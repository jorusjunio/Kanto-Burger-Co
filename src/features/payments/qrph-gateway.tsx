"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type QrPhGatewayProps = {
  intentId: string;
  qrImageUrl: string | null;
  orderNumber: string;
  trackingToken: string;
};

const POLL_INTERVAL_MS = 4000;

/**
 * Renders the QR Ph code and polls our own settlement status (rather than
 * PayMongo directly) so it picks up the moment the webhook marks the order
 * PAID — works whether or not Pusher is configured.
 */
export function QrPhGateway({
  intentId,
  qrImageUrl,
  orderNumber,
  trackingToken,
}: QrPhGatewayProps) {
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/session/${intentId}`);
        if (!response.ok) return;

        const data = (await response.json()) as { paymentStatus?: string };

        if (cancelled) return;

        if (data.paymentStatus === "PAID") {
          clearInterval(interval);
          sessionStorage.removeItem("kanto:justPlaced");
          toast.success("Order placed — payment successful!");
          router.push(`/order/${orderNumber}?token=${trackingToken}`);
        }
      } catch {
        // Transient network hiccup — the next poll tick will retry.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [intentId, orderNumber, trackingToken, router]);

  if (!qrImageUrl || failed) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-sm font-bold text-[#25130b]">
          Hindi makuha ang QR code.
        </p>
        <p className="text-xs text-orange-950/50">
          I-refresh ang page para subukan ulit.
        </p>
      </div>
    );
  }

  const src = qrImageUrl.startsWith("data:")
    ? qrImageUrl
    : `data:image/png;base64,${qrImageUrl}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl border border-orange-900/10 bg-white p-3 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element -- external base64 payload, not a static asset */}
        <img
          src={src}
          alt="QR Ph code"
          onError={() => setFailed(true)}
          className="size-56 rounded-xl"
        />
      </div>
      <p className="text-center text-xs font-medium text-orange-950/60">
        I-scan gamit ang GCash app (o kahit anong bank/e-wallet app na
        sumusuporta sa QR Ph).
      </p>
      <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-orange-950/40">
        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        Naghihintay ng bayad...
      </p>
    </div>
  );
}

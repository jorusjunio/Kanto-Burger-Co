"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Clock, Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

import { goToGateway } from "./gateway-redirect";
import { formatRemaining, getQrViewState } from "./qrph-view";
import { resumePayment } from "./resume-actions";

type QrPhGatewayProps = {
  intentId: string;
  qrImageUrl: string | null;
  /** PayMongo payment intent status, or "unavailable" when it couldn't be read. */
  status: string;
  expiresAt: string | null;
  orderNumber: string;
  trackingToken: string;
};

const POLL_INTERVAL_MS = 4000;

/**
 * Renders the QR Ph code and polls our own settlement status (rather than
 * PayMongo directly) so it picks up the moment the webhook marks the order
 * PAID. Works whether or not Pusher is configured. Polling only runs while
 * the QR can still be paid, so an abandoned tab stops hitting the server
 * once the code expires.
 */
export function QrPhGateway({
  intentId,
  qrImageUrl,
  status,
  expiresAt,
  orderNumber,
  trackingToken,
}: QrPhGatewayProps) {
  const router = useRouter();
  const [now, setNow] = useState<number | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [renewing, startRenew] = useTransition();

  const expiresAtMs = expiresAt ? Date.parse(expiresAt) : null;
  const view = getQrViewState({
    status,
    hasQrImage: Boolean(qrImageUrl) && !imageFailed,
    expiresAtMs,
    now,
  });
  const orderHref = `/order/${orderNumber}?token=${trackingToken}`;

  // Countdown clock, only while a live QR is on screen.
  useEffect(() => {
    if (view !== "active" || expiresAtMs === null) return;

    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const interval = setInterval(tick, 1000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [view, expiresAtMs]);

  useEffect(() => {
    if (view !== "active" && view !== "confirming") return;

    let cancelled = false;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/session/${intentId}`);
        if (!response.ok) return;

        const data = (await response.json()) as { paymentStatus?: string };

        if (cancelled || data.paymentStatus !== "PAID") return;

        clearInterval(interval);
        sessionStorage.removeItem("kanto:justPlaced");
        toast.success("Order placed, payment successful!");
        router.push(orderHref);
      } catch {
        // Transient network hiccup; the next poll tick will retry.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [view, intentId, orderHref, router]);

  function renewQr() {
    startRenew(async () => {
      const result = await resumePayment(orderNumber, trackingToken);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      goToGateway(router, result.redirectUrl);
    });
  }

  const viewOrderLink = (
    <Link
      href={orderHref}
      className="text-xs font-bold text-orange-950/50 underline-offset-4 transition-colors hover:text-red-700 hover:underline"
    >
      Pay later / view my order
    </Link>
  );

  if (view === "confirming") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Loader2 className="size-7 animate-spin text-sky-600" aria-hidden="true" />
        <p className="text-sm font-bold text-[#25130b]">
          Confirming your payment...
        </p>
        <p className="text-xs text-orange-950/50">
          This usually takes a few seconds. You&apos;ll be taken to your order
          automatically.
        </p>
        {viewOrderLink}
      </div>
    );
  }

  if (view === "expired") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <Clock className="size-8 text-orange-950/30" aria-hidden="true" />
        <p className="text-sm font-bold text-[#25130b]">
          This QR code has expired.
        </p>
        <p className="text-xs text-orange-950/50">
          QR codes only stay valid for a limited time. Generate a new one to
          finish paying.
        </p>
        <Button
          type="button"
          onClick={renewQr}
          disabled={renewing}
          className="h-10 bg-gradient-to-r from-sky-500 to-blue-600 font-black text-white hover:from-sky-600 hover:to-blue-700"
        >
          {renewing ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw aria-hidden="true" />
          )}
          Generate a new QR
        </Button>
        {viewOrderLink}
      </div>
    );
  }

  if (view === "unavailable") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-sm font-bold text-[#25130b]">
          We couldn&apos;t load the QR code.
        </p>
        <p className="text-xs text-orange-950/50">
          Try again in a moment. Your order is saved, so you can also pay from
          your order page later.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.refresh()}
          className="h-10 font-bold"
        >
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
        {viewOrderLink}
      </div>
    );
  }

  const src = qrImageUrl!.startsWith("data:")
    ? qrImageUrl!
    : `data:image/png;base64,${qrImageUrl}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-2xl border border-orange-900/10 bg-white p-3 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element -- external base64 payload, not a static asset */}
        <img
          src={src}
          alt="QR Ph code"
          onError={() => setImageFailed(true)}
          className="size-56 rounded-xl"
        />
      </div>
      <p className="text-center text-xs font-medium text-orange-950/60">
        Scan with GCash, or any bank or e-wallet app that supports QR Ph.
      </p>
      <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-orange-950/40">
        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        {now !== null && expiresAtMs !== null
          ? `Waiting for payment · expires in ${formatRemaining(expiresAtMs - now)}`
          : "Waiting for payment..."}
      </p>
      {viewOrderLink}
    </div>
  );
}

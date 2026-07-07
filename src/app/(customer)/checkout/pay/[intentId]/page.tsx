import { notFound, redirect } from "next/navigation";
import { CreditCard, Lock } from "lucide-react";

import { getPaymentSessionByIntentId } from "@/features/payments/queries";
import { signIntent } from "@/features/payments/signing";
import { MockGatewayForm } from "@/features/payments/mock-gateway-form";
import { formatPeso } from "@/lib/format";

export default async function PaymentGatewayPage({
  params,
}: {
  params: Promise<{ intentId: string }>;
}) {
  const { intentId } = await params;
  const session = await getPaymentSessionByIntentId(intentId);

  if (!session) {
    notFound();
  }

  // Already settled — send the customer straight to their order tracker.
  if (session.paymentStatus === "PAID") {
    redirect(`/order/${session.orderNumber}?token=${session.trackingToken}`);
  }

  const signature = signIntent(intentId);

  return (
    <main className="storefront-bg flex min-h-[100dvh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-orange-900/10 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(120,53,15,0.3)] sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md">
            <CreditCard className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-sky-600">
              Secure Payment
            </p>
            <h1 className="text-lg font-black text-[#25130b]">GCash Gateway</h1>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-900/10 bg-gradient-to-br from-stone-50 to-amber-50/40 p-5 text-center">
          <p className="text-[11px] font-black uppercase tracking-widest text-orange-950/40">
            Amount due
          </p>
          <p className="mt-1 text-4xl font-black text-[#25130b]">
            {formatPeso(Number(session.total))}
          </p>
          <p className="mt-1 text-xs font-medium text-orange-950/50">
            Order {session.orderNumber}
          </p>
        </div>

        <div className="my-6">
          <MockGatewayForm
            intentId={intentId}
            signature={signature}
            orderNumber={session.orderNumber}
            trackingToken={session.trackingToken}
          />
        </div>

        <p className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-orange-950/40">
          <Lock className="size-3" aria-hidden="true" />
          Simulated gateway — no real charge is made.
        </p>
      </div>
    </main>
  );
}

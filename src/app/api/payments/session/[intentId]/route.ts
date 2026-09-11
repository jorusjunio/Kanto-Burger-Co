import { NextResponse } from "next/server";

import { getPaymentSessionByIntentId } from "@/features/payments/queries";

/** Polled by the QR Ph gateway page to detect settlement without waiting on
 *  Pusher (which may not be configured in every environment). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ intentId: string }> },
) {
  const { intentId } = await params;
  const session = await getPaymentSessionByIntentId(intentId);

  if (!session) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.json({ ok: true, paymentStatus: session.paymentStatus });
}

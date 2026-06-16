"use client";

import Link from "next/link";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { addTrackedOrder } from "@/features/orders/tracked-orders";

interface OrderReceiptClientProps {
  orderNumber: string;
  token: string;
}

// Set by checkout right before redirecting here, so the success toast fires
// exactly once after placing — never again when re-visiting to track.
const JUST_PLACED_KEY = "kanto:justPlaced";

export function OrderReceiptClient({ orderNumber, token }: OrderReceiptClientProps) {
  useEffect(() => {
    // Always make this order trackable (idempotent) so it shows in the sidebar.
    addTrackedOrder({ orderNumber, token });

    // Only celebrate when we just came from checkout for THIS order.
    if (sessionStorage.getItem(JUST_PLACED_KEY) === orderNumber) {
      sessionStorage.removeItem(JUST_PLACED_KEY);
      toast.success("Order placed successfully!", { duration: 3000 });
    }
  }, [orderNumber, token]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        className="kanto-button h-12 rounded-xl font-black shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
        asChild
      >
        <Link href="/menu">Order More</Link>
      </Button>
      <Button
        variant="outline"
        className="h-12 rounded-xl border-2 border-orange-900/10 bg-white/80 font-black text-orange-950 shadow-sm transition-all duration-300 hover:border-orange-900/20 hover:bg-orange-50/80 active:scale-[0.98]"
        asChild
      >
        <Link href="/">Back Home</Link>
      </Button>
    </div>
  );
}

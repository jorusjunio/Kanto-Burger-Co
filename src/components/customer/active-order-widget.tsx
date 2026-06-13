"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";

interface ActiveOrderData {
  orderNumber: string;
  token: string;
}

export function ActiveOrderWidget() {
  const [activeOrder, setActiveOrder] = useState<ActiveOrderData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Check for active order on mount
    const stored = localStorage.getItem("activeOrder");
    if (stored) {
      try {
        const data = JSON.parse(stored) as ActiveOrderData;
        setActiveOrder(data);
        setIsVisible(true);
      } catch {
        localStorage.removeItem("activeOrder");
      }
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.removeItem("activeOrder");
  };

  if (!isVisible || !activeOrder) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right-8 fade-in duration-500">
      <div className="flex items-center gap-3 rounded-2xl border-2 border-red-600 bg-gradient-to-br from-red-600 to-red-700 px-4 py-3 shadow-2xl shadow-red-600/30">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <ShoppingBag className="size-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-wider text-white/80">
            Active Order
          </p>
          <p className="text-sm font-black text-white">
            {activeOrder.orderNumber}
          </p>
        </div>
        <Link
          href={`/order/${activeOrder.orderNumber}?token=${activeOrder.token}`}
          className="flex h-9 shrink-0 items-center justify-center rounded-xl bg-white px-3 text-xs font-black text-red-700 shadow-sm transition-all duration-200 hover:bg-white/90 active:scale-95"
        >
          Track
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-all duration-200 hover:bg-white/20 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface OrderReceiptClientProps {
  orderNumber: string;
  token: string;
}

export function OrderReceiptClient({ orderNumber, token }: OrderReceiptClientProps) {
  const hasToasted = useRef(false);

  useEffect(() => {
    if (!hasToasted.current) {
      toast.success("Order placed successfully!", {
        duration: 3000,
      });
      hasToasted.current = true;
    }
  }, []);

  const handleSaveToLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeOrder', JSON.stringify({ orderNumber, token }));
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button 
        className="kanto-button h-12 rounded-xl font-black shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
        asChild
      >
        <Link 
          href="/menu"
          onClick={handleSaveToLocalStorage}
        >
          Order More
        </Link>
      </Button>
      <Button
        variant="outline"
        className="h-12 rounded-xl border-2 border-orange-900/10 bg-white/80 font-black text-orange-950 shadow-sm transition-all duration-300 hover:border-orange-900/20 hover:bg-orange-50/80 active:scale-[0.98]"
        asChild
      >
        <Link 
          href="/"
          onClick={handleSaveToLocalStorage}
        >
          Back Home
        </Link>
      </Button>
    </div>
  );
}

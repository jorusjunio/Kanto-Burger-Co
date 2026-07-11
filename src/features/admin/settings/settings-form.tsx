"use client";

import { useState } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateStoreSettings } from "./actions";

export function SettingsForm({
  deliveryFee,
  isAcceptingOrders,
}: {
  deliveryFee: number;
  isAcceptingOrders: boolean;
}) {
  const [accepting, setAccepting] = useState(isAcceptingOrders);

  return (
    <form
      action={updateStoreSettings}
      className="max-w-xl rounded-xl bg-white p-6 ring-1 ring-orange-900/10 animate-fade-in"
    >
      <h2 className="text-[13px] font-black uppercase tracking-wide text-[#25130b]">
        Ordering
      </h2>

      <div className="mt-4 divide-y divide-orange-900/6">
        {/* Accepting orders — the store's master switch */}
        <label className="flex cursor-pointer items-center justify-between gap-3 py-4">
          <span className="min-w-0">
            <span className="block text-sm font-bold text-[#25130b]">
              Accepting orders
            </span>
            <span className="mt-0.5 block text-xs text-orange-950/40">
              Turn off to pause checkout — customers see a “temporarily closed”
              notice.
            </span>
          </span>
          <input
            type="checkbox"
            name="isAcceptingOrders"
            checked={accepting}
            onChange={(event) => setAccepting(event.target.checked)}
            className="sr-only"
          />
          <span
            aria-hidden="true"
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
              accepting ? "bg-emerald-500" : "bg-orange-950/15"
            }`}
          >
            <span
              className={`inline-block size-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                accepting ? "translate-x-6" : "translate-x-0.75"
              }`}
            />
          </span>
        </label>

        {/* Delivery fee */}
        <div className="flex items-center justify-between gap-4 py-4">
          <div className="min-w-0">
            <Label
              htmlFor="deliveryFee"
              className="text-sm font-bold text-[#25130b]"
            >
              Delivery fee
            </Label>
            <p className="mt-0.5 text-xs text-orange-950/40">
              Added to every delivery order at checkout.
            </p>
          </div>
          <div className="relative w-32 shrink-0">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-orange-950/35">
              ₱
            </span>
            <Input
              id="deliveryFee"
              name="deliveryFee"
              type="number"
              min="0"
              step="0.01"
              defaultValue={deliveryFee}
              required
              className="h-10 rounded-lg border-0 bg-white pl-8 text-sm font-bold ring-1 ring-orange-900/10 transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-red-500/30"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-orange-900/6 pt-5">
        <Button
          type="submit"
          className="h-10 rounded-full bg-red-600 px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-red-700 active:scale-[0.99]"
        >
          <Save className="size-4" aria-hidden="true" />
          Save settings
        </Button>
      </div>
    </form>
  );
}

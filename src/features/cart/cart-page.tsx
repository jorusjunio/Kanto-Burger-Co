"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore, type CartItem } from "@/features/cart/cart-store";
import { formatPeso } from "@/lib/format";

/* ───── Empty State ───── */
function EmptyCart() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-6">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-700 shadow-[0_12px_32px_rgba(220,38,38,0.3)]">
          <ShoppingBag className="size-8 text-amber-100" aria-hidden="true" />
        </div>
        <div className="absolute -top-1 -right-1 flex size-7 items-center justify-center rounded-full bg-amber-400 text-[11px] font-black text-red-950 shadow-lg">
          0
        </div>
      </div>
      <h1 className="food-heading text-4xl leading-none">Your cart is empty</h1>
      <p className="mt-3 max-w-sm font-medium text-orange-950/65">
        Add burgers, sides, and drinks from the menu before checking out.
      </p>
      <Button
        className="kanto-button mt-8 h-12 rounded-xl px-8 font-black shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
        asChild
      >
        <Link href="/menu">
          Browse Menu
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>
    </div>
  );
}

/* ───── Cart Item Card ───── */
function CartItemCard({ item, index }: { item: CartItem; index: number }) {
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const [isRemoving, setIsRemoving] = useState(false);

  const addOnsTotal = item.addOns.reduce((sum, addOn) => sum + addOn.price, 0);
  const itemUnitPrice = item.price + addOnsTotal;
  const itemTotal = itemUnitPrice * item.quantity;

  const prefersReducedMotion =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const handleRemove = () => {
    if (prefersReducedMotion) {
      removeItem(item.cartKey);
      return;
    }
    setIsRemoving(true);
    setTimeout(() => removeItem(item.cartKey), 500);
  };

  return (
    <article
      className={`cart-item-card group relative overflow-hidden rounded-2xl border border-orange-900/10 bg-white/95 shadow-[0_8px_28px_rgba(120,53,15,0.06)] hover:shadow-[0_16px_48px_rgba(120,53,15,0.1)] hover:-translate-y-0.5 ${
        isRemoving
          ? "!translate-x-full !scale-95 !opacity-0"
          : "cart-item-enter"
      }`}
      style={{ "--cart-item-index": index } as React.CSSProperties}
    >
      {/* Shimmer line on hover */}
      <div className="cart-item-shimmer pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 grid gap-4 p-4 sm:grid-cols-[112px_1fr_auto]">
        {/* ── Image ── */}
        <div className="cart-item-img relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br from-orange-50 to-amber-50">
          {item.imageUrl ? (
            <>
              <Image
                src={item.imageUrl}
                alt=""
                fill
                sizes="112px"
                className="scale-110 object-cover opacity-20 blur-sm transition-all duration-700 group-hover:scale-125 group-hover:opacity-30"
                aria-hidden="true"
              />
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="112px"
                className="object-cover transition-all duration-500 group-hover:scale-105"
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-600 via-orange-500 to-amber-400 p-3">
              <span className="text-center text-[10px] font-black uppercase leading-tight text-white drop-shadow-md">
                {item.name}
              </span>
            </div>
          )}

          {/* Gradient wash */}
          <div className="cart-item-wash pointer-events-none absolute inset-0" />

          {/* Quantity badge on image */}
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 shadow-lg backdrop-blur-sm">
            <ShoppingBag className="size-3 text-red-700" aria-hidden="true" />
            <span className="text-xs font-black text-red-700 tabular-nums">
              x{item.quantity}
            </span>
          </div>
        </div>

        {/* ── Details ── */}
        <div className="flex flex-col justify-center gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-black uppercase leading-tight tracking-tight text-[#25130b]">
              {item.name}
            </h2>
            <p className="shrink-0 text-base font-black text-red-700 sm:hidden">
              {formatPeso(itemTotal)}
            </p>
          </div>

          <p className="text-sm font-bold text-orange-950/45">
            {formatPeso(itemUnitPrice)} each
          </p>

          {/* Add-ons as pills */}
          {item.addOns.length > 0 ? (
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-orange-950/35">
                Add-ons:
              </span>
              {item.addOns.map((addOn) => (
                <span
                  key={addOn.id}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-200/60 bg-amber-50/80 px-2 py-0.5 text-[11px] font-bold text-amber-800 shadow-sm"
                >
                  <Sparkles
                    className="size-2.5 text-amber-500"
                    aria-hidden="true"
                  />
                  {addOn.name}
                  <span className="text-amber-600">
                    +{formatPeso(addOn.price)}
                  </span>
                </span>
              ))}
            </div>
          ) : null}

          {/* Notes */}
          {item.notes ? (
            <span className="mt-0.5 inline-flex w-fit items-center gap-1 rounded-md border border-orange-900/8 bg-orange-50/60 px-2 py-0.5 text-[11px] font-medium italic text-orange-950/60">
              📝 {item.notes}
            </span>
          ) : null}
        </div>

        {/* ── Quantity + Remove ── */}
        <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
          {/* Quantity stepper */}
          <div className="cart-stepper flex items-center rounded-xl border border-orange-900/12 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="cart-stepper-btn flex size-9 items-center justify-center rounded-l-xl text-orange-950/60 transition-all duration-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-orange-950/60"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" aria-hidden="true" />
            </button>
            <span className="flex w-10 items-center justify-center text-sm font-black tabular-nums text-[#25130b]">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
              disabled={Boolean(
                item.maxQuantity && item.quantity >= item.maxQuantity,
              )}
              className="cart-stepper-btn flex size-9 items-center justify-center rounded-r-xl text-orange-950/60 transition-all duration-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-orange-950/60"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" aria-hidden="true" />
            </button>
          </div>

          {item.maxQuantity ? (
            <p className="text-[10px] font-medium text-orange-950/30 sm:text-right">
              Max {item.maxQuantity}
            </p>
          ) : null}

          {/* Total price (desktop) + Remove */}
          <div className="hidden items-center gap-3 sm:flex">
            <p className="text-right text-lg font-black text-red-700 tabular-nums">
              {formatPeso(itemTotal)}
            </p>
            <button
              type="button"
              onClick={handleRemove}
              className="cart-remove-btn flex size-8 items-center justify-center rounded-lg text-orange-950/30 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>

          {/* Remove button visible on mobile */}
          <button
            type="button"
            onClick={handleRemove}
            className="cart-remove-btn flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-orange-950/40 transition-all duration-200 hover:bg-red-50 hover:text-red-600 sm:hidden"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>
    </article>
  );
}

/* ───── Order Summary ───── */
function OrderSummary() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal());

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="order-summary-card relative isolate h-fit rounded-2xl border border-orange-900/8 bg-white/90 p-6 shadow-[0_12px_40px_rgba(120,53,15,0.08)] backdrop-blur-xl lg:sticky lg:top-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black uppercase tracking-tight text-[#25130b]">
          Order Summary
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-700 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-red-700/20">
          <ShoppingBag className="size-3" aria-hidden="true" />
          {itemCount} item{itemCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Items preview */}
      <div className="mt-5 space-y-2.5">
        {items.map((item) => {
          const addOnsTotal = item.addOns.reduce(
            (sum, addOn) => sum + addOn.price,
            0,
          );
          const itemTotal = (item.price + addOnsTotal) * item.quantity;
          return (
            <div
              key={item.cartKey}
              className="flex items-center justify-between gap-2 rounded-xl bg-orange-50/40 px-3 py-2 transition-colors duration-200 hover:bg-orange-50/70"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-black text-red-700 shadow-sm">
                  {item.quantity}
                </span>
                <span className="truncate text-sm font-bold text-[#25130b]">
                  {item.name}
                </span>
              </div>
              <span className="shrink-0 text-sm font-black text-red-700 tabular-nums">
                {formatPeso(itemTotal)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Pricing breakdown */}
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-orange-950/50">Subtotal</span>
          <span className="font-bold text-[#25130b] tabular-nums">
            {formatPeso(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium text-orange-950/50">
            Delivery fee
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
              Free
            </span>
          </span>
          <span className="font-bold text-emerald-700 tabular-nums">
            {formatPeso(0)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium text-orange-950/50">VAT (12%)</span>
          <span className="font-bold text-orange-950/70 tabular-nums">
            {formatPeso(Math.round(subtotal * 0.12))}
          </span>
        </div>
      </div>

      {/* Gradient separator */}
      <div className="relative my-5">
        <Separator className="border-orange-900/8" />
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-red-700/0 via-amber-400/40 to-red-700/0" />
      </div>

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-base font-black text-[#25130b]">Total</span>
        <span className="text-xl font-black text-red-700 tabular-nums">
          {formatPeso(subtotal)}
        </span>
      </div>
      <p className="mt-1 text-right text-xs font-medium text-orange-950/40">
        Inclusive of VAT
      </p>

      {/* CTA Buttons */}
      <Button
        className="order-summary-cta mt-6 h-12 w-full rounded-xl font-black shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
        asChild
      >
        <Link href="/checkout">
          Continue to Checkout
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </Button>

      <Button
        variant="outline"
        className="mt-3 h-11 w-full rounded-xl border-orange-900/12 bg-white/80 font-black text-[#25130b] shadow-sm transition-all duration-300 hover:border-red-700/30 hover:bg-red-50/60 hover:text-red-700 active:scale-[0.98]"
        asChild
      >
        <Link href="/menu">Add More Items</Link>
      </Button>

      {/* Note */}
      <p className="mt-4 text-center text-[11px] font-medium text-orange-950/30">
        Prices may vary based on selection
      </p>
    </aside>
  );
}

/* ───── Main Cart Page ───── */
export function CartPage() {
  const items = useCartStore((state) => state.items);

  if (items.length === 0) {
    return (
      <main className="storefront-bg min-h-screen">
        <EmptyCart />
      </main>
    );
  }

  return (
    <main className="storefront-bg min-h-screen">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px]">
        {/* ── Cart Items Section ── */}
        <section className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-orange-900/8 pb-4">
            <div>
              <p className="section-kicker">Your order</p>
              <h1 className="food-heading mt-1 text-4xl leading-none">Cart</h1>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-1.5 text-xs font-black text-orange-800 shadow-sm sm:inline-flex">
              <ShoppingBag className="size-3.5" aria-hidden="true" />
              {items.reduce((sum, i) => sum + i.quantity, 0)} items
            </span>
          </div>

          {/* Items list */}
          <div className="space-y-3">
            {items.map((item, index) => (
              <CartItemCard key={item.cartKey} item={item} index={index} />
            ))}
          </div>

          {/* Continue browsing */}
          <div className="flex items-center justify-center pt-2">
            <Link
              href="/menu"
              className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-orange-950/50 transition-all duration-300 hover:bg-orange-100/60 hover:text-red-700"
            >
              <ChevronRight
                className="size-4 rotate-180 transition-transform group-hover:-translate-x-1"
                aria-hidden="true"
              />
              Continue browsing menu
            </Link>
          </div>
        </section>

        {/* ── Order Summary ── */}
        <OrderSummary />
      </div>
    </main>
  );
}

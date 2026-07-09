"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  ShoppingBag,
  Smartphone,
  Store,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/features/cart/cart-store";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";

import { createOrder } from "./actions";
import type { CheckoutOrderType, CheckoutPaymentMethod } from "./types";

const deliveryFee = 49;

function formatPhoneInput(value: string) {
  return value.replace(/[^\d+]/g, "").slice(0, 13);
}

/* ─── Step heading: number + micro title, nothing else ─── */
function StepHeading({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="font-mono text-[11px] font-bold tracking-wider text-red-700/60">
        {step}
      </span>
      <h2 className="text-[13px] font-black uppercase tracking-wide text-[#25130b]">
        {title}
      </h2>
    </div>
  );
}

export function CheckoutPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const subtotal = useCartStore((state) => state.subtotal());
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState<CheckoutOrderType>("PICKUP");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<CheckoutPaymentMethod>("CASH");
  const [notes, setNotes] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmedRef = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const total = useMemo(
    () => subtotal + (orderType === "DELIVERY" ? deliveryFee : 0),
    [orderType, subtotal],
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  function handleOrderTypeChange(value: CheckoutOrderType) {
    setOrderType(value);
    if (value === "PICKUP" && paymentMethod === "COD") {
      setPaymentMethod("CASH");
    }
    if (value === "DELIVERY" && paymentMethod === "CASH") {
      setPaymentMethod("COD");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!confirmedRef.current) {
      setConfirmOpen(true);
      return;
    }

    confirmedRef.current = false;
    const loadingId = toast.loading("Creating your order...");

    startTransition(async () => {
      const result = await createOrder({
        customerName,
        customerPhone,
        orderType,
        deliveryAddress,
        paymentMethod,
        notes,
        items,
      });

      toast.dismiss(loadingId);

      if (!result.ok) {
        toast.error(result.message, {
          duration: 6000,
        });
        return;
      }

      clearCart();
      // One-shot flag so the receipt page shows the success toast exactly once.
      sessionStorage.setItem("kanto:justPlaced", result.orderNumber);

      // Online (GCash) orders go to the payment gateway first; other methods
      // go straight to the order tracker.
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
        return;
      }

      router.push(`/order/${result.orderNumber}?token=${result.trackingToken}`);
    });
  }

  function handleConfirmOrder() {
    confirmedRef.current = true;
    setConfirmOpen(false);
    formRef.current?.requestSubmit();
  }

  if (items.length === 0) {
    return (
      <main className="storefront-bg h-[100dvh] overflow-y-auto">
        <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 text-center">
          <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-[#1d0906] shadow-lg">
            <ShoppingBag className="size-6 text-amber-300" aria-hidden="true" />
          </div>
          <h1 className="food-heading text-4xl leading-none">
            Checkout is waiting
          </h1>
          <p className="mt-3 max-w-sm font-medium text-orange-950/65">
            Add items from the menu first, then come back here to finish your
            order.
          </p>
          <Button
            className="checkout-cta mt-8 h-12 rounded-full px-8 font-black transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            asChild
          >
            <Link href="/menu">Browse Menu</Link>
          </Button>
        </div>
      </main>
    );
  }

  const paymentOptions: Array<{
    value: CheckoutPaymentMethod;
    label: string;
    description: string;
    Icon: typeof Wallet;
  }> =
    orderType === "DELIVERY"
      ? [
          {
            value: "COD",
            label: "Cash on Delivery",
            description: "Pay when your order arrives",
            Icon: Wallet,
          },
          {
            value: "GCASH",
            label: "GCash",
            description: "Pay online via secure gateway",
            Icon: Smartphone,
          },
        ]
      : [
          {
            value: "CASH",
            label: "Cash at Pickup",
            description: "Pay when you arrive",
            Icon: Wallet,
          },
          {
            value: "GCASH",
            label: "GCash",
            description: "Pay online via secure gateway",
            Icon: Smartphone,
          },
        ];

  return (
    <main className="storefront-bg h-[100dvh] overflow-y-auto">
      {/* ── Header ── */}
      <section className="border-b border-orange-900/8">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
          <Link
            data-entrance="0"
            href="/cart"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-orange-950/50 transition-colors hover:text-red-700"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Back to Cart
          </Link>
          <div className="mt-3 flex items-end justify-between gap-4">
            <h1
              data-entrance="1"
              className="food-heading text-3xl leading-none sm:text-4xl"
            >
              Checkout
            </h1>
            <span
              data-entrance="2"
              className="inline-flex items-center gap-1.5 rounded-full bg-orange-950/5 px-3 py-1.5 text-[11px] font-bold text-orange-950/55"
            >
              <ShoppingBag className="size-3" aria-hidden="true" />
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="mx-auto grid max-w-5xl gap-6 px-3 py-6 sm:px-6 sm:py-8 lg:grid-cols-[1fr_360px] lg:gap-8">
        {/* ── Form card ── */}
        <form ref={formRef} onSubmit={handleSubmit}>
          <div
            data-entrance="1"
            className="divide-y divide-orange-900/6 rounded-2xl bg-white p-5 ring-1 ring-orange-900/10 sm:p-7"
          >
            {/* ── 01 · Contact ── */}
            <section className="pb-7">
              <StepHeading step="01" title="Contact" />
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="customerName" className="checkout-label">
                    Full name
                  </Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    placeholder="Your full name"
                    required
                    className="checkout-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customerPhone" className="checkout-label">
                    Phone number
                  </Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(event) =>
                      setCustomerPhone(formatPhoneInput(event.target.value))
                    }
                    inputMode="tel"
                    placeholder="09XXXXXXXXX"
                    required
                    className="checkout-input"
                  />
                </div>
              </div>
            </section>

            {/* ── 02 · Order type ── */}
            <section className="py-7">
              <StepHeading step="02" title="Order type" />

              {/* Segmented control — matches the menu's category nav. */}
              <div className="mt-4 grid grid-cols-2 gap-1 rounded-full bg-orange-950/[0.05] p-1">
                {(
                  [
                    ["PICKUP", "Pickup", "Ready in ~15 min", Store],
                    ["DELIVERY", "Delivery", `+${formatPeso(deliveryFee)} fee`, Truck],
                  ] as const
                ).map(([value, label, sub, Icon]) => {
                  const selected = orderType === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleOrderTypeChange(value)}
                      aria-pressed={selected}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-full px-4 py-3 transition-all duration-300",
                        selected
                          ? "bg-red-600 text-white shadow-md shadow-red-700/25"
                          : "text-orange-950/55 hover:text-red-700",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4",
                          selected ? "text-amber-300" : "text-orange-950/30",
                        )}
                        aria-hidden="true"
                      />
                      <span className="text-left leading-tight">
                        <span className="block text-sm font-bold">{label}</span>
                        <span
                          className={cn(
                            "block text-[10px] font-medium",
                            selected ? "text-white/70" : "text-orange-950/35",
                          )}
                        >
                          {sub}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Delivery address — slides in only when needed. */}
              {orderType === "DELIVERY" ? (
                <div className="checkout-section-enter mt-4 space-y-1.5">
                  <Label htmlFor="deliveryAddress" className="checkout-label">
                    Delivery address
                  </Label>
                  <Textarea
                    id="deliveryAddress"
                    value={deliveryAddress}
                    onChange={(event) => setDeliveryAddress(event.target.value)}
                    placeholder="Street, barangay, city"
                    required
                    className="bg-white"
                  />
                </div>
              ) : null}
            </section>

            {/* ── 03 · Payment ── */}
            <section className="py-7">
              <StepHeading step="03" title="Payment" />
              <div className="mt-4 space-y-2.5">
                {paymentOptions.map(({ value, label, description, Icon }) => {
                  const selected = paymentMethod === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPaymentMethod(value)}
                      aria-pressed={selected}
                      className={cn(
                        "flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-left transition-all duration-200",
                        selected
                          ? "bg-red-50/60 ring-2 ring-red-600"
                          : "ring-1 ring-orange-900/10 hover:ring-orange-900/25",
                      )}
                    >
                      {/* Radio indicator */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
                          selected ? "border-red-600" : "border-orange-950/20",
                        )}
                      >
                        {selected ? (
                          <span className="size-2 rounded-full bg-red-600" />
                        ) : null}
                      </span>

                      <span className="flex-1">
                        <span
                          className={cn(
                            "block text-sm font-bold",
                            selected ? "text-red-700" : "text-[#25130b]",
                          )}
                        >
                          {label}
                        </span>
                        <span className="block text-xs font-medium text-orange-950/40">
                          {description}
                        </span>
                      </span>

                      <Icon
                        className={cn(
                          "size-[18px] shrink-0",
                          selected ? "text-red-600" : "text-orange-950/25",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>

              {paymentMethod === "GCASH" ? (
                <p className="checkout-section-enter mt-3 flex items-center gap-1.5 px-1 text-[11px] font-medium text-orange-950/45">
                  <Lock className="size-3 shrink-0" aria-hidden="true" />
                  You&apos;ll be redirected to a secure GCash page after placing
                  your order.
                </p>
              ) : null}
            </section>

            {/* ── 04 · Notes ── */}
            <section className="pt-7">
              <div className="flex items-baseline justify-between">
                <StepHeading step="04" title="Notes" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-950/30">
                  Optional
                </span>
              </div>
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="e.g. no onions, extra sauce, ring the bell"
                className="mt-4 bg-white"
              />
            </section>
          </div>

          {/* ── Submit (mobile) — sticky at bottom ── */}
          <div className="sticky bottom-0 -mx-3 mt-4 border-t border-orange-900/8 bg-gradient-to-t from-white/98 via-white/96 to-transparent px-3 pb-5 pt-4 backdrop-blur-md lg:hidden">
            <Button
              type="submit"
              disabled={isPending}
              className="checkout-cta h-12 w-full rounded-full font-black transition-all duration-300 active:scale-[0.98]"
            >
              {isPending
                ? "Creating Order..."
                : `Place Order • ${formatPeso(total)}`}
            </Button>
          </div>
        </form>

        {/* ── Order Summary ── */}
        <aside
          data-entrance="2"
          className="h-fit rounded-2xl bg-white p-5 ring-1 ring-orange-900/10 sm:p-6 lg:sticky lg:top-8"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-black uppercase tracking-wide text-[#25130b]">
              Order Summary
            </h2>
            <span className="inline-flex items-center rounded-full bg-orange-950/5 px-2.5 py-1 text-[10px] font-bold text-orange-950/55">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Items */}
          <div className="mt-4 divide-y divide-orange-900/6">
            {items.map((item) => {
              const addOnsTotal = item.addOns.reduce(
                (sum, addOn) => sum + addOn.price,
                0,
              );
              const itemTotal = (item.price + addOnsTotal) * item.quantity;
              return (
                <div key={item.cartKey} className="py-2.5 first:pt-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-bold text-[#25130b]">
                      <span className="mr-1.5 font-mono text-xs font-bold text-orange-950/40">
                        {item.quantity}×
                      </span>
                      {item.name}
                    </p>
                    <p className="shrink-0 text-sm font-bold text-[#25130b] tabular-nums">
                      {formatPeso(itemTotal)}
                    </p>
                  </div>
                  {item.addOns.length > 0 ? (
                    <p className="mt-0.5 truncate pl-6 text-[11px] font-medium text-orange-950/40">
                      + {item.addOns.map((addOn) => addOn.name).join(", ")}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Breakdown */}
          <div className="mt-4 space-y-2 border-t border-orange-900/6 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-orange-950/50">Subtotal</span>
              <span className="font-bold text-[#25130b] tabular-nums">
                {formatPeso(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-orange-950/50">
                Delivery fee
              </span>
              {orderType === "DELIVERY" ? (
                <span className="font-bold text-[#25130b] tabular-nums">
                  {formatPeso(deliveryFee)}
                </span>
              ) : (
                <span className="text-xs font-black uppercase tracking-wide text-emerald-600">
                  Free
                </span>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 flex items-center justify-between border-t border-orange-900/10 pt-4">
            <span className="text-sm font-black text-[#25130b]">Total</span>
            <span className="text-xl font-black text-red-700 tabular-nums">
              {formatPeso(total)}
            </span>
          </div>

          {/* CTA (desktop) */}
          <Button
            type="button"
            disabled={isPending}
            onClick={() => formRef.current?.requestSubmit()}
            className="checkout-cta mt-5 hidden h-12 w-full rounded-full font-black transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] lg:flex"
          >
            {isPending ? (
              "Creating Order..."
            ) : (
              <>
                Place Order
                <span className="ml-1 text-white/75">
                  • {formatPeso(total)}
                </span>
              </>
            )}
          </Button>

          <p className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-orange-950/35">
            <Lock className="size-3" aria-hidden="true" />
            Secure checkout
          </p>
        </aside>
      </div>

      {/* ── Confirmation Dialog ── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[90vh] max-w-sm flex-col gap-0 overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl ring-1 ring-orange-900/10 sm:max-w-md"
        >
          <DialogHeader className="shrink-0 px-7 pb-5 pt-7 text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-lg font-black uppercase tracking-tight text-[#25130b]">
                  Confirm your order
                </DialogTitle>
                <DialogDescription className="mt-1 text-xs font-medium text-orange-950/45">
                  One last look before we fire up the grill.
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="-mr-2 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-full text-orange-950/40 transition-colors duration-200 hover:bg-orange-950/5 hover:text-red-700"
                aria-label="Close"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto border-t border-orange-900/8 px-7 py-6">
            {/* Details — quiet label/value rows */}
            <div className="divide-y divide-orange-900/6 text-sm">
              <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-orange-950/40">
                  Contact
                </span>
                <span className="min-w-0 truncate text-right font-bold text-[#25130b]">
                  {customerName || "—"}
                  <span className="ml-1.5 font-medium text-orange-950/45">
                    {customerPhone}
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-orange-950/40">
                  Order type
                </span>
                <span className="min-w-0 truncate text-right font-bold text-[#25130b]">
                  {orderType === "PICKUP" ? "Pickup · ~15 min" : "Delivery"}
                </span>
              </div>
              {orderType === "DELIVERY" ? (
                <div className="flex items-start justify-between gap-4 py-3">
                  <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-orange-950/40">
                    Address
                  </span>
                  <span className="min-w-0 text-right text-xs font-medium leading-relaxed text-orange-950/70">
                    {deliveryAddress || "—"}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
                <span className="shrink-0 text-[11px] font-bold uppercase tracking-wider text-orange-950/40">
                  Payment
                </span>
                <span className="min-w-0 truncate text-right font-bold text-[#25130b]">
                  {paymentMethod === "CASH"
                    ? "Cash at Pickup"
                    : paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : "GCash · secure gateway"}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="mt-6 rounded-2xl bg-orange-950/[0.03] px-5 py-4">
              <div className="divide-y divide-orange-900/6">
                {items.map((item) => {
                  const addOnsTotal = item.addOns.reduce(
                    (sum, addOn) => sum + addOn.price,
                    0,
                  );
                  const lineTotal = (item.price + addOnsTotal) * item.quantity;
                  return (
                    <div
                      key={item.cartKey}
                      className="py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="min-w-0 truncate text-[13px] font-bold text-[#25130b]">
                          <span className="mr-2 font-mono text-[11px] text-orange-950/40">
                            {item.quantity}×
                          </span>
                          {item.name}
                        </p>
                        <p className="shrink-0 text-[13px] font-bold text-[#25130b] tabular-nums">
                          {formatPeso(lineTotal)}
                        </p>
                      </div>
                      {item.addOns.length > 0 ? (
                        <p className="mt-1 truncate pl-6 text-[11px] font-medium text-orange-950/40">
                          + {item.addOns.map((a) => a.name).join(", ")}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 flex items-baseline justify-between border-t border-orange-900/10 pt-5">
              <span className="text-sm font-black text-[#25130b]">
                Total
                {orderType === "DELIVERY" ? (
                  <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-orange-950/35">
                    incl. delivery
                  </span>
                ) : null}
              </span>
              <span className="text-2xl font-black text-red-700 tabular-nums">
                {formatPeso(total)}
              </span>
            </div>
          </div>

          <DialogFooter className="mx-0 mb-0 shrink-0 flex-row items-center gap-3 rounded-none border-t border-orange-900/8 bg-white px-7 py-5 sm:justify-between">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="flex h-12 items-center justify-center rounded-full px-5 text-sm font-bold text-orange-950/55 transition-colors duration-200 hover:bg-orange-950/5 hover:text-[#25130b]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmOrder}
              className="checkout-cta flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-br from-red-600 to-red-700 px-6 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97] sm:flex-none sm:px-8"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Confirm Order
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  FileText,
  MapPin,
  MessageSquare,
  Phone,
  ShoppingBag,
  Smartphone,
  Store,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/features/cart/cart-store";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";

import { createOrder } from "./actions";
import type {
  CheckoutOrderType,
  CheckoutPageProps,
  CheckoutPaymentMethod,
} from "./types";

const deliveryFee = 49;

function formatPhoneInput(value: string) {
  return value.replace(/[^\d+]/g, "").slice(0, 13);
}

export function CheckoutPage({ gcashNumber }: CheckoutPageProps) {
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
  const [gcashReference, setGcashReference] = useState("");
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
        gcashReference,
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

      toast.success("Order placed successfully!", {
        duration: 3000,
      });
      clearCart();
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
          <div className="relative mb-6">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-700 shadow-[0_12px_32px_rgba(220,38,38,0.3)]">
              <CheckCircle2 className="size-8 text-amber-100" aria-hidden="true" />
            </div>
          </div>
          <h1 className="food-heading text-4xl leading-none">
            Checkout is waiting
          </h1>
          <p className="mt-3 max-w-sm font-medium text-orange-950/65">
            Add items from the menu first, then come back here to finish your order.
          </p>
          <Button
            className="checkout-cta mt-8 h-12 rounded-xl px-8 font-black shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
            asChild
          >
            <Link href="/menu">Browse Menu</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="storefront-bg h-[100dvh] overflow-y-auto">
      {/* ── Hero Header ── */}
      <section className="relative overflow-hidden border-b border-orange-900/8">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(120,53,15,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(120,53,15,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div data-entrance="0" className="flex items-center gap-2 mb-3">
            <Button variant="ghost" size="sm" asChild className="-ml-2 text-orange-950/60 hover:text-red-700">
              <Link href="/cart">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back to Cart
              </Link>
            </Button>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p data-entrance="0" className="section-kicker">Almost there</p>
              <h1 data-entrance="1" className="food-heading checkout-title-shimmer mt-1 text-3xl leading-none sm:text-5xl">
                Checkout
              </h1>
            </div>
            <div data-entrance="2" className="hidden items-center gap-1.5 rounded-full bg-orange-100/80 px-3 py-1.5 text-xs font-black text-orange-800 shadow-sm sm:inline-flex">
              <ShoppingBag className="size-3.5" aria-hidden="true" />
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <div className="mx-auto grid max-w-6xl gap-6 px-3 py-6 sm:gap-8 sm:px-6 sm:py-8 lg:grid-cols-[1fr_380px]">
        {/* ── Form ── */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-0"
        >
          {/* ── Section: Contact Info ── */}
          <div data-entrance="1" className="checkout-section">
            <div className="checkout-section-header">
              <div className="checkout-section-icon">
                <User className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b]">
                  Contact Information
                </h2>
                <p className="text-[11px] font-medium text-orange-950/40">
                  Tell us who you are
                </p>
              </div>
            </div>
            <div className="checkout-section-body">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="checkout-label">
                    <User className="size-3.5" aria-hidden="true" />
                    Customer name
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
                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="checkout-label">
                    <Phone className="size-3.5" aria-hidden="true" />
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
            </div>
          </div>

          {/* ── Section: Order Type ── */}
          <div data-entrance="2" className="checkout-section">
            <div className="checkout-section-header">
              <div className="checkout-section-icon">
                <Truck className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b]">
                  Order Type
                </h2>
                <p className="text-[11px] font-medium text-orange-950/40">
                  Pickup or delivery?
                </p>
              </div>
            </div>
            <div className="checkout-section-body">
              <Select
                value={orderType}
                onValueChange={(v) => handleOrderTypeChange(v as CheckoutOrderType)}
              >
                <SelectTrigger className="checkout-select checkout-select--trigger w-full">
                  <span className="checkout-select-trigger-icon">
                    <Truck className="size-3.5" aria-hidden="true" />
                  </span>
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent className="checkout-select-content">
                  <SelectItem value="PICKUP" className="checkout-select-item h-auto py-2.5">
                    <span className="checkout-select-item-icon">
                      <Store className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-bold text-[#25130b]">Pickup</span>
                      <span className="text-[11px] font-medium text-orange-950/40">Ready in 15 min</span>
                    </span>
                  </SelectItem>
                  <SelectItem value="DELIVERY" className="checkout-select-item h-auto py-2.5">
                    <span className="checkout-select-item-icon checkout-select-item-icon--amber">
                      <Truck className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="flex flex-col">
                      <span className="font-bold text-[#25130b]">Delivery</span>
                      <span className="text-[11px] font-medium text-orange-950/40">+{formatPeso(deliveryFee)} fee</span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Section: Delivery Address ── */}
          {orderType === "DELIVERY" ? (
            <div data-entrance="2" className="checkout-section checkout-section-enter">
              <div className="checkout-section-header">
                <div className="checkout-section-icon">
                  <MapPin className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b]">
                    Delivery Address
                  </h2>
                  <p className="text-[11px] font-medium text-orange-950/40">
                    Where should we deliver?
                  </p>
                </div>
              </div>
              <div className="checkout-section-body">
                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress" className="checkout-label">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    Full delivery address
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
              </div>
            </div>
          ) : null}

          {/* ── Section: Payment Method ── */}
          <div data-entrance="3" className="checkout-section">
            <div className="checkout-section-header">
              <div className="checkout-section-icon">
                <CreditCard className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b]">
                  Payment Method
                </h2>
                <p className="text-[11px] font-medium text-orange-950/40">
                  How will you pay?
                </p>
              </div>
            </div>
            <div className="checkout-section-body">
              <Select
                value={paymentMethod}
                onValueChange={(v) => setPaymentMethod(v as CheckoutPaymentMethod)}
              >
                <SelectTrigger className="checkout-select checkout-select--trigger w-full">
                  <span className="checkout-select-trigger-icon">
                    <CreditCard className="size-3.5" aria-hidden="true" />
                  </span>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="checkout-select-content">
                  {(orderType === "DELIVERY"
                    ? [
                        ["COD", "Cash on Delivery", "Pay when delivered", "Wallet"],
                        ["GCASH", "GCash", "Manual transfer", "Smartphone"],
                      ]
                    : [
                        ["CASH", "Cash at Pickup", "Pay when you arrive", "Wallet"],
                        ["GCASH", "GCash", "Manual transfer", "Smartphone"],
                      ]
                  ).map(([value, label, desc, iconName]) => {
                    const Icon = iconName === "Smartphone" ? Smartphone : Wallet;
                    const iconClass = iconName === "Smartphone"
                      ? "checkout-select-item-icon checkout-select-item-icon--blue"
                      : "checkout-select-item-icon checkout-select-item-icon--emerald";
                    return (
                      <SelectItem key={value} value={value} className="checkout-select-item h-auto py-2.5">
                        <span className={iconClass}>
                          <Icon className="size-3.5" aria-hidden="true" />
                        </span>
                        <span className="flex flex-col">
                          <span className="font-bold text-[#25130b]">{label}</span>
                          <span className="text-[11px] font-medium text-orange-950/40">{desc}</span>
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Section: GCash Payment ── */}
          {paymentMethod === "GCASH" ? (
            <div data-entrance="3" className="checkout-section checkout-section-enter">
              <div className="checkout-section-header">
                <div className="checkout-section-icon checkout-section-icon--blue">
                  <CreditCard className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b]">
                    GCash Payment
                  </h2>
                  <p className="text-[11px] font-medium text-orange-950/40">
                    Manual bank transfer
                  </p>
                </div>
              </div>
              <div className="checkout-section-body">
                <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-4 sm:p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-100 shadow-sm">
                      <CreditCard className="size-4 text-sky-600" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-zinc-950">
                        GCash manual payment
                      </p>
                      <p className="mt-1 text-[13px] leading-relaxed text-zinc-600">
                        Send the total to{" "}
                        <span className="font-bold text-sky-700 whitespace-nowrap">
                          {gcashNumber || "the store GCash number"}
                        </span>
                        , then enter the reference number below.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gcashReference" className="checkout-label">
                      <FileText className="size-3.5" aria-hidden="true" />
                      GCash reference number
                    </Label>
                    <Input
                      id="gcashReference"
                      value={gcashReference}
                      onChange={(event) =>
                        setGcashReference(event.target.value)
                      }
                      placeholder="Reference number from receipt"
                      required
                      className="checkout-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* ── Section: Special Notes ── */}
          <div data-entrance="4" className="checkout-section">
            <div className="checkout-section-header">
              <div className="checkout-section-icon">
                <MessageSquare className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide text-[#25130b]">
                  Order Notes
                </h2>
                <p className="text-[11px] font-medium text-orange-950/40">
                  Any special requests?
                </p>
              </div>
            </div>
            <div className="checkout-section-body">
              <div className="space-y-2">
                <Label htmlFor="notes" className="checkout-label">
                  <MessageSquare className="size-3.5" aria-hidden="true" />
                  Special instructions
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="e.g. no onions, extra sauce, ring the bell"
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          {/* ── Submit (mobile) ── */}
          {/* ── Submit (mobile) — sticky at bottom ── */}
          <div className="sticky bottom-0 -mx-3 -mb-6 mt-4 border-t border-orange-900/8 bg-gradient-to-t from-white/98 via-white/96 to-transparent px-3 pb-5 pt-4 backdrop-blur-md lg:hidden">
            <Button
              type="submit"
              disabled={isPending}
              className="checkout-cta h-12 w-full rounded-2xl font-black shadow-lg transition-all duration-300 active:scale-[0.98]"
            >
              {isPending ? "Creating Order..." : `Place Order • ${formatPeso(total)}`}
            </Button>
          </div>
        </form>

        {/* ── Order Summary Sidebar ── */}
        <aside className="checkout-summary order-summary-card relative isolate h-fit rounded-2xl border border-orange-900/8 bg-white/90 p-5 shadow-[0_12px_40px_rgba(120,53,15,0.08)] backdrop-blur-xl sm:p-6 lg:sticky lg:top-24">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-black uppercase tracking-tight text-[#25130b] sm:text-lg">
              Order Summary
            </h2>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-700 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md shadow-red-700/20 sm:px-3 sm:text-[11px]">
              <ShoppingBag className="size-2.5 sm:size-3" aria-hidden="true" />
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Items preview */}
          <div className="mt-4 space-y-2.5 sm:mt-5">
            {items.map((item) => {
              const addOnsTotal = item.addOns.reduce(
                (sum, addOn) => sum + addOn.price,
                0,
              );
              const itemTotal = (item.price + addOnsTotal) * item.quantity;
              return (
                <div
                  key={item.cartKey}
                  className="rounded-xl bg-orange-50/40 px-2.5 py-2 transition-colors duration-200 hover:bg-orange-50/70 sm:px-3 sm:py-2.5"
                >
                  <div className="flex items-start justify-between gap-2 sm:items-center">
                    <div className="flex min-w-0 shrink items-center gap-2 sm:gap-2.5">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black text-red-700 shadow-sm sm:size-6 sm:text-[11px]">
                        {item.quantity}
                      </span>
                      <span className="truncate text-xs font-bold text-[#25130b] sm:text-sm">
                        {item.name}
                      </span>
                    </div>
                    <span className="shrink-0 text-xs font-black text-red-700 tabular-nums sm:text-sm">
                      {formatPeso(itemTotal)}
                    </span>
                  </div>
                  {item.addOns.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1 pl-7 sm:pl-8.5">
                      {item.addOns.map((addOn) => (
                        <span
                          key={addOn.id}
                          className="inline-flex items-center gap-0.5 rounded-full bg-amber-50/80 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 sm:text-[10px]"
                        >
                          {addOn.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {/* Pricing breakdown */}
          <div className="mt-4 space-y-2.5 text-xs sm:mt-5 sm:space-y-3 sm:text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-orange-950/50">Subtotal</span>
              <span className="font-bold text-[#25130b] tabular-nums">
                {formatPeso(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-medium text-orange-950/50 sm:gap-1.5">
                Delivery fee
                {orderType === "PICKUP" ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-emerald-700 sm:text-[10px]">
                    Free
                  </span>
                ) : null}
              </span>
              <span className={cn(
                "font-bold tabular-nums",
                orderType === "PICKUP" ? "text-emerald-700" : "text-[#25130b]",
              )}>
                {orderType === "DELIVERY" ? formatPeso(deliveryFee) : formatPeso(0)}
              </span>
            </div>
          </div>

          {/* Gradient separator */}
          <div className="relative my-4 sm:my-5">
            <div className="h-px bg-orange-900/8" />
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-red-700/0 via-amber-400/40 to-red-700/0" />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-[#25130b] sm:text-base">Total</span>
            <span className="text-lg font-black text-red-700 tabular-nums sm:text-xl">
              {formatPeso(total)}
            </span>
          </div>

          {/* CTA Button (desktop) */}
          <Button
            type="button"
            disabled={isPending}
            onClick={() => formRef.current?.requestSubmit()}
            className="checkout-cta mt-5 hidden h-12 w-full rounded-2xl font-black shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98] lg:flex"
          >
            {isPending ? (
              "Creating Order..."
            ) : (
              <>
                Place Order
                <span className="ml-1.5 text-white/80">• {formatPeso(total)}</span>
              </>
            )}
          </Button>

          {/* Trust badges */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] font-medium text-orange-950/30 sm:mt-4 sm:text-[11px]">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-2.5 sm:size-3" aria-hidden="true" />
              Secure checkout
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="size-2.5 sm:size-3" aria-hidden="true" />
              Fast pickup/delivery
            </span>
          </div>
        </aside>
      </div>

      {/* ── Confirmation Dialog ── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="checkout-confirm-dialog max-w-sm overflow-hidden sm:max-w-md">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-red-100 shadow-sm">
                <ShoppingBag className="size-5 text-red-700" aria-hidden="true" />
              </div>
              <div>
                <DialogTitle className="text-lg font-black uppercase tracking-tight text-[#25130b]">
                  Confirm Your Order
                </DialogTitle>
                <DialogDescription className="text-xs font-medium text-orange-950/40">
                  Please review your order before placing
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="-mx-4 -mt-2 space-y-3 px-4 py-3">
            {/* Contact */}
            <div className="flex items-center gap-2.5 rounded-xl bg-orange-50/60 px-3 py-2.5">
              <User className="size-4 shrink-0 text-red-700/60" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-orange-950/40">Contact</p>
                <p className="truncate text-sm font-bold text-[#25130b]">{customerName} · {customerPhone}</p>
              </div>
            </div>

            {/* Order type */}
            <div className="flex items-center gap-2.5 rounded-xl bg-orange-50/60 px-3 py-2.5">
              <Truck className="size-4 shrink-0 text-red-700/60" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-orange-950/40">Order Type</p>
                <p className="truncate text-sm font-bold text-[#25130b]">
                  {orderType === "PICKUP" ? "Pickup" : "Delivery"}
                  {orderType === "DELIVERY" && deliveryAddress ? (
                    <span className="font-medium text-orange-950/60"> — {deliveryAddress}</span>
                  ) : null}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="flex items-center gap-2.5 rounded-xl bg-orange-50/60 px-3 py-2.5">
              <CreditCard className="size-4 shrink-0 text-red-700/60" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-orange-950/40">Payment</p>
                <p className="truncate text-sm font-bold text-[#25130b]">
                  {paymentMethod === "CASH"
                    ? "Cash at Pickup"
                    : paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : "GCash"}
                  {paymentMethod === "GCASH" && gcashReference ? (
                    <span className="font-medium text-orange-950/60"> — Ref: {gcashReference}</span>
                  ) : null}
                </p>
              </div>
            </div>

            {/* Items count + total */}
            <div className="flex items-center gap-2.5 rounded-xl bg-red-50/60 px-3 py-2.5">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-red-100 text-[10px] font-black text-red-700">
                {itemCount}
              </span>
              <div className="flex w-full items-center justify-between">
                <p className="text-sm font-bold text-[#25130b]">
                  {itemCount} item{itemCount !== 1 ? "s" : ""}
                </p>
                <p className="text-lg font-black text-red-700 tabular-nums">
                  {formatPeso(total)}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="sm:justify-between">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="flex h-11 w-full items-center justify-center rounded-xl border border-orange-900/10 bg-white font-black text-sm text-[#25130b] shadow-sm transition-all duration-200 hover:bg-orange-50/80 hover:border-orange-900/20 active:scale-[0.98] sm:w-auto sm:px-6"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmOrder}
              className="checkout-cta flex h-11 w-full items-center justify-center gap-2 rounded-xl font-black text-sm shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] sm:w-auto sm:px-6"
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

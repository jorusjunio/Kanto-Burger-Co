"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/features/cart/cart-store";
import { formatPeso } from "@/lib/format";

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
  const [error, setError] = useState("");
  const total = useMemo(
    () => subtotal + (orderType === "DELIVERY" ? deliveryFee : 0),
    [orderType, subtotal],
  );
  const paymentOptions = useMemo(
    () =>
      orderType === "DELIVERY"
        ? [
            ["COD", "Cash on delivery"],
            ["GCASH", "GCash manual payment"],
          ]
        : [
            ["CASH", "Cash at pickup"],
            ["GCASH", "GCash manual payment"],
          ],
    [orderType],
  );

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
    setError("");

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

      if (!result.ok) {
        setError(result.message);
        return;
      }

      clearCart();
      router.push(`/order/${result.orderNumber}?token=${result.trackingToken}`);
    });
  }

  if (items.length === 0) {
    return (
      <main className="storefront-bg min-h-screen">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-lg bg-red-700 text-amber-100 shadow-lg shadow-red-700/20">
            <CheckCircle2 aria-hidden="true" />
          </div>
          <h1 className="food-heading text-4xl leading-none">
            Checkout is waiting for your order
          </h1>
          <p className="mt-3 max-w-md font-medium text-orange-950/65">
            Add items from the menu first, then come back here to finish.
          </p>
          <Button className="kanto-button mt-6 font-black" asChild>
            <Link href="/menu">Browse Menu</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="storefront-bg min-h-screen">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px]">
        <form
          onSubmit={handleSubmit}
          className="kanto-card space-y-6 rounded-lg p-5"
        >
          <div>
            <Button variant="ghost" size="sm" asChild className="-ml-2 mb-3">
              <Link href="/cart">
                <ArrowLeft aria-hidden="true" />
                Back to Cart
              </Link>
            </Button>
            <p className="text-sm font-black uppercase tracking-wide text-red-700">
              Almost there
            </p>
            <h1 className="food-heading mt-2 text-4xl leading-none">
              Checkout
            </h1>
          </div>

          {error ? (
            <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {error}
            </div>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone number</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(event) =>
                  setCustomerPhone(formatPhoneInput(event.target.value))
                }
                inputMode="tel"
                placeholder="09XXXXXXXXX"
                required
              />
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orderType">Order type</Label>
              <select
                id="orderType"
                value={orderType}
                onChange={(event) =>
                  handleOrderTypeChange(event.target.value as CheckoutOrderType)
                }
                className="h-9 w-full rounded-lg border border-orange-900/15 bg-white px-3 text-sm outline-none focus:border-red-700"
              >
                <option value="PICKUP">Pickup</option>
                <option value="DELIVERY">Delivery</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment method</Label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value as CheckoutPaymentMethod)
                }
                className="h-9 w-full rounded-lg border border-orange-900/15 bg-white px-3 text-sm outline-none focus:border-red-700"
              >
                {paymentOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {orderType === "DELIVERY" ? (
            <div className="space-y-2">
              <Label htmlFor="deliveryAddress">Delivery address</Label>
              <Textarea
                id="deliveryAddress"
                value={deliveryAddress}
                onChange={(event) => setDeliveryAddress(event.target.value)}
                required
                className="bg-white"
              />
            </div>
          ) : null}

          {paymentMethod === "GCASH" ? (
            <div className="space-y-3 rounded-lg border border-sky-200 bg-sky-50 p-4">
              <div>
                <p className="text-sm font-black text-zinc-950">
                  GCash manual payment
                </p>
                <p className="mt-1 text-sm leading-6 text-zinc-600">
                  Send the total to {gcashNumber || "the store GCash number"},
                  then enter the reference number below.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gcashReference">GCash reference number</Label>
                <Input
                  id="gcashReference"
                  value={gcashReference}
                  onChange={(event) => setGcashReference(event.target.value)}
                  placeholder="Reference number from receipt"
                  required
                />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="notes">Order notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional"
              className="bg-white"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="kanto-button h-11 w-full font-black"
          >
            {isPending ? "Creating Order..." : "Place Order"}
          </Button>
        </form>

        <aside className="kanto-card h-fit rounded-lg p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-black uppercase text-[#25130b]">
            Order Summary
          </h2>
          <div className="mt-5 space-y-4">
            {items.map((item) => {
              const addOnsTotal = item.addOns.reduce(
                (sum, addOn) => sum + addOn.price,
                0,
              );
              const itemPrice = item.price + addOnsTotal;

              return (
                <div key={item.cartKey} className="text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="font-bold text-zinc-950">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-black text-zinc-950">
                      {formatPeso(itemPrice * item.quantity)}
                    </span>
                  </div>
                  {item.addOns.length > 0 ? (
                    <p className="mt-1 text-zinc-500">
                      {item.addOns.map((addOn) => addOn.name).join(", ")}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="my-5 border-t border-zinc-200" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-bold text-zinc-950">
                {formatPeso(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Delivery fee</span>
              <span className="font-bold text-zinc-950">
                {orderType === "DELIVERY" ? formatPeso(deliveryFee) : "Free"}
              </span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-3">
              <span className="font-black text-[#25130b]">Total</span>
              <span className="font-black text-red-700">
                {formatPeso(total)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

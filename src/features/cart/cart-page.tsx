"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/cart-store";
import { formatPeso } from "@/lib/format";

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.subtotal());

  if (items.length === 0) {
    return (
      <main className="storefront-bg min-h-screen">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-lg bg-red-700 text-amber-100 shadow-lg shadow-red-700/20">
            <ShoppingBag aria-hidden="true" />
          </div>
          <h1 className="food-heading text-4xl leading-none">
            Your cart is empty
          </h1>
          <p className="mt-3 max-w-md font-medium text-orange-950/65">
            Add burgers, sides, and drinks from the menu before checking out.
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
        <section className="space-y-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-red-700">
              Your order
            </p>
            <h1 className="food-heading mt-2 text-4xl leading-none">Cart</h1>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const addOnsTotal = item.addOns.reduce(
                (sum, addOn) => sum + addOn.price,
                0,
              );
              const itemPrice = item.price + addOnsTotal;

              return (
                <article
                  key={item.cartKey}
                  className="kanto-card grid gap-4 rounded-lg p-4 sm:grid-cols-[104px_1fr_auto]"
                >
                  <div className="relative aspect-square overflow-hidden rounded-md bg-orange-50">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="104px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div>
                    <h2 className="font-black uppercase text-[#25130b]">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-sm font-bold text-orange-950/55">
                      {formatPeso(itemPrice)} each
                    </p>
                    {item.addOns.length > 0 ? (
                      <p className="mt-2 text-sm text-orange-950/65">
                        Add-ons:{" "}
                        {item.addOns.map((addOn) => addOn.name).join(", ")}
                      </p>
                    ) : null}
                    {item.notes ? (
                      <p className="mt-1 text-sm text-orange-950/65">
                        Note: {item.notes}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="flex items-center rounded-lg border border-orange-900/15 bg-white">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateQuantity(item.cartKey, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus aria-hidden="true" />
                      </Button>
                      <span className="w-9 text-center text-sm font-black">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateQuantity(item.cartKey, item.quantity + 1)
                        }
                        disabled={Boolean(
                          item.maxQuantity && item.quantity >= item.maxQuantity,
                        )}
                      >
                        <Plus aria-hidden="true" />
                      </Button>
                    </div>
                    {item.maxQuantity ? (
                      <p className="text-xs text-zinc-500">
                        Max {item.maxQuantity} available
                      </p>
                    ) : null}
                    <div className="text-right">
                      <p className="font-black text-red-700">
                        {formatPeso(itemPrice * item.quantity)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1 text-red-700 hover:text-red-800"
                        onClick={() => removeItem(item.cartKey)}
                      >
                        <Trash2 aria-hidden="true" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="kanto-card h-fit rounded-lg p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-black uppercase text-[#25130b]">
            Order Summary
          </h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-bold text-zinc-950">
                {formatPeso(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Delivery fee</span>
              <span className="font-bold text-zinc-950">Calculated later</span>
            </div>
          </div>
          <div className="my-5 border-t border-zinc-200" />
          <div className="flex justify-between">
            <span className="font-black text-zinc-950">Total</span>
            <span className="font-black text-zinc-950">
              {formatPeso(subtotal)}
            </span>
          </div>
          <Button className="kanto-button mt-5 w-full font-black" asChild>
            <Link href="/checkout">Continue to Checkout</Link>
          </Button>
          <Button
            className="mt-2 w-full border-orange-900/20 bg-white/80 font-black text-orange-950 hover:text-red-700"
            variant="outline"
            asChild
          >
            <Link href="/menu">Add More Items</Link>
          </Button>
        </aside>
      </div>
    </main>
  );
}

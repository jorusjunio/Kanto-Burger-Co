"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Check,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Star,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/features/cart/cart-store";
import { formatPeso } from "@/lib/format";
import { shouldUnoptimizeImage } from "@/lib/image";
import { cn } from "@/lib/utils";

import type { MenuProduct } from "./types";

type ProductCardProps = {
  product: MenuProduct;
};

function getStockLabel(product: MenuProduct) {
  if (!product.isAvailable) return "Unavailable";
  if (!product.trackStock) return "Available";
  if (product.stockQuantity <= 0) return "Sold out";
  if (product.stockQuantity <= product.lowStockThreshold) {
    return `${product.stockQuantity} left`;
  }
  return "Available";
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const isSoldOut =
    !product.isAvailable || (product.trackStock && product.stockQuantity <= 0);
  const availableAddOns = product.addOns.filter((addOn) => addOn.isAvailable);
  const selectedAddOns = useMemo(
    () =>
      availableAddOns.filter((addOn) => selectedAddOnIds.includes(addOn.id)),
    [availableAddOns, selectedAddOnIds],
  );
  const addOnsTotal = selectedAddOns.reduce(
    (total, addOn) => total + addOn.price,
    0,
  );
  const maxQuantity = product.trackStock ? product.stockQuantity : undefined;
  const itemTotal = (product.price + addOnsTotal) * quantity;
  const shouldUnoptimizeProductImage = product.imageUrl
    ? shouldUnoptimizeImage(product.imageUrl)
    : false;

  function toggleAddOn(addOnId: string) {
    setSelectedAddOnIds((current) =>
      current.includes(addOnId)
        ? current.filter((id) => id !== addOnId)
        : [...current, addOnId],
    );
  }

  function handleAddToCart() {
    const addOnKey = selectedAddOns.map((addOn) => addOn.id).sort().join(".");
    const normalizedNotes = notes.trim();

    addItem({
      cartKey: [product.id, addOnKey, normalizedNotes].filter(Boolean).join(":"),
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity,
      maxQuantity,
      addOns: selectedAddOns.map((addOn) => ({
        id: addOn.id,
        name: addOn.name,
        price: addOn.price,
      })),
      notes: normalizedNotes || undefined,
    });

    setIsDialogOpen(false);
    setQuantity(1);
    setSelectedAddOnIds([]);
    setNotes("");
  }

  return (
    <Card className="menu-card group h-full gap-0 overflow-hidden rounded-2xl border-0 p-0 shadow-[0_2px_16px_rgba(120,53,15,0.06)] transition-all duration-300 hover:shadow-[0_16px_48px_rgba(120,53,15,0.12)] hover:-translate-y-1">
      {/* ── Image Area ── */}
      <div className="menu-card__image relative aspect-[4/3] overflow-hidden bg-white -mb-[1px]">
        {product.imageUrl ? (
          <>
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
              unoptimized={shouldUnoptimizeProductImage}
              className="scale-[1.15] object-cover opacity-30 blur-sm transition-all duration-700 group-hover:scale-[1.25] group-hover:opacity-40"
              aria-hidden="true"
            />
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
              unoptimized={shouldUnoptimizeProductImage}
              className="object-cover transition-all duration-500 group-hover:scale-105"
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col justify-between bg-[linear-gradient(135deg,#dc2626,#f97316_62%,#facc15)] p-5 text-white">
            <span className="w-fit rounded-lg bg-white/20 px-2.5 py-1 text-xs font-black backdrop-blur-sm">
              Kanto Burger Co.
            </span>
            <span className="max-w-52 text-3xl font-black leading-8">
              {product.name}
            </span>
          </div>
        )}

        {/* Gradient wash for depth */}
        <div className="menu-card__wash" />

        {/* Featured badge */}
        {product.isFeatured ? (
          <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black uppercase text-red-950 shadow-lg shadow-amber-400/30">
            <Star className="size-3 fill-red-950" aria-hidden="true" />
            Hot pick
          </div>
        ) : null}

        {/* Floating price badge */}
        <div className="absolute bottom-3 right-3 z-10 rounded-xl bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
          <p className="text-lg font-black text-red-700">
            {formatPeso(product.price)}
          </p>
        </div>
      </div>

      {/* ── Content Area ── */}
      <CardContent className="flex flex-1 flex-col gap-3 p-4 pt-4">
        <div className="flex flex-1 flex-col gap-2">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-black uppercase leading-tight tracking-tight text-[#25130b]">
                {product.name}
              </h3>
              {product.isFeatured ? (
                <Badge className="mt-0.5 shrink-0 bg-amber-100 text-amber-800 hover:bg-amber-100">
                  <Star className="size-3 fill-amber-500" aria-hidden="true" />
                  Featured
                </Badge>
              ) : null}
            </div>
            <p className="line-clamp-2 text-[13px] leading-relaxed text-orange-950/50">
              {product.description}
            </p>
          </div>

          {/* Stock + Add-ons info */}
          <div className="mt-auto flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                isSoldOut
                  ? "border-red-200 bg-red-50 text-red-600"
                  : product.trackStock &&
                      product.stockQuantity <= product.lowStockThreshold
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-600"
              }
            >
              {getStockLabel(product)}
            </Badge>
            {availableAddOns.length > 0 ? (
              <span className="text-xs font-medium text-orange-950/35">
                +{availableAddOns.length} add-ons
              </span>
            ) : null}
          </div>
        </div>

        {/* CTA Button */}
        <Button
          className="menu-card__cta h-11 w-full rounded-xl font-black shadow-md transition-all duration-300"
          disabled={isSoldOut}
          onClick={() => setIsDialogOpen(true)}
        >
          <ShoppingBag className="size-4" aria-hidden="true" />
          {isSoldOut ? "Sold Out" : "Customize & Add"}
        </Button>
      </CardContent>

      {/* ── Customization Dialog ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-h-[90vh] overflow-y-auto rounded-3xl border-0 p-0 shadow-2xl sm:max-w-lg md:rounded-[2rem]"
        >
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
          <div className="product-dialog flex flex-col">
            {/* ── Image Banner ── */}
            <div className="product-dialog-banner relative h-48 overflow-hidden sm:h-56">
              {product.imageUrl ? (
                <>
                  <Image
                    src={product.imageUrl}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 512px, 100vw"
                    unoptimized={shouldUnoptimizeProductImage}
                    className="scale-105 object-cover blur-sm opacity-40"
                    aria-hidden="true"
                  />
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(min-width: 640px) 512px, 100vw"
                    unoptimized={shouldUnoptimizeProductImage}
                    className="product-dialog-banner-img object-cover object-center"
                  />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-red-600 via-orange-500 to-amber-400">
                  <span className="text-3xl font-black uppercase tracking-wider text-white/80">
                    {product.name}
                  </span>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#fffbf5] via-[#fffbf5]/60 to-transparent" />

              {/* Decorative glow */}
              <div className="pointer-events-none absolute -top-8 -right-8 size-48 rounded-full bg-gradient-to-br from-amber-300/20 to-transparent blur-3xl" />

              {/* Product name on banner */}
              <div className="absolute bottom-4 left-5 right-16 z-10">
                <p className="section-kicker text-[11px]">Customize your order</p>
                <h2 className="product-dialog-title mt-0.5 text-2xl font-black uppercase leading-tight text-[#25130b]">
                  {product.name}
                </h2>
              </div>

              {product.isFeatured ? (
                <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full bg-amber-400/90 px-3 py-1 text-[10px] font-black uppercase text-red-950 shadow-lg shadow-amber-400/20 backdrop-blur-sm">
                  <Star className="size-3 fill-red-950" aria-hidden="true" />
                  Hot pick
                </div>
              ) : null}
            </div>

            {/* ── Body ── */}
            <div className="flex-1 space-y-5 px-6 pb-5 pt-5">
              {/* Description */}
              <p className="text-sm leading-relaxed text-orange-950/50">
                {product.description}
              </p>

              {/* ── Price + Quantity Row ── */}
              <div className="flex items-center justify-between gap-4">
                {/* Base price tag */}
                <div>
                  <p className="text-xs font-bold uppercase text-orange-950/35">
                    Base price
                  </p>
                  <p className="text-2xl font-black text-red-700">
                    {formatPeso(product.price)}
                  </p>
                </div>

                {/* Quantity Stepper */}
                <div className="product-dialog-stepper flex items-center rounded-2xl border border-orange-900/10 bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    disabled={quantity <= 1}
                    className="product-dialog-stepper-btn flex size-9 items-center justify-center rounded-xl text-orange-950/50 transition-all duration-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <span className="stepper-value flex w-10 items-center justify-center text-base font-black tabular-nums text-[#25130b]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(maxQuantity ?? Number.POSITIVE_INFINITY, current + 1),
                      )
                    }
                    disabled={Boolean(maxQuantity && quantity >= maxQuantity)}
                    className="product-dialog-stepper-btn flex size-9 items-center justify-center rounded-xl text-orange-950/50 transition-all duration-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* ── Add-ons ── */}
              {availableAddOns.length > 0 ? (
                <div className="product-dialog-section">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-px flex-1 bg-gradient-to-r from-orange-900/10 to-transparent" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-orange-950/30">
                      Add-ons
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-l from-orange-900/10 to-transparent" />
                  </div>
                  <div className="grid gap-2">
                    {availableAddOns.map((addOn, idx) => {
                      const isSelected = selectedAddOnIds.includes(addOn.id);
                      return (
                        <label
                          key={addOn.id}
                          className={cn(
                            "product-dialog-addon group relative flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 p-3.5 transition-all duration-300",
                            isSelected
                              ? "border-red-700/25 bg-gradient-to-r from-red-50 to-amber-50 shadow-sm"
                              : "border-orange-900/8 bg-white shadow-[0_1px_3px_rgba(120,53,15,0.04)] hover:border-red-700/20 hover:bg-red-50/40 hover:shadow-md",
                          )}
                          style={{ "--addon-index": idx } as React.CSSProperties}
                        >
                          {/* Custom checkbox */}
                          <span className="flex items-center gap-3">
                            <span
                              className={cn(
                                "product-dialog-checkbox flex size-6 items-center justify-center rounded-lg border-2 transition-all duration-300",
                                isSelected
                                  ? "border-red-700 bg-red-700 shadow-sm shadow-red-700/20"
                                  : "border-orange-900/20 bg-white group-hover:border-red-700/40",
                              )}
                            >
                              {isSelected ? (
                                <Check className="size-3.5 text-white animate-in zoom-in-75 duration-150" aria-hidden="true" />
                              ) : null}
                            </span>
                            <span className="flex flex-col">
                              <span
                                className={cn(
                                  "text-sm font-bold transition-colors duration-300",
                                  isSelected ? "text-[#25130b]" : "text-[#25130b]",
                                )}
                              >
                                {addOn.name}
                              </span>
                            </span>
                          </span>
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-black transition-all duration-300",
                              isSelected
                                ? "bg-red-700 text-white shadow-sm shadow-red-700/20"
                                : "bg-orange-100/70 text-orange-950/40 group-hover:bg-red-100/70 group-hover:text-red-700",
                            )}
                          >
                            +{formatPeso(addOn.price)}
                          </span>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleAddOn(addOn.id)}
                            className="sr-only"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* ── Special Notes ── */}
              <div className="product-dialog-section">
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-orange-900/10 to-transparent" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-orange-950/30">
                    Special notes
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-l from-orange-900/10 to-transparent" />
                </div>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="e.g. no onions, extra sauce, well-done patty"
                  rows={2}
                  className="rounded-2xl border-orange-900/10 bg-white/60 text-sm placeholder:text-orange-950/25 focus:border-red-700/30 focus:ring-1 focus:ring-red-700/15"
                />
              </div>
            </div>

            {/* ── Footer ── */}
            <DialogFooter className="mx-0 mb-0 border-t border-orange-900/8 bg-gradient-to-t from-[#fff3e0]/40 to-[#fffbf5] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              {/* Price breakdown */}
              <div className="product-dialog-price mb-3 sm:mb-0">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-bold uppercase text-orange-950/35">
                    Total
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-red-700 tabular-nums">
                      {formatPeso(itemTotal)}
                    </span>
                    {quantity > 1 ? (
                      <span className="text-[11px] font-bold text-orange-950/30">
                        ({formatPeso(product.price + addOnsTotal)} × {quantity})
                      </span>
                    ) : null}
                  </div>
                </div>
                {selectedAddOns.length > 0 ? (
                  <p className="mt-0.5 text-[11px] font-medium text-orange-950/30">
                    incl. {selectedAddOns.map((a) => a.name).join(", ")}
                  </p>
                ) : null}
              </div>

              <div className="flex gap-2">
                {/* Cancel button */}
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    className="hidden h-12 rounded-xl px-4 text-sm font-bold text-orange-950/40 hover:bg-orange-100/60 hover:text-orange-950 sm:inline-flex"
                  >
                    Cancel
                  </Button>
                </DialogClose>

                {/* Add to Cart */}
                <Button
                  className="product-dialog-cta h-12 rounded-2xl px-6 text-sm font-black shadow-lg transition-all duration-300 active:scale-[0.97]"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="size-4" aria-hidden="true" />
                  Add to Cart • {formatPeso(itemTotal)}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

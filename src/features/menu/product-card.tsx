"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Minus, Plus, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/features/cart/cart-store";
import { formatPeso } from "@/lib/format";

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
    <Card className="kanto-card group h-full gap-0 overflow-hidden rounded-lg p-3 shadow-none transition duration-200 hover:-translate-y-1 hover:border-red-700/30">
      <div className="product-image-frame relative aspect-[4/3] overflow-hidden rounded-md bg-orange-50">
        {product.imageUrl ? (
          <>
            <Image
              src={product.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 350px, (min-width: 640px) 50vw, 100vw"
              className="scale-125 object-cover opacity-45 blur-md"
              aria-hidden="true"
            />
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 350px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          </>
        ) : (
          <div className="flex h-full w-full flex-col justify-between bg-[linear-gradient(135deg,#dc2626,#f97316_62%,#facc15)] p-4 text-white">
            <span className="w-fit rounded bg-white/20 px-2 py-1 text-xs font-black">
              Kanto Burger Co.
            </span>
            <span className="max-w-44 text-2xl font-black leading-7">
              {product.name}
            </span>
          </div>
        )}
        {product.isFeatured ? (
          <div className="absolute left-3 top-3 rounded-full bg-amber-300 px-3 py-1 text-xs font-black uppercase text-red-950 shadow-sm">
            Hot pick
          </div>
        ) : null}
      </div>

      <CardContent className="flex flex-1 flex-col space-y-4 p-1 pt-4">
        <div className="space-y-2">
          <div className="flex min-h-[104px] flex-col justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black uppercase text-[#25130b]">
                  {product.name}
                </h3>
                {product.isFeatured ? (
                  <Badge className="bg-amber-200 text-red-900 hover:bg-amber-200">
                    <Star aria-hidden="true" />
                    Featured
                  </Badge>
                ) : null}
              </div>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-orange-950/60">
                {product.description}
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-black text-red-700">
                {formatPeso(product.price)}
              </p>
              <Badge
                variant="outline"
                className={
                  isSoldOut
                    ? "border-red-200 bg-red-50 text-red-700"
                    : product.trackStock &&
                      product.stockQuantity <= product.lowStockThreshold
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }
              >
                {getStockLabel(product)}
              </Badge>
            </div>
          </div>
        </div>

        <Button
          className="kanto-button w-full font-black"
          disabled={isSoldOut}
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus aria-hidden="true" />
          {isSoldOut ? "Sold Out" : "Customize"}
        </Button>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase text-[#25130b]">
              {product.name}
            </DialogTitle>
            <DialogDescription className="leading-6">
              {product.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-lg border border-orange-900/10 bg-orange-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-[#25130b]">Base price</span>
                <span className="font-black text-red-700">
                  {formatPeso(product.price)}
                </span>
              </div>
            </div>

            {availableAddOns.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <h3 className="font-black text-[#25130b]">Add-ons</h3>
                  <p className="text-sm text-zinc-500">
                    Choose extras for this item.
                  </p>
                </div>
                <div className="space-y-2">
                  {availableAddOns.map((addOn) => (
                    <label
                      key={addOn.id}
                      className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-orange-900/10 p-3 hover:border-red-700"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedAddOnIds.includes(addOn.id)}
                          onChange={() => toggleAddOn(addOn.id)}
                          className="size-4 accent-red-700"
                        />
                        <span className="font-bold text-[#25130b]">
                          {addOn.name}
                        </span>
                      </span>
                      <span className="text-sm font-black text-red-700">
                        +{formatPeso(addOn.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <h3 className="font-black text-[#25130b]">Notes</h3>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Example: no onions, extra sauce"
                className="min-h-20 bg-white"
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center rounded-lg border border-orange-900/15 bg-white">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus aria-hidden="true" />
                </Button>
                <span className="w-10 text-center text-sm font-black">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(maxQuantity ?? Number.POSITIVE_INFINITY, current + 1),
                    )
                  }
                  disabled={Boolean(maxQuantity && quantity >= maxQuantity)}
                >
                  <Plus aria-hidden="true" />
                </Button>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase text-zinc-500">
                  Item total
                </p>
                <p className="text-xl font-black text-red-700">
                  {formatPeso(itemTotal)}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="kanto-button w-full font-black sm:w-auto"
              onClick={handleAddToCart}
            >
              <Plus aria-hidden="true" />
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

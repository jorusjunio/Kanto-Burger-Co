"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Boxes,
  ImageUp,
  Layers,
  Save,
  Store,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CategoryOption = {
  id: string;
  name: string;
};

type ProductFormProduct = {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: unknown;
  imageUrl: string | null;
  isFeatured: boolean;
  isAvailable: boolean;
  trackStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  addOns: Array<{
    name: string;
    price: unknown;
    isAvailable: boolean;
  }>;
};

type ProductFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  categories: CategoryOption[];
  product?: ProductFormProduct;
  submitLabel: string;
};

const fieldClassName =
  "h-11 rounded-xl border-2 border-orange-900/10 bg-white px-3.5 text-sm shadow-sm transition-all duration-300 ease-out focus-visible:border-red-500/50 focus-visible:ring-4 focus-visible:ring-red-500/10";

const areaClassName =
  "rounded-xl border-2 border-orange-900/10 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all duration-300 ease-out focus-visible:border-red-500/50 focus-visible:ring-4 focus-visible:ring-red-500/10";

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: typeof Tag;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-6 items-center justify-center rounded-lg bg-red-100 text-red-700">
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <span className="text-[11px] font-black uppercase tracking-wider text-orange-950/55">
        {children}
      </span>
    </div>
  );
}

function addOnsToText(product?: ProductFormProduct) {
  return (
    product?.addOns
      .map((addOn) =>
        [
          addOn.name,
          Number(addOn.price).toFixed(2),
          addOn.isAvailable ? "available" : "unavailable",
        ].join(" | "),
      )
      .join("\n") ?? ""
  );
}

export function ProductForm({
  action,
  categories,
  product,
  submitLabel,
}: ProductFormProps) {
  const [preview, setPreview] = useState<string | null>(
    product?.imageUrl ?? null,
  );
  const [fileName, setFileName] = useState<string | null>(null);

  // Release object URLs created for the live preview to avoid memory leaks.
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
  }

  return (
    <form
      action={action}
      className="grid gap-6 lg:grid-cols-[1fr_340px] animate-fade-in"
    >
      {/* Main panel */}
      <div className="space-y-7 rounded-2xl border border-orange-900/10 bg-white p-6 shadow-[0_10px_30px_-12px_rgba(120,53,15,0.18)]">
        {/* Details */}
        <section className="space-y-4">
          <SectionLabel icon={Tag}>Product details</SectionLabel>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                required
                className={fieldClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={product?.slug}
                placeholder="auto-generated from name"
                className={fieldClassName}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description}
              required
              className={`max-h-[152px] ${areaClassName}`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                name="categoryId"
                defaultValue={product?.categoryId ?? categories[0]?.id}
              >
                <SelectTrigger
                  id="categoryId"
                  className={`w-full ${fieldClassName} font-bold text-[#25130b]`}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue={product ? Number(product.price) : ""}
                required
                className={fieldClassName}
              />
            </div>
          </div>
        </section>

        <div className="h-px bg-orange-900/10" />

        {/* Image */}
        <section className="space-y-4">
          <SectionLabel icon={ImageUp}>Image</SectionLabel>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="text"
              defaultValue={product?.imageUrl ?? ""}
              placeholder="https://... or /assets/products/item.jpg"
              className={fieldClassName}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="imageFile">Upload image</Label>
            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
              {/* Dropzone */}
              <label
                htmlFor="imageFile"
                className="group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-orange-900/15 bg-stone-50/70 px-4 py-8 text-center transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-red-400/60 hover:bg-red-50/40"
              >
                <span className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30 transition-transform duration-300 group-hover:scale-110">
                  <UploadCloud className="size-6" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-black text-[#25130b]">
                    {fileName ?? "Click to upload an image"}
                  </span>
                  <span className="mt-0.5 block text-xs text-stone-500">
                    PNG or JPG, up to 5MB
                  </span>
                </span>
                <input
                  id="imageFile"
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              {/* Live preview */}
              {preview ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl border-2 border-orange-900/10 shadow-sm sm:w-40">
                  <Image
                    src={preview}
                    alt={fileName ?? product?.name ?? "Preview"}
                    fill
                    sizes="160px"
                    unoptimized
                    className="object-cover"
                  />
                  {fileName ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPreview(product?.imageUrl ?? null);
                        setFileName(null);
                      }}
                      aria-label="Remove selected image"
                      className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-red-600"
                    >
                      <X className="size-4" />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <p className="text-xs leading-5 text-stone-500">
              Optional. Uploading a file replaces the URL above after save.
            </p>
          </div>
        </section>

        <div className="h-px bg-orange-900/10" />

        {/* Add-ons */}
        <section className="space-y-4">
          <SectionLabel icon={Layers}>Add-ons</SectionLabel>
          <div className="space-y-2">
            <Textarea
              id="addOns"
              name="addOns"
              defaultValue={addOnsToText(product)}
              placeholder="Extra Cheese | 20.00 | available"
              className={`max-h-[228px] font-mono ${areaClassName}`}
            />
            <p className="text-xs leading-5 text-stone-500">
              One add-on per line: name | price | available/unavailable.
            </p>
          </div>
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-5">
        <div className="admin-card rounded-2xl border border-orange-900/10 bg-white p-5 shadow-[0_10px_30px_-12px_rgba(120,53,15,0.18)]">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30">
              <Boxes className="size-4" aria-hidden="true" />
            </span>
            <h2 className="font-black text-[#25130b]">Inventory</h2>
          </div>
          <div className="mt-4 space-y-4">
            <label className="flex items-center gap-3 text-sm font-bold text-[#25130b]">
              <input
                type="checkbox"
                name="trackStock"
                defaultChecked={product?.trackStock ?? true}
                className="size-4 accent-red-600"
              />
              Track stock
            </label>
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Stock quantity</Label>
              <Input
                id="stockQuantity"
                name="stockQuantity"
                type="number"
                min="0"
                defaultValue={product?.stockQuantity ?? 0}
                required
                className={fieldClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low stock alert</Label>
              <Input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                defaultValue={product?.lowStockThreshold ?? 5}
                required
                className={fieldClassName}
              />
            </div>
          </div>
        </div>

        <div className="admin-card rounded-2xl border border-orange-900/10 bg-white p-5 shadow-[0_10px_30px_-12px_rgba(120,53,15,0.18)]">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md shadow-red-600/30">
              <Store className="size-4" aria-hidden="true" />
            </span>
            <h2 className="font-black text-[#25130b]">Storefront</h2>
          </div>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 text-sm font-bold text-[#25130b]">
              <input
                type="checkbox"
                name="isAvailable"
                defaultChecked={product?.isAvailable ?? true}
                className="size-4 accent-red-600"
              />
              Available to order
            </label>
            <label className="flex items-center gap-3 text-sm font-bold text-[#25130b]">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product?.isFeatured ?? false}
                className="size-4 accent-red-600"
              />
              Featured product
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            className="group h-11 rounded-xl bg-gradient-to-br from-red-600 to-red-700 font-black text-white shadow-lg shadow-red-600/30 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/40 active:translate-y-0 active:scale-[0.98]"
          >
            <Save
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:scale-110"
            />
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            asChild
            className="h-11 rounded-xl border-2 border-orange-900/10 font-bold text-orange-950/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-orange-50 hover:text-[#25130b]"
          >
            <Link href="/admin/menu">Cancel</Link>
          </Button>
        </div>
      </aside>
    </form>
  );
}

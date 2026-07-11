"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageUp, Layers, Save, Tag, UploadCloud, X } from "lucide-react";

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
  "h-9 rounded-lg border-0 bg-white px-3 text-sm shadow-none ring-1 ring-orange-900/10 transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-red-500/30";

const areaClassName =
  "rounded-lg border-0 bg-white px-3 py-2 text-sm shadow-none ring-1 ring-orange-900/10 transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-red-500/30";

const cardClassName = "rounded-xl bg-white p-4 ring-1 ring-orange-900/10";

const labelClassName = "text-xs font-bold text-orange-950/55";

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: typeof Tag;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-orange-950/45">
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="text-[11px] font-black uppercase tracking-wider">
        {children}
      </span>
    </div>
  );
}

/** Switch-styled checkbox, matching the Live toggle on the menu table. */
function ToggleRow({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1.5">
      <span className="text-sm font-bold text-[#25130b]">{label}</span>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`relative inline-flex h-5.5 w-10 shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked ? "bg-emerald-500" : "bg-orange-950/15"
        }`}
      >
        <span
          className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5.25" : "translate-x-0.75"
          }`}
        />
      </span>
    </label>
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
      className="grid gap-4 lg:grid-cols-[1fr_300px] lg:items-start animate-fade-in"
    >
      {/* ── Main column ── */}
      <div className={`${cardClassName} space-y-4`}>
        {/* Details */}
        <section className="space-y-3">
          <SectionLabel icon={Tag}>Details</SectionLabel>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name" className={labelClassName}>
                Product name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                required
                className={fieldClassName}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slug" className={labelClassName}>
                Slug
              </Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={product?.slug}
                placeholder="auto-generated"
                className={fieldClassName}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="categoryId" className={labelClassName}>
                Category
              </Label>
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
            <div className="space-y-1.5">
              <Label htmlFor="price" className={labelClassName}>
                Price (₱)
              </Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="description" className={labelClassName}>
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description}
              required
              rows={2}
              className={`min-h-0 ${areaClassName}`}
            />
          </div>
        </section>

        <div className="h-px bg-orange-900/6" />

        {/* Image — compact horizontal row */}
        <section className="space-y-3">
          <SectionLabel icon={ImageUp}>Image</SectionLabel>

          <div className="flex items-stretch gap-3">
            <label
              htmlFor="imageFile"
              className="group flex flex-1 cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-dashed border-orange-900/20 bg-orange-950/2 px-4 py-4 transition-colors duration-200 hover:border-red-400/60 hover:bg-red-50/40"
            >
              <UploadCloud
                className="size-5 shrink-0 text-orange-950/30 transition-colors duration-200 group-hover:text-red-600"
                aria-hidden="true"
              />
              <span className="min-w-0 text-left">
                <span className="block truncate text-sm font-bold text-[#25130b]">
                  {fileName ?? "Click to upload"}
                </span>
                <span className="block text-xs text-orange-950/40">
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

            {preview ? (
              <div className="relative aspect-square w-[72px] shrink-0 overflow-hidden rounded-lg ring-1 ring-orange-900/10">
                <Image
                  src={preview}
                  alt={fileName ?? product?.name ?? "Preview"}
                  fill
                  sizes="72px"
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
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-red-600"
                  >
                    <X className="size-3" />
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          <details>
            <summary className="cursor-pointer list-none text-xs font-bold text-orange-950/40 transition-colors hover:text-red-700">
              Or paste an image URL
            </summary>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="text"
              defaultValue={product?.imageUrl ?? ""}
              placeholder="https://... or /assets/products/item.jpg"
              className={`mt-2 ${fieldClassName}`}
            />
          </details>
        </section>

        <div className="h-px bg-orange-900/6" />

        {/* Add-ons */}
        <section className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <SectionLabel icon={Layers}>Add-ons</SectionLabel>
            <span className="text-[11px] font-medium text-orange-950/35">
              name | price | available
            </span>
          </div>
          <Textarea
            id="addOns"
            name="addOns"
            defaultValue={addOnsToText(product)}
            placeholder="Extra Cheese | 20.00 | available"
            rows={3}
            className={`min-h-0 font-mono ${areaClassName}`}
          />
        </section>
      </div>

      {/* ── Sidebar — one card + actions ── */}
      <aside className="space-y-4">
        <div className={cardClassName}>
          <h2 className="text-[13px] font-black uppercase tracking-wide text-[#25130b]">
            Settings
          </h2>
          <div className="mt-2 divide-y divide-orange-900/6">
            <ToggleRow
              name="isAvailable"
              label="Live on storefront"
              defaultChecked={product?.isAvailable ?? true}
            />
            <ToggleRow
              name="isFeatured"
              label="Featured"
              defaultChecked={product?.isFeatured ?? false}
            />
            <ToggleRow
              name="trackStock"
              label="Track stock"
              defaultChecked={product?.trackStock ?? true}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-orange-900/6 pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="stockQuantity" className={labelClassName}>
                Quantity
              </Label>
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
            <div className="space-y-1.5">
              <Label htmlFor="lowStockThreshold" className={labelClassName}>
                Low-stock alert
              </Label>
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

        <div className="flex gap-2">
          <Button
            type="submit"
            className="h-10 flex-1 rounded-full bg-red-600 text-sm font-bold text-white transition-colors duration-200 hover:bg-red-700 active:scale-[0.99]"
          >
            <Save className="size-4" aria-hidden="true" />
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            asChild
            className="h-10 rounded-full px-4 text-sm font-bold text-orange-950/50 transition-colors hover:bg-orange-950/5 hover:text-[#25130b]"
          >
            <Link href="/admin/menu">Cancel</Link>
          </Button>
        </div>
      </aside>
    </form>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageUp, Layers, Plus, Save, Tag, UploadCloud, X } from "lucide-react";

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

// Same helper the server actions use, so the live preview in this form always
// matches what resolveSlug() will actually store.
import { slugify } from "./action-helpers";

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
  /** Extra card rendered at the bottom of the sidebar (e.g. the Edit page's
      danger zone). Rendered inside the form visually, but any dialogs it opens
      portal out, so nested-form rules stay intact. */
  dangerZone?: React.ReactNode;
};

const fieldClassName =
  "h-10 rounded-lg border-0 bg-white px-3.5 text-sm shadow-none ring-1 ring-orange-900/10 transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-red-500/30";

const areaClassName =
  "rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm shadow-none ring-1 ring-orange-900/10 transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-red-500/30";

const cardClassName = "rounded-xl bg-white p-6 ring-1 ring-orange-900/10";

const cardTitleClassName =
  "text-[13px] font-black uppercase tracking-wide text-[#25130b]";

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: typeof Tag;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-orange-950/45">
      <Icon className="size-3.5" aria-hidden="true" />
      <span className="text-[11px] font-black uppercase tracking-wider">
        {children}
      </span>
    </div>
  );
}

/** Switch-styled checkbox row, matching the Live toggle on the menu table. */
function ToggleRow({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 py-1">
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[#25130b]">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-orange-950/40">
            {hint}
          </span>
        ) : null}
      </span>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
          checked ? "bg-emerald-500" : "bg-orange-950/15"
        }`}
      >
        <span
          className={`inline-block size-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-0.75"
          }`}
        />
      </span>
    </label>
  );
}

type AddOnRow = {
  key: number;
  name: string;
  price: string;
  isAvailable: boolean;
};

/** Serialize rows into the `name | price | availability` lines the server
 *  action already parses — the row editor is purely a UI upgrade. */
function addOnsToText(rows: AddOnRow[]) {
  return rows
    .filter((row) => row.name.trim() !== "")
    .map((row) =>
      [
        row.name.trim(),
        row.price.trim() === "" ? "0" : row.price.trim(),
        row.isAvailable ? "available" : "unavailable",
      ].join(" | "),
    )
    .join("\n");
}

function AddOnsEditor({ initial }: { initial: AddOnRow[] }) {
  const [rows, setRows] = useState<AddOnRow[]>(initial);

  function updateRow(key: number, patch: Partial<AddOnRow>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    setRows((current) => [
      ...current,
      { key: Date.now(), name: "", price: "", isAvailable: true },
    ]);
  }

  function removeRow(key: number) {
    setRows((current) => current.filter((row) => row.key !== key));
  }

  return (
    <div className="space-y-2.5">
      {/* Serialized payload — same format the server action already parses. */}
      <input type="hidden" name="addOns" value={addOnsToText(rows)} />

      {rows.length === 0 ? (
        <p className="rounded-lg bg-orange-950/[0.03] px-3.5 py-3 text-xs text-orange-950/40">
          No add-ons yet — e.g. Extra Cheese, Bacon Strips.
        </p>
      ) : (
        rows.map((row, index) => (
          <div key={row.key} className="flex items-center gap-2">
            <Input
              value={row.name}
              onChange={(event) =>
                // "|" is the serializer's delimiter — keep it out of names.
                updateRow(row.key, {
                  name: event.target.value.replaceAll("|", ""),
                })
              }
              placeholder={`Add-on ${index + 1} name`}
              aria-label={`Add-on ${index + 1} name`}
              className={`${fieldClassName} flex-1`}
            />
            <div className="relative w-28 shrink-0">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-orange-950/35">
                ₱
              </span>
              <Input
                value={row.price}
                onChange={(event) =>
                  updateRow(row.key, {
                    price: event.target.value.replace(/[^\d.]/g, ""),
                  })
                }
                inputMode="decimal"
                placeholder="0.00"
                aria-label={`Add-on ${index + 1} price`}
                className={`${fieldClassName} pl-7`}
              />
            </div>
            {/* Availability toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={row.isAvailable}
              aria-label={`${row.isAvailable ? "Disable" : "Enable"} add-on ${index + 1}`}
              onClick={() =>
                updateRow(row.key, { isAvailable: !row.isAvailable })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
                row.isAvailable ? "bg-emerald-500" : "bg-orange-950/15"
              }`}
            >
              <span
                className={`inline-block size-4.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  row.isAvailable ? "translate-x-6" : "translate-x-0.75"
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              aria-label={`Remove add-on ${index + 1}`}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-orange-950/35 transition-colors duration-200 hover:bg-red-50 hover:text-red-700"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))
      )}

      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-red-700 transition-colors duration-200 hover:bg-red-50"
      >
        <Plus className="size-3.5" aria-hidden="true" />
        Add add-on
      </button>
    </div>
  );
}

export function ProductForm({
  action,
  categories,
  product,
  submitLabel,
  dangerZone,
}: ProductFormProps) {
  const [preview, setPreview] = useState<string | null>(
    product?.imageUrl ?? null,
  );
  const [fileName, setFileName] = useState<string | null>(null);

  // Slug follows the name live until the user types their own slug; clearing
  // the slug field hands control back to auto-generation. Editing an existing
  // product starts hands-off so saved slugs never change silently.
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product?.slug));

  function handleNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) {
      setSlug(slugify(event.target.value));
    }
  }

  function handleSlugChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setSlug(value);
    setSlugEdited(value !== "");
  }

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
      className="grid gap-5 lg:grid-cols-[1fr_340px] lg:items-start animate-fade-in"
    >
      {/* ── Main column ── */}
      <div className="space-y-5">
        {/* Details */}
        <section className={`${cardClassName} space-y-4`}>
          <SectionLabel icon={Tag}>Product details</SectionLabel>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Product name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={product?.name}
                onChange={handleNameChange}
                required
                className={fieldClassName}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={slug ?? ""}
                onChange={handleSlugChange}
                placeholder="auto-generated from name"
                className={`${fieldClassName} font-mono text-xs`}
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
              <Label htmlFor="price">Price (₱)</Label>
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

        {/* Image */}
        <section className={`${cardClassName} space-y-4`}>
          <SectionLabel icon={ImageUp}>Image</SectionLabel>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            {/* Dropzone */}
            <label
              htmlFor="imageFile"
              className="group flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed border-orange-900/20 bg-orange-950/2 px-4 py-8 text-center transition-colors duration-200 hover:border-red-400/60 hover:bg-red-50/40"
            >
              <UploadCloud
                className="size-6 text-orange-950/30 transition-colors duration-200 group-hover:text-red-600"
                aria-hidden="true"
              />
              <span>
                <span className="block text-sm font-bold text-[#25130b]">
                  {fileName ?? "Click to upload"}
                </span>
                <span className="mt-0.5 block text-xs text-orange-950/40">
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
              <div className="relative aspect-square w-full overflow-hidden rounded-lg ring-1 ring-orange-900/10 sm:w-36">
                <Image
                  src={preview}
                  alt={fileName ?? product?.name ?? "Preview"}
                  fill
                  sizes="144px"
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

          <details className="group">
            <summary className="cursor-pointer list-none text-xs font-bold text-orange-950/40 transition-colors hover:text-red-700">
              Or paste an image URL
            </summary>
            <div className="mt-3 space-y-2">
              <Input
                id="imageUrl"
                name="imageUrl"
                type="text"
                defaultValue={product?.imageUrl ?? ""}
                placeholder="https://... or /assets/products/item.jpg"
                className={fieldClassName}
              />
              <p className="text-xs leading-5 text-orange-950/40">
                Uploading a file replaces this URL after save.
              </p>
            </div>
          </details>
        </section>

        {/* Add-ons — row editor; serializes to the same format the action parses */}
        <section className={`${cardClassName} space-y-4`}>
          <SectionLabel icon={Layers}>Add-ons</SectionLabel>
          <AddOnsEditor
            initial={
              product?.addOns.map((addOn, index) => ({
                key: index,
                name: addOn.name,
                price: Number(addOn.price).toFixed(2),
                isAvailable: addOn.isAvailable,
              })) ?? []
            }
          />
        </section>
      </div>

      {/* ── Sidebar ── */}
      <aside className="space-y-5">
        <div className={cardClassName}>
          <h2 className={cardTitleClassName}>Storefront</h2>
          <div className="mt-3 divide-y divide-orange-900/6">
            <ToggleRow
              name="isAvailable"
              label="Live on storefront"
              hint="Customers can see and order this"
              defaultChecked={product?.isAvailable ?? true}
            />
            <ToggleRow
              name="isFeatured"
              label="Featured"
              hint="Highlighted on the menu hero"
              defaultChecked={product?.isFeatured ?? false}
            />
          </div>
        </div>

        <div className={cardClassName}>
          <h2 className={cardTitleClassName}>Inventory</h2>
          <div className="mt-3">
            <ToggleRow
              name="trackStock"
              label="Track stock"
              hint="Auto sold-out at zero; restocks on cancel"
              defaultChecked={product?.trackStock ?? true}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-orange-900/6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="stockQuantity">Quantity</Label>
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
              <Label htmlFor="lowStockThreshold">Low-stock alert</Label>
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

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            className="h-11 rounded-full bg-red-600 text-sm font-bold text-white transition-colors duration-200 hover:bg-red-700 active:scale-[0.99]"
          >
            <Save className="size-4" aria-hidden="true" />
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            asChild
            className="h-11 rounded-full text-sm font-bold text-orange-950/50 transition-colors hover:bg-orange-950/5 hover:text-[#25130b]"
          >
            <Link href="/admin/menu">Cancel</Link>
          </Button>
        </div>

        {dangerZone}
      </aside>
    </form>
  );
}

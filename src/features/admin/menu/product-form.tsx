import Link from "next/link";
import Image from "next/image";
import { ImageUp, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
  return (
    <form
      action={action}
      className="grid gap-6 rounded-2xl border border-white bg-white/90 p-5 shadow-md shadow-stone-100/50 lg:grid-cols-[1fr_320px] animate-fade-in"
    >
      <section className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Product name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name}
              required
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              placeholder="auto-generated from name"
              className="bg-white"
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
            className="max-h-[152px] bg-white"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product?.categoryId ?? categories[0]?.id}
              className="h-8 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-sm outline-none focus:border-[#25130b]"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
              className="bg-white"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="text"
            defaultValue={product?.imageUrl ?? ""}
            placeholder="https://... or /assets/products/item.jpg"
            className="bg-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageFile">Upload image</Label>
          <div className="flex items-center gap-3 rounded-lg border border-dashed border-stone-300 bg-stone-50 p-3">
            <ImageUp className="size-5 text-stone-500" aria-hidden="true" />
            <Input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/*"
              className="block h-12 w-full text-sm text-stone-500 border-0 bg-transparent p-0 file:mr-4 file:h-full file:min-w-[140px] file:rounded-full file:border-0 file:bg-gradient-to-r file:from-red-600 file:to-red-700 file:px-6 file:py-2 file:text-sm file:font-semibold file:text-white file:cursor-pointer hover:file:from-red-700 hover:file:to-red-800 cursor-pointer"
            />
          </div>
          <p className="text-xs leading-5 text-stone-500">
            Optional. Uploading a file replaces the URL above after save. Max
            5MB.
          </p>
          {product?.imageUrl ? (
            <div className="relative aspect-[4/3] w-full max-w-sm overflow-hidden rounded-lg border border-stone-200">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(min-width: 640px) 384px, 100vw"
                unoptimized
                className="object-cover"
              />
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="addOns">Add-ons</Label>
          <Textarea
            id="addOns"
            name="addOns"
            defaultValue={addOnsToText(product)}
            placeholder="Extra Cheese | 20.00 | available"
            className="max-h-[228px] bg-white font-mono text-sm"
          />
          <p className="text-xs leading-5 text-stone-500">
            One add-on per line: name | price | available/unavailable.
          </p>
        </div>
      </section>

      <aside className="space-y-5">
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="font-black text-[#25130b]">Inventory</h2>
          <div className="mt-4 space-y-4">
            <label className="flex items-center gap-3 text-sm font-bold text-[#25130b]">
              <input
                type="checkbox"
                name="trackStock"
                defaultChecked={product?.trackStock ?? true}
                className="size-4 accent-[#25130b]"
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
                className="bg-white"
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
                className="bg-white"
              />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <h2 className="font-black text-[#25130b]">Storefront</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center gap-3 text-sm font-bold text-[#25130b]">
              <input
                type="checkbox"
                name="isAvailable"
                defaultChecked={product?.isAvailable ?? true}
                className="size-4 accent-[#25130b]"
              />
              Available to order
            </label>
            <label className="flex items-center gap-3 text-sm font-bold text-[#25130b]">
              <input
                type="checkbox"
                name="isFeatured"
                defaultChecked={product?.isFeatured ?? false}
                className="size-4 accent-[#25130b]"
              />
              Featured product
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="submit"
            className="h-10 bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-black"
          >
            <Save aria-hidden="true" />
            {submitLabel}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/menu">Cancel</Link>
          </Button>
        </div>
      </aside>
    </form>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireManagerPage } from "@/features/admin/auth/guards";
import { createProduct } from "@/features/admin/menu/actions";
import { ProductForm } from "@/features/admin/menu/product-form";
import { getAdminMenuCategories } from "@/features/admin/menu/queries";

export default async function NewProductPage() {
  await requireManagerPage();

  const categories = await getAdminMenuCategories();

  return (
    <div className="space-y-4">
      {/* Compact header — back link inline with the title */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/menu"
          aria-label="Back to Menu"
          className="group flex size-8 items-center justify-center rounded-full bg-white text-orange-950/50 ring-1 ring-orange-900/10 transition-colors hover:text-red-700"
        >
          <ArrowLeft
            className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wide text-red-700">
            Menu
          </p>
          <h1 className="text-xl font-black leading-tight text-[#25130b]">
            Add product
          </h1>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        action={createProduct}
        categories={categories}
        submitLabel="Create product"
      />
    </div>
  );
}

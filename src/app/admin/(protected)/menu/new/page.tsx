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
    <div className="space-y-5">
      {/* Back link */}
      <Link
        href="/admin/menu"
        className="group inline-flex items-center gap-1.5 text-xs font-bold text-orange-950/50 transition-colors hover:text-red-700"
      >
        <ArrowLeft
          className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
        Back to Menu
      </Link>

      {/* Header */}
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-red-700">
          Menu
        </p>
        <h1 className="mt-1 text-2xl font-black text-[#25130b]">Add product</h1>
        <p className="mt-1 text-sm text-orange-950/45">
          New products go live on the storefront as soon as they’re saved.
        </p>
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

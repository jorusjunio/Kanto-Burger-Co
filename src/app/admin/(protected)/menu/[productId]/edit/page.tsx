import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { requireManagerPage } from "@/features/admin/auth/guards";
import { updateProduct } from "@/features/admin/menu/actions";
import { ProductForm } from "@/features/admin/menu/product-form";
import {
  getAdminMenuCategories,
  getAdminMenuProduct,
} from "@/features/admin/menu/queries";

type EditProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  await requireManagerPage();

  const { productId } = await params;
  const [categories, product] = await Promise.all([
    getAdminMenuCategories(),
    getAdminMenuProduct(productId),
  ]);
  const updateProductWithId = updateProduct.bind(null, product.id);

  // Prisma Decimal values can't cross the server→client boundary, so serialize
  // prices to plain numbers before handing the product to the client form.
  const productForForm = {
    ...product,
    price: Number(product.price),
    addOns: product.addOns.map((addOn) => ({
      ...addOn,
      price: Number(addOn.price),
    })),
  };

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
            Edit product
            <span className="ml-2 text-sm font-bold text-orange-950/40">
              {product.name}
            </span>
          </h1>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        action={updateProductWithId}
        categories={categories}
        product={productForForm}
        submitLabel="Save changes"
      />
    </div>
  );
}

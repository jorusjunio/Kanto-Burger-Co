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
        <h1 className="mt-1 text-2xl font-black text-[#25130b]">
          Edit product
        </h1>
        <p className="mt-1 text-sm text-orange-950/45">{product.name}</p>
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

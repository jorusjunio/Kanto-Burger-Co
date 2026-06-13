import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { updateProduct } from "@/features/admin/menu/actions";
import { ProductForm } from "@/features/admin/menu/product-form";
import {
  getAdminMenuCategories,
  getAdminMenuProduct,
} from "@/features/admin/menu/queries";
import { getCurrentSession } from "@/server/auth/session";

type EditProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const session = await getCurrentSession();

  if (session?.user.role !== UserRole.ADMIN) {
    redirect("/admin/orders");
  }

  const { productId } = await params;
  const [categories, product] = await Promise.all([
    getAdminMenuCategories(),
    getAdminMenuProduct(productId),
  ]);
  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/admin/menu">
          <ArrowLeft aria-hidden="true" />
          Back to Menu
        </Link>
      </Button>

      {/* Header */}
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-red-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-black text-[#25130b]">
          Edit Product
        </h1>
        <p className="mt-2 text-stone-500">{product.name}</p>
      </div>

      {/* Form */}
      <ProductForm
        action={updateProductWithId}
        categories={categories}
        product={product}
        submitLabel="Save Changes"
      />
    </div>
  );
}

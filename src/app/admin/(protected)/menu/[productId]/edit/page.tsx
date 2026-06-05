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
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
          <Link href="/admin/menu">
            <ArrowLeft aria-hidden="true" />
            Back to Menu
          </Link>
        </Button>

        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-wide text-red-700">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-black text-zinc-950">
            Edit Product
          </h1>
          <p className="mt-2 text-zinc-600">{product.name}</p>
        </div>

        <ProductForm
          action={updateProductWithId}
          categories={categories}
          product={product}
          submitLabel="Save Changes"
        />
      </div>
    </main>
  );
}

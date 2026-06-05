import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { createProduct } from "@/features/admin/menu/actions";
import { ProductForm } from "@/features/admin/menu/product-form";
import { getAdminMenuCategories } from "@/features/admin/menu/queries";
import { getCurrentSession } from "@/server/auth/session";

export default async function NewProductPage() {
  const session = await getCurrentSession();

  if (session?.user.role !== UserRole.ADMIN) {
    redirect("/admin/orders");
  }

  const categories = await getAdminMenuCategories();

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
            Add Product
          </h1>
        </div>

        <ProductForm
          action={createProduct}
          categories={categories}
          submitLabel="Create Product"
        />
      </div>
    </main>
  );
}

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
          Add Product
        </h1>
      </div>

      {/* Form */}
      <ProductForm
        action={createProduct}
        categories={categories}
        submitLabel="Create Product"
      />
    </div>
  );
}

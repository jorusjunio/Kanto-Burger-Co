import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/enums";
import { CategoriesManager } from "@/features/admin/menu/categories-manager";
import { getAdminMenuCategoriesWithProductCounts } from "@/features/admin/menu/queries";
import { getCurrentSession } from "@/server/auth/session";

export default async function AdminCategoriesPage() {
  const session = await getCurrentSession();

  if (session?.user.role !== UserRole.ADMIN) {
    redirect("/kitchen");
  }

  const categories = await getAdminMenuCategoriesWithProductCounts();
  const rows = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder,
    productCount: category._count.products,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-black uppercase tracking-wide text-red-700">
          Admin
        </p>
        <h1 className="mt-1 text-2xl font-black text-[#25130b]">Categories</h1>
        <p className="mt-1 text-sm text-orange-950/45">
          Menu groups — the order here is the order customers see.
        </p>
      </div>

      <CategoriesManager categories={rows} />
    </div>
  );
}

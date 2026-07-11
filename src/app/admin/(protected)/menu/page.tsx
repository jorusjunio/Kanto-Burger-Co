import Link from "next/link";

import { requireManagerPage } from "@/features/admin/auth/guards";
import { CategoriesManager } from "@/features/admin/menu/categories-manager";
import { MenuView } from "@/features/admin/menu/menu-view";
import {
  getAdminMenuCategoriesWithProductCounts,
  getAdminMenuProducts,
} from "@/features/admin/menu/queries";
import { cn } from "@/lib/utils";

type AdminMenuPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

/* URL-driven view switcher so both views are shareable/bookmarkable. */
function MenuTabs({ active }: { active: "products" | "categories" }) {
  const tabs = [
    ["products", "Products", "/admin/menu"],
    ["categories", "Categories", "/admin/menu?tab=categories"],
  ] as const;

  return (
    <div className="flex w-fit items-center gap-0.5 rounded-full bg-orange-950/[0.05] p-1">
      {tabs.map(([key, label, href]) => (
        <Link
          key={key}
          href={href}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-bold transition-colors duration-200",
            active === key
              ? "bg-white text-[#25130b] shadow-sm"
              : "text-orange-950/45 hover:text-[#25130b]",
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export default async function AdminMenuPage({
  searchParams,
}: AdminMenuPageProps) {
  await requireManagerPage();

  const { tab } = await searchParams;

  if (tab === "categories") {
    const categories = await getAdminMenuCategoriesWithProductCounts();
    const rows = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      sortOrder: category.sortOrder,
      productCount: category._count.products,
    }));

    return (
      <div className="space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-red-700">
            Admin
          </p>
          <h1 className="mt-1 text-2xl font-black text-[#25130b]">Menu</h1>
          <p className="mt-1 text-sm text-orange-950/45">
            Menu groups — the order here is the order customers see.
          </p>
        </div>

        <MenuTabs active="categories" />

        <CategoriesManager categories={rows} />
      </div>
    );
  }

  const products = await getAdminMenuProducts();
  const rows = products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    imageUrl: product.imageUrl,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    isFeatured: product.isFeatured,
    isAvailable: product.isAvailable,
    trackStock: product.trackStock,
    stockQuantity: product.stockQuantity,
    lowStockThreshold: product.lowStockThreshold,
    addOnsCount: product.addOns.length,
  }));

  return <MenuView products={rows} tabs={<MenuTabs active="products" />} />;
}

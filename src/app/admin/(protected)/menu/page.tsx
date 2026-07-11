import { requireManagerPage } from "@/features/admin/auth/guards";
import { MenuView } from "@/features/admin/menu/menu-view";
import { getAdminMenuProducts } from "@/features/admin/menu/queries";

export default async function AdminMenuPage() {
  await requireManagerPage();

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

  return <MenuView products={rows} />;
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { Edit, Plus, Utensils } from "lucide-react";

import { UserRole } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toggleProductAvailability } from "@/features/admin/menu/actions";
import { getAdminMenuProducts } from "@/features/admin/menu/queries";
import { formatPeso } from "@/lib/format";
import { getCurrentSession } from "@/server/auth/session";

function stockLabel(product: {
  trackStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
}) {
  if (!product.trackStock) {
    return "Not tracked";
  }

  if (product.stockQuantity <= 0) {
    return "Sold out";
  }

  if (product.stockQuantity <= product.lowStockThreshold) {
    return `${product.stockQuantity} left`;
  }

  return `${product.stockQuantity} in stock`;
}

export default async function AdminMenuPage() {
  const session = await getCurrentSession();

  if (session?.user.role !== UserRole.ADMIN) {
    redirect("/admin/orders");
  }

  const products = await getAdminMenuProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-red-700">
            Admin
          </p>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-black text-[#25130b]">Menu</h1>
            {products.length > 0 ? (
              <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
                {products.length}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-stone-500">
            Manage products, availability, add-ons, and stock levels.
          </p>
        </div>
        <Button asChild className="group bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30">
          <Link href="/admin/menu/new">
            <Plus aria-hidden="true" className="transition-transform duration-300 group-hover:rotate-90" />
            Add Product
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-white bg-white/90 p-8 text-center shadow-md shadow-stone-100/50 animate-fade-in">
          <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-zinc-950 text-amber-300">
            <Utensils aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-[#25130b]">
            No products yet
          </h2>
          <p className="mt-2 max-w-md text-stone-500">
            Add menu products so customers can start ordering.
          </p>
          <Button asChild className="mt-5">
            <Link href="/admin/menu/new">Add Product</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white bg-white/90 shadow-md shadow-stone-100/50 animate-fade-in">
          <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Add-ons</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-[#25130b]">
                          {product.name}
                        </p>
                        {product.isFeatured ? (
                          <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">
                            Featured
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs text-stone-500">
                        {product.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell className="font-black">
                    {formatPeso(Number(product.price))}
                  </TableCell>
                  <TableCell>{stockLabel(product)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        product.isAvailable
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-red-200 bg-red-50 text-red-700"
                      }
                    >
                      {product.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.addOns.length}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <form action={toggleProductAvailability}>
                        <input
                          type="hidden"
                          name="productId"
                          value={product.id}
                        />
                        <input
                          type="hidden"
                          name="isAvailable"
                          value={product.isAvailable ? "false" : "true"}
                        />
                        <Button
                          type="submit"
                          size="sm"
                          variant="outline"
                          className="transition-all duration-300 hover:-translate-y-0.5 hover:border-red-300 hover:text-red-700"
                        >
                          {product.isAvailable ? "Hide" : "Show"}
                        </Button>
                      </form>
                      <Button
                        size="sm"
                        asChild
                        className="group bg-gradient-to-r from-red-600 to-red-700 text-white transition-all duration-300 hover:from-red-700 hover:to-red-800 hover:shadow-md hover:shadow-red-600/30"
                      >
                        <Link href={`/admin/menu/${product.id}/edit`}>
                          <Edit
                            aria-hidden="true"
                            className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
                          />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

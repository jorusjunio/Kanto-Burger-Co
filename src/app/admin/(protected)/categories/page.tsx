import { redirect } from "next/navigation";
import { Plus, Save, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRole } from "@/generated/prisma/enums";
import {
  createCategory,
  updateCategory,
} from "@/features/admin/menu/actions";
import { getAdminMenuCategoriesWithProductCounts } from "@/features/admin/menu/queries";
import { getCurrentSession } from "@/server/auth/session";

export default async function AdminCategoriesPage() {
  const session = await getCurrentSession();

  if (session?.user.role !== UserRole.ADMIN) {
    redirect("/admin/orders");
  }

  const categories = await getAdminMenuCategoriesWithProductCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-black uppercase tracking-wide text-red-700">
          Admin
        </p>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-3xl font-black text-[#25130b]">Categories</h1>
          {categories.length > 0 ? (
            <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700">
              {categories.length}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-stone-500">
          Manage menu groups and their storefront ordering.
        </p>
      </div>

      {/* Add Category Form */}
      <form
        action={createCategory}
        className="grid gap-4 rounded-2xl border border-orange-900/10 bg-white p-5 shadow-[0_10px_30px_-12px_rgba(120,53,15,0.18)] md:grid-cols-[1fr_1fr_160px_auto] md:items-end animate-fade-in"
      >
        <div className="space-y-2">
          <Label htmlFor="new-name">Name</Label>
          <Input
            id="new-name"
            name="name"
            placeholder="Burgers"
            required
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-slug">Slug</Label>
          <Input
            id="new-slug"
            name="slug"
            placeholder="auto-generated"
            className="bg-white"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-sortOrder">Sort order</Label>
          <Input
            id="new-sortOrder"
            name="sortOrder"
            type="number"
            min="0"
            defaultValue={0}
            required
            className="bg-white"
          />
        </div>
        <Button type="submit" className="group bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 font-black transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98]">
          <Plus aria-hidden="true" className="transition-transform duration-300 group-hover:rotate-90" />
          Add
        </Button>
      </form>

      {categories.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-orange-900/10 bg-white p-8 text-center shadow-[0_10px_30px_-12px_rgba(120,53,15,0.18)] animate-fade-in">
          <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-zinc-950 text-amber-300">
            <Tags aria-hidden="true" />
          </div>
          <h2 className="text-xl font-black text-[#25130b]">
            No categories yet
          </h2>
          <p className="mt-2 max-w-md text-stone-500">
            Add categories before creating products.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-orange-900/10 bg-white shadow-[0_10px_30px_-12px_rgba(120,53,15,0.18)] animate-fade-in">
          <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <form
                      id={`category-${category.id}`}
                      action={updateCategory.bind(null, category.id)}
                      className="min-w-44"
                    >
                      <Input
                        name="name"
                        defaultValue={category.name}
                        required
                        className="bg-white font-bold"
                      />
                    </form>
                  </TableCell>
                  <TableCell>
                    <Input
                      form={`category-${category.id}`}
                      name="slug"
                      defaultValue={category.slug}
                      required
                      className="min-w-44 bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      form={`category-${category.id}`}
                      name="sortOrder"
                      type="number"
                      min="0"
                      defaultValue={category.sortOrder}
                      required
                      className="w-24 bg-white"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {category._count.products} products
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      form={`category-${category.id}`}
                      type="submit"
                      size="sm"
                      className="group bg-gradient-to-r from-red-600 to-red-700 text-white transition-all duration-300 hover:from-red-700 hover:to-red-800 hover:shadow-md hover:shadow-red-600/30"
                    >
                      <Save
                        aria-hidden="true"
                        className="transition-transform duration-300 group-hover:scale-110"
                      />
                      Save
                    </Button>
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

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
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-wide text-red-700">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-black text-zinc-950">
            Categories
          </h1>
          <p className="mt-2 text-zinc-600">
            Manage menu groups and their storefront ordering.
          </p>
        </div>

        <form
          action={createCategory}
          className="mb-6 grid gap-4 rounded-lg border border-zinc-200 bg-white p-5 md:grid-cols-[1fr_1fr_160px_auto] md:items-end"
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
          <Button type="submit" className="bg-zinc-950 text-white hover:bg-zinc-800">
            <Plus aria-hidden="true" />
            Add
          </Button>
        </form>

        {categories.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white p-8 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-zinc-950 text-amber-300">
              <Tags aria-hidden="true" />
            </div>
            <h2 className="text-xl font-black text-zinc-950">
              No categories yet
            </h2>
            <p className="mt-2 max-w-md text-zinc-600">
              Add categories before creating products.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
            <Table>
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
                      >
                        <Save aria-hidden="true" />
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
    </main>
  );
}

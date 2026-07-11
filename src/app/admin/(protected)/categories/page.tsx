import { redirect } from "next/navigation";

/**
 * Categories now live under the Menu page (Products | Categories tabs).
 * Keep the old URL working for bookmarks and muscle memory.
 */
export default function AdminCategoriesPage() {
  redirect("/admin/menu?tab=categories");
}

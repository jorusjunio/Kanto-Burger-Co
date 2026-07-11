import { redirect } from "next/navigation";

/**
 * Reports has been folded into the dashboard (range/metric filters cover the
 * same questions). Keep the old URL working for bookmarks.
 */
export default function AdminReportsPage() {
  redirect("/admin");
}

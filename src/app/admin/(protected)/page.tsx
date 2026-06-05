import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/enums";
import { getCurrentSession } from "@/server/auth/session";

export default async function AdminPage() {
  const session = await getCurrentSession();

  redirect(session?.user.role === UserRole.ADMIN ? "/admin/reports" : "/admin/orders");
}

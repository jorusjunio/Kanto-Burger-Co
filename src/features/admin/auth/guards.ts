import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/enums";
import { getCurrentSession } from "@/server/auth/session";

/**
 * Page-level access guards (they redirect — unlike the throwing session helpers
 * in server/auth used by server actions).
 */

/** Any signed-in staff or admin. Sends anonymous visitors to the login page.
    Pass `callbackUrl` so they land back where they were headed after login
    (e.g. the kitchen board) instead of round-tripping through /admin. */
export async function requireStaffPage(callbackUrl?: string) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect(
      callbackUrl
        ? `/admin/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
        : "/admin/login",
    );
  }

  return session;
}

/**
 * Managers (ADMIN) only — records, reports, menu, categories. Kitchen crew
 * (STAFF) are bounced to the live board, which is the only page they own.
 */
export async function requireManagerPage() {
  const session = await requireStaffPage();

  if (session.user.role !== UserRole.ADMIN) {
    redirect("/kitchen");
  }

  return session;
}

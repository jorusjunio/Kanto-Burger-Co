import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/enums";
import { LoginForm } from "@/features/admin/auth/login-form";
import { getCurrentSession } from "@/server/auth/session";

export default async function AdminLoginPage() {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect(
      session.user.role === UserRole.ADMIN ? "/admin/reports" : "/admin/orders",
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-10 sm:px-6">
        <LoginForm />
      </div>
    </main>
  );
}

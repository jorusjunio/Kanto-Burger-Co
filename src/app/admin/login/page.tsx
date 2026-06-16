import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/enums";
import { LoginForm } from "@/features/admin/auth/login-form";
import { isGoogleAuthEnabled } from "@/server/auth/config";
import { getCurrentSession } from "@/server/auth/session";

export default async function AdminLoginPage() {
  const session = await getCurrentSession();

  if (session?.user) {
    redirect(
      session.user.role === UserRole.ADMIN ? "/admin/reports" : "/admin/orders",
    );
  }

  return (
    <main className="fixed inset-0 min-h-screen bg-gradient-to-br from-stone-50 via-orange-50/30 to-amber-50/50 animate-gradient-xy overflow-hidden">
      {/* Ambient Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-red-500/10 blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/4 size-96 rounded-full bg-amber-500/10 blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 rounded-full bg-orange-500/5 blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />

      {/* Centered Login Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <LoginForm googleEnabled={isGoogleAuthEnabled} />
      </div>
    </main>
  );
}

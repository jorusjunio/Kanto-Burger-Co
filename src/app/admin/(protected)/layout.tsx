import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/enums";
import { RealtimeOrderListener } from "@/features/orders/realtime-order-listener";
import { getCurrentSession } from "@/server/auth/session";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const isAdmin = session.user.role === UserRole.ADMIN;

  return (
    <>
      <RealtimeOrderListener
        channelName="admin-orders"
        events={["order-created", "order-updated"]}
      />
      <div className="min-h-screen bg-gradient-to-br from-orange-50/30 to-white">
        <div className="flex">
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>
          <main className="flex-1 lg:pl-72">
            <div className="w-full px-4 py-6 lg:px-8 lg:py-8">
              {/* Header */}
              <div className="mb-8 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight text-[#25130b] lg:text-3xl">
                    {isAdmin ? "Admin Dashboard" : "Staff Workspace"}
                  </h1>
                  <p className="text-sm font-medium text-orange-950/40">
                    {session.user.email} · {session.user.role ?? "STAFF"}
                  </p>
                </div>
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}


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
      <div className="flex min-h-screen bg-[#f7f3ea]">
        {/* Sidebar owns its own desktop (fixed) + mobile (drawer) positioning */}
        <AdminSidebar isManager={isAdmin} />

        {/* Main body — pl-64 on desktop so the fixed sidebar doesn't overlap */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* MAIN VIEW CONTENT CONTAINER */}
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-7 w-full">
            {/* Slim workspace bar */}
            <div className="mb-6 flex items-center justify-between gap-3 pl-14 lg:pl-0">
              <p className="min-w-0 truncate text-xs font-medium text-orange-950/45">
                {session.user.email}
              </p>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  isAdmin
                    ? "bg-red-700/8 text-red-700"
                    : "bg-amber-600/10 text-amber-700"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${isAdmin ? "bg-red-600" : "bg-amber-500"}`}
                />
                {session.user.role ?? "STAFF"}
              </span>
            </div>
            {children}
          </main>
        </div>
      </div>
    </>
  );
}


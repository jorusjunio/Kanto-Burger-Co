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
      <div className="flex min-h-screen bg-stone-50/70">
        {/* Sidebar owns its own desktop (fixed) + mobile (drawer) positioning */}
        <AdminSidebar />

        {/* Main body — pl-72 on desktop so the fixed sidebar doesn't overlap */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
          {/* MAIN VIEW CONTENT CONTAINER */}
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 w-full">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-3 pl-14 sm:flex-row sm:items-center sm:justify-between sm:pl-0 lg:pl-0">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight text-[#25130b] lg:text-3xl">
                  {isAdmin ? "Admin Dashboard" : "Staff Workspace"}
                </h1>
                <p className="text-sm font-medium text-orange-950/40">
                  {session.user.email}
                </p>
              </div>
              <span
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider shadow-sm ${
                  isAdmin
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
              >
                <span
                  className={`size-2 rounded-full ${isAdmin ? "bg-red-600" : "bg-amber-500"} animate-pulse`}
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


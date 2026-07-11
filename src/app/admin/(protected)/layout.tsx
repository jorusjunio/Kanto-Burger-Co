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
        {/* Sidebar owns its own desktop (fixed) + mobile (drawer) positioning.
            Who's signed in lives in the sidebar account row, not on every page. */}
        <AdminSidebar
          isManager={isAdmin}
          user={{
            name: session.user.name ?? null,
            email: session.user.email ?? null,
            image: session.user.image ?? null,
            role: session.user.role ?? "STAFF",
          }}
        />

        {/* Main body — pl-64 on desktop so the fixed sidebar doesn't overlap */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          {/* MAIN VIEW CONTENT CONTAINER */}
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-7 w-full">
            {/* Mobile-only spacer so page headers clear the fixed hamburger */}
            <div className="h-10 lg:hidden" />
            {children}
          </main>
        </div>
      </div>
    </>
  );
}


import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { UserRole } from "@/generated/prisma/enums";
import { RealtimeOrderListener } from "@/features/orders/realtime-order-listener";
import { SignOutButton } from "@/features/admin/auth/sign-out-button";
import { requireStaffPage } from "@/features/admin/auth/guards";

export default async function KitchenLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireStaffPage();
  const isManager = session.user.role === UserRole.ADMIN;

  return (
    <>
      {/* Live board — refresh the page whenever an order is created or changes */}
      <RealtimeOrderListener
        channelName="admin-orders"
        events={["order-created", "order-updated"]}
      />
      <div className="flex min-h-screen flex-col bg-[#f7f3ea]">
        {/* Slim top bar — no admin sidebar, just enough chrome for the crew */}
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-orange-900/10 bg-[#f7f3ea]/85 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-red-600 text-xs font-black text-white">
              K
            </span>
            <span className="text-sm font-black uppercase tracking-tight text-[#25130b]">
              Kanto Kitchen
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isManager ? (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-orange-950/60 transition-colors hover:bg-orange-950/5 hover:text-red-700"
              >
                <LayoutDashboard className="size-3.5" aria-hidden="true" />
                Admin
              </Link>
            ) : null}
            <SignOutButton className="border-orange-900/15 bg-white text-orange-950/70 hover:border-red-300 hover:bg-red-50 hover:text-red-700" />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </>
  );
}

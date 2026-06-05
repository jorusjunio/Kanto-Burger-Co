import Link from "next/link";
import { redirect } from "next/navigation";

import { UserRole } from "@/generated/prisma/enums";
import { SignOutButton } from "@/features/admin/auth/sign-out-button";
import { RealtimeOrderListener } from "@/features/orders/realtime-order-listener";
import { getCurrentSession } from "@/server/auth/session";

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
      <div className="border-b border-zinc-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-3 text-sm sm:flex-row sm:items-center sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <div>
              <p className="text-base font-black text-zinc-950">
                Admin Workspace
              </p>
              <p className="text-xs font-medium text-zinc-500">
                {session.user.email} - {session.user.role ?? "STAFF"}
              </p>
            </div>
            <nav className="flex flex-wrap gap-2">
              {isAdmin ? (
                <Link
                  href="/admin/reports"
                  className="rounded-lg border border-transparent px-3 py-2 font-bold text-zinc-700 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950"
                >
                  Reports
                </Link>
              ) : null}
              <Link
                href="/admin/orders"
                className="rounded-lg border border-transparent px-3 py-2 font-bold text-zinc-700 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950"
              >
                Orders
              </Link>
              {isAdmin ? (
                <>
                  <Link
                    href="/admin/menu"
                    className="rounded-lg border border-transparent px-3 py-2 font-bold text-zinc-700 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950"
                  >
                    Menu
                  </Link>
                  <Link
                    href="/admin/categories"
                    className="rounded-lg border border-transparent px-3 py-2 font-bold text-zinc-700 hover:border-zinc-200 hover:bg-zinc-50 hover:text-zinc-950"
                  >
                    Categories
                  </Link>
                </>
              ) : null}
            </nav>
          </div>
          <div className="self-start sm:self-auto">
            <SignOutButton />
          </div>
        </div>
      </div>
      <RealtimeOrderListener
        channelName="admin-orders"
        events={["order-created", "order-updated"]}
      />
      {children}
    </>
  );
}


"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Clock,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  Smartphone,
  Users,
  Utensils,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/features/admin/auth/sign-out-button";

export type SidebarUser = {
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
};

export type SidebarAlerts = {
  pendingOrders: number;
  paymentsToVerify: number;
  lowStock: number;
};

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, managerOnly: true },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart, managerOnly: true },
  { label: "Menu", href: "/admin/menu", icon: Utensils, managerOnly: true },
  { label: "Staff", href: "/admin/staff", icon: Users, managerOnly: true },
  { label: "Settings", href: "/admin/settings", icon: Settings, managerOnly: true },
];

/* One alert row: quiet link with a colored count chip. */
function AlertRow({
  href,
  label,
  count,
  Icon,
  tone,
  onNavigate,
}: {
  href: string;
  label: string;
  count: number;
  Icon: typeof Clock;
  tone: "red" | "sky" | "amber";
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-white/5"
    >
      <Icon
        className={cn(
          "size-4 shrink-0",
          tone === "red" && "text-red-400",
          tone === "sky" && "text-sky-400",
          tone === "amber" && "text-amber-400",
        )}
        aria-hidden="true"
      />
      <span className="flex-1 text-xs font-bold text-stone-300 transition-colors group-hover:text-white">
        {label}
      </span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums",
          tone === "red" && "bg-red-500/15 text-red-400",
          tone === "sky" && "bg-sky-500/15 text-sky-400",
          tone === "amber" && "bg-amber-500/15 text-amber-400",
        )}
      >
        {count}
      </span>
    </Link>
  );
}

function SidebarAlertsBlock({
  alerts,
  onNavigate,
}: {
  alerts: SidebarAlerts;
  onNavigate?: () => void;
}) {
  const total =
    alerts.pendingOrders + alerts.paymentsToVerify + alerts.lowStock;

  return (
    <div className="border-t border-white/8 px-3 py-4">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-stone-500">
        Needs attention
      </p>
      {total === 0 ? (
        <p className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-500">
          <Check className="size-4 text-emerald-500" aria-hidden="true" />
          All clear
        </p>
      ) : (
        <div className="space-y-0.5">
          {alerts.pendingOrders > 0 ? (
            <AlertRow
              href="/kitchen"
              label={`New order${alerts.pendingOrders !== 1 ? "s" : ""} waiting`}
              count={alerts.pendingOrders}
              Icon={Clock}
              tone="red"
              onNavigate={onNavigate}
            />
          ) : null}
          {alerts.paymentsToVerify > 0 ? (
            <AlertRow
              href="/admin/orders"
              label="GCash to verify"
              count={alerts.paymentsToVerify}
              Icon={Smartphone}
              tone="sky"
              onNavigate={onNavigate}
            />
          ) : null}
          {alerts.lowStock > 0 ? (
            <AlertRow
              href="/admin/menu"
              label="Low on stock"
              count={alerts.lowStock}
              Icon={AlertTriangle}
              tone="amber"
              onNavigate={onNavigate}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function isItemActive(href: string, pathname: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");
}

function SidebarBody({
  isManager,
  user,
  alerts,
  onNavigate,
}: {
  isManager: boolean;
  user: SidebarUser;
  alerts: SidebarAlerts;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const visibleNavItems = navItems.filter(
    (item) => isManager || !item.managerOnly,
  );

  return (
    <div className="flex h-full flex-col bg-stone-950">
      {/* Brand header */}
      <div className="flex items-center justify-between px-5 py-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-white shadow-sm">
            <Image
              src="/assets/brand/J logo without bg.png"
              alt=""
              width={18}
              height={18}
              className="object-contain"
              priority
            />
          </span>
          <h1 className="text-sm font-black uppercase tracking-tight text-white">
            Kanto Admin
          </h1>
        </div>
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="flex size-8 items-center justify-center rounded-full text-stone-400 transition-colors duration-200 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 border-t border-white/8 px-3 py-5">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-stone-500">
          Menu
        </p>
        {visibleNavItems.map((item) => {
          const isActive = isItemActive(item.href, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-colors duration-200",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-stone-400 hover:bg-white/5 hover:text-white",
              )}
            >
              {/* Active rail */}
              <span
                className={cn(
                  "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-amber-400 transition-opacity duration-200",
                  isActive ? "opacity-100" : "opacity-0",
                )}
              />
              <Icon
                className={cn(
                  "size-[18px] transition-colors duration-200",
                  isActive
                    ? "text-amber-400"
                    : "text-stone-500 group-hover:text-stone-300",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Live operational alerts — what needs a manager's hand right now. */}
      <SidebarAlertsBlock alerts={alerts} onNavigate={onNavigate} />

      {/* Account + sign out — single quiet row; who's signed in lives here,
          not in every page header. */}
      <div className="border-t border-white/8 px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="relative shrink-0">
            {user.image ? (
              /* Plain <img>: OAuth avatars come from arbitrary hosts not in
                 next/image remotePatterns. */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt=""
                referrerPolicy="no-referrer"
                className="size-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-9 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white">
                {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
              </span>
            )}
            {/* Role dot — red = admin, amber = staff */}
            <span
              title={user.role}
              className={cn(
                "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-stone-950",
                user.role === "ADMIN" ? "bg-red-500" : "bg-amber-400",
              )}
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">
              {user.name ?? "Staff"}
            </p>
            <p className="truncate text-[10px] font-medium text-stone-500">
              {user.email}
            </p>
          </div>
          <SignOutButton iconOnly />
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({
  isManager,
  user,
  alerts,
}: {
  isManager: boolean;
  user: SidebarUser;
  alerts: SidebarAlerts;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar (fixed) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 lg:block">
        <SidebarBody isManager={isManager} user={user} alerts={alerts} />
      </aside>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-50 flex size-10 items-center justify-center rounded-full bg-stone-950 text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 shadow-2xl transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarBody
          isManager={isManager}
          user={user}
          alerts={alerts}
          onNavigate={() => setIsOpen(false)}
        />
      </aside>
    </>
  );
}

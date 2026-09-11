"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
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
    <div className="shrink-0 px-3 py-4">
      <div className="rounded-xl bg-white/[0.04] p-3 ring-1 ring-white/5">
        <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-stone-500">
          Needs attention
        </p>
        {total === 0 ? (
          <p className="flex items-center gap-2 px-1 py-1.5 text-xs font-bold text-stone-500">
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
    <div className="flex h-full min-h-0 flex-col bg-stone-950">
      {/* Brand header */}
      <div className="shrink-0 flex items-center justify-between px-5 py-6">
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

      {/* Navigation: the only part that scrolls, so the brand header above
          and the alerts/account rows below always stay on screen even on
          short mobile viewports. */}
      <nav className="min-h-0 flex-1 overflow-y-auto space-y-0.5 border-t border-white/8 px-3 py-5">
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

      {/* Live operational alerts: what needs a manager's hand right now. */}
      <SidebarAlertsBlock alerts={alerts} onNavigate={onNavigate} />

      {/* Account + sign out: single quiet row; who's signed in lives here,
          not in every page header. */}
      <div className="shrink-0 border-t border-white/8 px-4 py-4">
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
            {/* Role dot: red = admin, amber = staff */}
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
  isAcceptingOrders,
}: {
  isManager: boolean;
  user: SidebarUser;
  alerts: SidebarAlerts;
  isAcceptingOrders: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const alertTotal =
    alerts.pendingOrders + alerts.paymentsToVerify + alerts.lowStock;

  // Top bar collapses a little once the page scrolls past a small
  // threshold, a subtle "settled" state, not a hide/show toggle.
  const [collapsed, setCollapsed] = useState(false);
  const tickingRef = useRef(false);

  useEffect(() => {
    const THRESHOLD = 24;

    function handleScroll() {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        setCollapsed(window.scrollY > THRESHOLD);
        tickingRef.current = false;
      });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Desktop sidebar (fixed) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 lg:block">
        <SidebarBody isManager={isManager} user={user} alerts={alerts} />
      </aside>

      {/* Solid full-bleed curtain behind the floating bar below. The bar has
          side margins (inset-x-3/10) so it doesn't span edge-to-edge; without
          this, content scrolling upward peeks out beside the bar and gets cut
          off mid-shape right where the bar's edge is, instead of disappearing
          cleanly. This curtain matches the page background and covers the
          bar's full vertical footprint edge-to-edge so nothing peeks through. */}
      <div
        className="fixed inset-x-0 top-0 z-20 h-20 bg-[#f7f3ea] lg:hidden"
        aria-hidden="true"
      />

      {/* Mobile/tablet: a floating top nav bar (not the desktop sidebar's
          replacement, just the drawer trigger + brand context, since the
          real sidebar only exists at lg+). Side margins make it read as a
          compact, self-contained bar instead of an edge-to-edge strip with
          an awkward empty middle. Stays put while content scrolls underneath
          it; layout.tsx reserves matching top clearance on <main>. */}
      <div
        className={cn(
          "fixed top-3 z-30 flex h-14 items-center gap-3 rounded-xl bg-[#f7f3ea] px-4 shadow-[0_2px_10px_rgba(0,0,0,0.08)] ring-1 ring-orange-900/8 transition-[left,right] duration-300 ease-out lg:hidden",
          collapsed ? "inset-x-10" : "inset-x-3",
        )}
      >
        {/* Left cluster */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setNotifOpen(false);
              setIsOpen(true);
            }}
            aria-label="Open navigation menu"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0c0a09] outline-none transition-transform duration-150 active:scale-95 focus-visible:bg-red-800"
          >
            <Menu className="size-4 text-white" aria-hidden="true" />
          </button>
          <span className="h-5 w-px shrink-0 bg-orange-900/15" aria-hidden="true" />
          <span className="text-xs font-black uppercase tracking-wide text-red-700">
            Admin
          </span>
        </div>

        {/* Middle: read-only store status, sourced from the same
            isAcceptingOrders toggle as the Settings page, otherwise this
            is buried there and no one glances at it. */}
        <div className="flex flex-1 items-center justify-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-950/50">
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full",
                isAcceptingOrders ? "bg-emerald-500" : "bg-red-500",
              )}
              aria-hidden="true"
            />
            Store {isAcceptingOrders ? "open" : "closed"}
          </span>
        </div>

        {/* Notification bell: the same "Needs attention" alerts the desktop
            sidebar nav shows, surfaced here since mobile/tablet has no nav
            rail to put them in. */}
        <button
          type="button"
          onClick={() => setNotifOpen((current) => !current)}
          aria-label="Notifications"
          aria-expanded={notifOpen}
          className={cn(
            "relative flex size-10 shrink-0 items-center justify-center rounded-full outline-none transition-all duration-200 ease-out active:scale-90 focus-visible:bg-orange-950/10",
            notifOpen
              ? "bg-orange-950/10 text-orange-950"
              : "text-orange-950/60 hover:bg-orange-950/5 hover:text-orange-950",
          )}
        >
          <Bell
            className={cn(
              "size-[18px] transition-transform duration-200 ease-out",
              notifOpen && "rotate-12",
            )}
            aria-hidden="true"
          />
          {alertTotal > 0 ? (
            <span className="absolute right-2 top-2 size-2 rounded-full bg-red-600 ring-2 ring-[#f7f3ea]" />
          ) : null}
        </button>
      </div>

      {/* Notification panel + its own click-outside backdrop. Always
          mounted (not conditionally rendered) so opening/closing animates
          via opacity + scale instead of popping in/out instantly. */}
      <div
        className={cn(
          "fixed inset-0 z-30 transition-opacity duration-200 lg:hidden",
          notifOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setNotifOpen(false)}
      />
      <div
        className={cn(
          "fixed right-3 top-20 z-40 w-72 max-w-[calc(100vw-1.5rem)] origin-top-right overflow-hidden rounded-xl bg-stone-950 shadow-2xl ring-1 ring-black/20 transition-all duration-200 ease-out lg:hidden",
          notifOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0",
        )}
      >
        <SidebarAlertsBlock
          alerts={alerts}
          onNavigate={() => setNotifOpen(false)}
        />
      </div>

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
          "fixed left-0 top-0 z-50 h-dvh w-64 shadow-2xl transition-transform duration-300 lg:hidden",
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

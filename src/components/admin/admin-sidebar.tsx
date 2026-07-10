"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Folder,
  Menu,
  X,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/features/admin/auth/sign-out-button";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, managerOnly: true },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart, managerOnly: true },
  { label: "Menu", href: "/admin/menu", icon: Utensils, managerOnly: true },
  { label: "Categories", href: "/admin/categories", icon: Folder, managerOnly: true },
];

function isItemActive(href: string, pathname: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");
}

function SidebarBody({
  isManager,
  onNavigate,
}: {
  isManager: boolean;
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

      {/* Account + sign out */}
      <div className="border-t border-white/8 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
            <User className="size-3.5 text-stone-300" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-white">
              Admin Account
            </p>
            <p className="text-[10px] font-medium text-stone-500">
              Staff workspace
            </p>
          </div>
        </div>
        <div className="mt-3">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar({ isManager }: { isManager: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar (fixed) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 lg:block">
        <SidebarBody isManager={isManager} />
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
        <SidebarBody isManager={isManager} onNavigate={() => setIsOpen(false)} />
      </aside>
    </>
  );
}

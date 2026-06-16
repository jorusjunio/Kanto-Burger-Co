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
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Menu", href: "/admin/menu", icon: Utensils },
  { label: "Categories", href: "/admin/categories", icon: Folder },
];

function isItemActive(href: string, pathname: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-zinc-950">
      {/* Brand header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-amber-500 shadow-lg shadow-red-600/30">
            <Image
              src="/assets/brand/J logo without bg.png"
              alt=""
              width={22}
              height={22}
              className="object-contain brightness-0 invert"
              priority
            />
          </div>
          <div>
            <h1 className="text-base font-black uppercase tracking-tight text-white">
              Kanto Admin
            </h1>
            <p className="text-[11px] font-semibold text-zinc-400">
              Control center
            </p>
          </div>
        </div>
        {onNavigate ? (
          <button
            type="button"
            onClick={onNavigate}
            aria-label="Close navigation"
            className="flex size-8 items-center justify-center rounded-lg bg-white/10 text-white transition-colors duration-200 hover:bg-white/20 lg:hidden"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-3.5 py-6">
        <p className="mb-2 px-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = isItemActive(item.href, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-sm font-black transition-all duration-300",
                isActive ? "text-white" : "text-zinc-400 hover:text-white",
              )}
            >
              {/* Active gradient backdrop */}
              <span
                className={cn(
                  "absolute inset-0 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 shadow-lg shadow-red-600/30 transition-opacity duration-300",
                  isActive ? "opacity-100" : "opacity-0",
                )}
              />
              {/* Hover backdrop (inactive) */}
              {!isActive ? (
                <span className="absolute inset-0 rounded-xl bg-white/0 transition-colors duration-300 group-hover:bg-white/10" />
              ) : null}
              {/* Left rail */}
              <span
                className={cn(
                  "absolute left-0 top-1/2 w-1 -translate-y-1/2 rounded-r-full bg-white transition-all duration-300",
                  isActive
                    ? "h-7 opacity-100"
                    : "h-0 opacity-0 group-hover:h-4 group-hover:opacity-60",
                )}
              />
              {/* Icon tile */}
              <span
                className={cn(
                  "relative z-10 flex size-8 items-center justify-center rounded-lg transition-all duration-300",
                  isActive ? "bg-white/20" : "bg-white/5 group-hover:bg-white/15",
                )}
              >
                <Icon className="size-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" />
              </span>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
                {item.label}
              </span>
              {isActive ? (
                <span className="relative z-10 ml-auto size-1.5 rounded-full bg-white/90 animate-pulse" />
              ) : (
                <span className="relative z-10 ml-auto translate-x-1 text-white/0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-white/50">
                  →
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Account + sign out */}
      <div className="border-t border-white/10 px-3.5 py-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 shadow-lg shadow-black/20">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-amber-500 shadow-lg shadow-red-600/30">
              <User className="size-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-black text-white">
                Admin Account
              </p>
              <p className="text-[10px] font-medium text-zinc-400">
                Staff workspace
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar (fixed) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-white/10 lg:block">
        <SidebarBody />
      </aside>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-50 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30 transition-transform duration-300 hover:scale-105 active:scale-95 lg:hidden"
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
          "fixed left-0 top-0 z-50 h-screen w-72 border-r border-white/10 shadow-2xl transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarBody onNavigate={() => setIsOpen(false)} />
      </aside>
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Folder,
  LogOut,
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

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
      >
        <Menu className="size-5" />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar - fixed overlay */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-72 border-r border-white/10 bg-zinc-950 shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black uppercase tracking-tight text-white">
                  Admin
                </h1>
                <p className="text-xs font-medium text-zinc-400">
                  Workspace
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="lg:hidden flex size-8 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navItems.map((item) => {
              // Use exact match for Dashboard, startsWith for other links
              const isActive = item.href === "/admin"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition-all duration-300",
                    isActive
                      ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-lg shadow-red-600/30"
                      : "text-zinc-400 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-white/5"
                  )}
                >
                  {/* Active micro-indicator bar */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-white/90 shadow-sm" />
                  )}
                  {/* Pulsing micro-dot for active state */}
                  {isActive && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 size-2 rounded-full bg-white/80 animate-pulse" />
                  )}
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-white/10 px-4 py-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg shadow-black/20 backdrop-blur-sm">
              {/* Account Indicator */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-amber-500 shadow-lg shadow-red-600/30">
                  <User className="size-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">Admin Account</p>
                  <p className="text-[10px] font-medium text-zinc-400">Staff Workspace</p>
                </div>
              </div>
              {/* Sign Out Button */}
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar - content only (positioning handled by layout) */}
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 px-6 py-5">
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight text-white">
              Admin
            </h1>
            <p className="text-xs font-medium text-zinc-400">
              Workspace
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            // Use exact match for Dashboard, startsWith for other links
            const isActive = item.href === "/admin"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-lg shadow-red-600/30"
                    : "text-zinc-400 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-white/5"
                )}
              >
                {/* Active micro-indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-white/90 shadow-sm" />
                )}
                {/* Pulsing micro-dot for active state */}
                {isActive && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 size-2 rounded-full bg-white/80 animate-pulse" />
                )}
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 px-4 py-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg shadow-black/20 backdrop-blur-sm">
            {/* Account Indicator */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-amber-500 shadow-lg shadow-red-600/30">
                <User className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-white">Admin Account</p>
                <p className="text-[10px] font-medium text-zinc-400">Staff Workspace</p>
              </div>
            </div>
            {/* Sign Out Button */}
            <SignOutButton />
          </div>
        </div>
      </div>
    </>
  );
}

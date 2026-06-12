"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/features/admin/auth/sign-out-button";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Menu", href: "/admin/menu", icon: Utensils },
  { label: "Analytics", href: "/admin/reports", icon: BarChart3 },
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
          "fixed left-0 top-0 z-50 h-screen w-72 border-r border-orange-900/10 bg-white/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="border-b border-orange-900/10 bg-gradient-to-br from-orange-50/50 to-white px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-black uppercase tracking-tight text-[#25130b]">
                  Admin
                </h1>
                <p className="text-xs font-medium text-orange-950/40">
                  Workspace
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="lg:hidden flex size-8 items-center justify-center rounded-lg bg-orange-100 text-orange-700"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
                      : "text-orange-950/60 hover:bg-orange-50/80 hover:text-[#25130b]"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t border-orange-900/10 px-4 py-6">
            <div className="rounded-xl border-2 border-red-600/20 bg-gradient-to-br from-red-50 to-orange-50/50 px-4 py-3 shadow-sm shadow-red-600/10">
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar - content only (positioning handled by layout) */}
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-orange-900/10 bg-gradient-to-br from-orange-50/50 to-white px-6 py-5">
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight text-[#25130b]">
              Admin
            </h1>
            <p className="text-xs font-medium text-orange-950/40">
              Workspace
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-black transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30"
                    : "text-orange-950/60 hover:bg-orange-50/80 hover:text-[#25130b]"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-orange-900/10 px-4 py-6">
          <div className="rounded-xl border-2 border-red-600/20 bg-gradient-to-br from-red-50 to-orange-50/50 px-4 py-3 shadow-sm shadow-red-600/10">
            <SignOutButton />
          </div>
        </div>
      </div>
    </>
  );
}

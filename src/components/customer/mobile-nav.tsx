"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Home,
  ShoppingBag,
  Sparkles,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCartStore } from "@/features/cart/cart-store";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Menu", href: "/menu", icon: Utensils },
  { label: "Combos", href: "/menu#combos", icon: Sparkles },
];

/* ─── Cart preview inside the sheet ─── */
function CartPreview() {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-orange-900/10 bg-orange-50/40 px-4 py-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-orange-100">
          <ShoppingBag className="size-4 text-orange-400" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs font-bold text-orange-950/40">Your cart</p>
          <p className="text-[11px] font-medium text-orange-950/30">
            No items yet
          </p>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => {
    const addOns = item.addOns.reduce((a, s) => a + s.price, 0);
    return sum + (item.price + addOns) * item.quantity;
  }, 0);

  return (
    <SheetClose asChild>
      <Link
        href="/cart"
        className="group relative overflow-hidden rounded-xl border border-orange-900/10 bg-gradient-to-br from-white to-orange-50/60 px-4 py-3 shadow-sm transition-all duration-300 hover:border-red-700/25 hover:shadow-md"
      >
        {/* Shimmer on hover */}
        <div className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 shadow-sm">
            <ShoppingBag className="size-4 text-amber-100" aria-hidden="true" />
            <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[9px] font-black text-red-950 shadow-xs">
              {itemCount}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-[#25130b]">
              {itemCount} item{itemCount !== 1 ? "s" : ""} in cart
            </p>
            <p className="text-[11px] font-bold text-red-700">
              {formatPeso(subtotal)}
            </p>
          </div>
          <ChevronRight className="size-4 text-orange-950/30 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
        </div>
      </Link>
    </SheetClose>
  );
}

/* ─── Nav link item ─── */
function NavLink({
  item,
  index,
}: {
  item: (typeof navItems)[number];
  index: number;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href.replace(/#.*$/, ""));

  return (
    <SheetClose asChild>
      <Link
        href={item.href}
        className={cn(
          "mobile-nav-link group relative flex h-13 items-center justify-between overflow-hidden rounded-xl border px-4 transition-all duration-300",
          isActive
            ? "border-red-700/20 bg-gradient-to-r from-red-50 to-amber-50 shadow-sm"
            : "border-orange-900/8 bg-white shadow-sm hover:border-red-700/20 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-amber-50/30 hover:shadow-md",
        )}
        style={{ "--nav-index": index } as React.CSSProperties}
      >
        {/* Active indicator bar */}
        <div
          className={cn(
            "absolute inset-y-2 left-0 w-1 rounded-full transition-all duration-300",
            isActive
              ? "bg-gradient-to-b from-red-600 to-amber-500 opacity-100"
              : "bg-transparent opacity-0 group-hover:opacity-60 group-hover:bg-red-400",
          )}
        />

        <span className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-lg transition-all duration-300",
              isActive
                ? "bg-gradient-to-br from-red-600 to-red-700 shadow-sm"
                : "bg-orange-100/70 group-hover:bg-red-100/70",
            )}
          >
            <Icon
              className={cn(
                "size-4 transition-all duration-300",
                isActive
                  ? "text-amber-200"
                  : "text-orange-950/40 group-hover:text-red-600",
              )}
              aria-hidden="true"
            />
          </span>
          <span
            className={cn(
              "text-sm font-bold transition-colors duration-300",
              isActive
                ? "text-[#25130b]"
                : "text-orange-950/70 group-hover:text-[#25130b]",
            )}
          >
            {item.label}
          </span>
        </span>

        <ChevronRight
          className={cn(
            "size-4 transition-all duration-300",
            isActive
              ? "text-red-700"
              : "text-orange-950/20 group-hover:text-red-700 group-hover:translate-x-0.5",
          )}
          aria-hidden="true"
        />
      </Link>
    </SheetClose>
  );
}

/* ─── Mobile Navigation Sheet ─── */
export function MobileNav() {
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const [open, setOpen] = useState(false);

  // Reset entrance animations when sheet opens
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    if (open) {
      setAnimKey((k) => k + 1);
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-10 rounded-full"
          aria-label="Open navigation"
        >
          <MenuIcon className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="border-l border-orange-900/10 bg-[#fffbf5] p-0 shadow-2xl"
        showCloseButton={false}
      >
        <div className="flex h-full flex-col">
          {/* ── Premium Header ── */}
          <SheetHeader className="relative overflow-hidden border-b border-orange-900/8 bg-gradient-to-b from-[#fff3e0] to-[#fffbf5] px-5 pb-5 pt-6">
            {/* Decorative radial glow */}
            <div className="pointer-events-none absolute -top-10 -right-10 size-40 rounded-full bg-gradient-to-br from-amber-200/30 to-transparent blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 size-32 rounded-full bg-gradient-to-tr from-red-200/20 to-transparent blur-xl" />

            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 shadow-md shadow-red-700/20">
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
                  <SheetTitle className="text-left text-sm font-black uppercase tracking-tight text-[#25130b]">
                    Kanto Burger Co.
                  </SheetTitle>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-orange-950/40">
                    Hot burgers • Fast pickup
                  </p>
                </div>
              </div>

              {/* Close button */}
              <SheetClose asChild>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-lg border border-orange-900/10 bg-white/80 text-orange-950/50 shadow-sm transition-all duration-200 hover:border-red-700/30 hover:bg-red-50 hover:text-red-700"
                  aria-label="Close navigation"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </SheetClose>
            </div>
          </SheetHeader>

          {/* ── Navigation Items ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="space-y-1.5" key={animKey}>
              <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-orange-950/30">
                Navigation
              </p>
              {navItems.map((item, index) => (
                <div
                  key={item.href}
                  className="mobile-nav-item"
                  style={{ "--nav-index": index } as React.CSSProperties}
                >
                  <NavLink item={item} index={index} />
                </div>
              ))}
            </div>

            {/* ── Cart Section ── */}
            <div className="mt-5">
              <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest text-orange-950/30">
                Order
              </p>
              <CartPreview />
            </div>

            {/* ── Quick info ── */}
            <div className="mt-5 rounded-xl border border-orange-900/8 bg-orange-50/40 px-4 py-3">
              <div className="flex items-center gap-2 text-[11px] font-bold text-orange-950/50">
                <span className="flex size-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                Open daily • 10:00 AM – 10:00 PM
              </div>
              <p className="mt-1 text-[10px] font-medium text-orange-950/30">
                Quezon City, Philippines
              </p>
            </div>
          </div>

          {/* ── Footer ── */}
          <SheetFooter className="border-t border-orange-900/8 bg-gradient-to-t from-[#fff3e0]/50 to-transparent px-4 py-4">
            <SheetClose asChild>
              <Button
                className="mobile-nav-cta h-12 w-full rounded-xl font-black shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                asChild
              >
                <Link href="/menu">
                  <Sparkles className="size-4" aria-hidden="true" />
                  Start your order
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Animated hamburger icon ─── */
function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

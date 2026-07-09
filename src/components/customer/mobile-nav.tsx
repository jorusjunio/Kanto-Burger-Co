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
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
import {
  removeTrackedOrder,
  useTrackedOrders,
  type TrackedOrder,
} from "@/features/orders/tracked-orders";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Menu", href: "/menu", icon: Utensils },
  { label: "Combos", href: "/menu#combos", icon: Sparkles },
];

/* ─── Tracked Orders (numbered, multi-order) ─── */
function TrackedOrderRow({
  order,
  index,
}: {
  order: TrackedOrder;
  index: number;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 ring-1 ring-orange-900/10">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-sm font-black text-white shadow-sm">
        #{index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-red-700/70">
          Order #{index + 1}
        </p>
        <p className="truncate text-xs font-black text-[#25130b]">
          {order.orderNumber}
        </p>
      </div>
      <SheetClose asChild>
        <button
          type="button"
          onClick={() =>
            router.push(
              `/order/${order.orderNumber}?token=${order.token}`,
            )
          }
          className="flex h-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-700 px-3 text-[10px] font-black text-white shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Track
        </button>
      </SheetClose>
      <button
        type="button"
        onClick={() => removeTrackedOrder(order.orderNumber)}
        aria-label={`Stop tracking ${order.orderNumber}`}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-orange-950/30 transition-colors duration-200 hover:bg-red-100 hover:text-red-700"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

function TrackedOrdersList({ orders }: { orders: TrackedOrder[] }) {
  if (orders.length === 0) return null;

  return (
    <div className="mt-6 border-t border-orange-900/8 pt-5">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-orange-950/30">
        Track Orders
        <span className="ml-1 font-black text-red-700">{orders.length}</span>
      </p>
      <div className="space-y-2">
        {orders.map((order, index) => (
          <TrackedOrderRow
            key={order.orderNumber}
            order={order}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Cart preview inside the sheet ─── */
function CartPreview() {
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 rounded-xl px-3 py-3.5">
        <ShoppingBag className="size-[18px] text-orange-950/25" aria-hidden="true" />
        <p className="text-[15px] font-bold text-orange-950/35">
          Your cart is empty
        </p>
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
        className="group flex items-center justify-between rounded-xl px-3 py-3.5 transition-colors duration-200 hover:bg-orange-950/[0.04]"
      >
        <span className="flex items-center gap-3">
          <span className="relative">
            <ShoppingBag
              className="size-[18px] text-red-700 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-12 group-hover:scale-110"
              aria-hidden="true"
            />
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black leading-none text-white">
              {itemCount}
            </span>
          </span>
          <span className="text-[15px] font-bold text-orange-950/70 transition-colors duration-200 group-hover:text-[#25130b]">
            Your cart
          </span>
        </span>

        <span className="flex items-center gap-1.5">
          <span className="text-sm font-black text-red-700">
            {formatPeso(subtotal)}
          </span>
          <ChevronRight
            className="size-4 text-orange-950/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-orange-950/45"
            aria-hidden="true"
          />
        </span>
      </Link>
    </SheetClose>
  );
}

/* ─── Nav link item — quiet list row, springy icon, dot marks the active page ─── */
function NavLink({ item }: { item: (typeof navItems)[number] }) {
  const pathname = usePathname();
  const Icon = item.icon;
  // Exact-path match only. Anchor links (e.g. /menu#combos) never claim active,
  // so "Menu" and "Combos" can't light up at the same time.
  const isAnchor = item.href.includes("#");
  const isActive = !isAnchor && pathname === item.href;

  return (
    <SheetClose asChild>
      <Link
        href={item.href}
        className="group flex items-center justify-between rounded-xl px-3 py-3.5 transition-colors duration-200 hover:bg-orange-950/[0.04]"
      >
        <span className="flex items-center gap-3">
          <Icon
            className={cn(
              "size-[18px] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-12 group-hover:scale-110",
              isActive
                ? "text-red-700"
                : "text-orange-950/35 group-hover:text-amber-500",
            )}
            aria-hidden="true"
          />
          <span
            className={cn(
              "text-[15px] font-bold transition-colors duration-200",
              isActive
                ? "text-red-700"
                : "text-orange-950/70 group-hover:text-[#25130b]",
            )}
          >
            {item.label}
          </span>
        </span>

        {isActive ? (
          <span className="size-1.5 rounded-full bg-red-600" aria-hidden="true" />
        ) : (
          <ChevronRight
            className="size-4 text-orange-950/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-orange-950/45"
            aria-hidden="true"
          />
        )}
      </Link>
    </SheetClose>
  );
}

/* ─── Mobile Navigation Sheet ─── */
export function MobileNav({
  triggerClassName,
}: {
  /** Extra classes for the trigger button (e.g. dark-dock styling). */
  triggerClassName?: string;
} = {}) {
  const [open, setOpen] = useState(false);
  const trackedOrders = useTrackedOrders();
  const trackedCount = trackedOrders.length;

  // Reset entrance animations when sheet opens
  const [animKey, setAnimKey] = useState(0);
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      setAnimKey((k) => k + 1);
    }
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative size-10 rounded-full", triggerClassName)}
          aria-label={
            trackedCount > 0
              ? `Open navigation, ${trackedCount} order${trackedCount > 1 ? "s" : ""} to track`
              : "Open navigation"
          }
        >
          <MenuIcon className="size-5" aria-hidden="true" />
          {trackedCount > 0 ? (
            <span
              key={trackedCount}
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black leading-none text-red-950 shadow-sm ring-2 ring-[#1d0906] animate-in zoom-in-50 duration-300"
            >
              {trackedCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="border-l border-orange-900/10 bg-[#fffbf5] p-0 shadow-2xl"
        showCloseButton={false}
      >
        <div className="flex h-full flex-col">
          {/* ── Header — brand row, nothing else ── */}
          <SheetHeader className="border-b border-orange-900/8 px-5 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#1d0906] shadow-sm">
                  <Image
                    src="/assets/brand/J logo without bg.png"
                    alt=""
                    width={18}
                    height={18}
                    className="object-contain brightness-0 invert"
                    priority
                  />
                </span>
                <SheetTitle className="text-left text-sm font-black uppercase tracking-tight text-[#25130b]">
                  Kanto Burger Co.
                </SheetTitle>
              </div>

              <SheetClose asChild>
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-full text-orange-950/40 transition-colors duration-200 hover:bg-orange-950/5 hover:text-red-700"
                  aria-label="Close navigation"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </SheetClose>
            </div>
          </SheetHeader>

          {/* ── Navigation Items ── */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div key={animKey}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-orange-950/30">
                Navigation
              </p>
              {navItems.map((item, index) => (
                <div
                  key={item.href}
                  className="mobile-nav-item"
                  style={{ "--nav-index": index } as React.CSSProperties}
                >
                  <NavLink item={item} />
                </div>
              ))}
            </div>

            {/* ── Tracked Orders Section ── */}
            <TrackedOrdersList orders={trackedOrders} />

            {/* ── Cart Section ── */}
            <div className="mt-6 border-t border-orange-900/8 pt-5">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-orange-950/30">
                Order
              </p>
              <CartPreview />
            </div>

            {/* ── Quick info — quiet single line, no box ── */}
            <div className="mt-6 px-3">
              <p className="flex items-center gap-2 text-[11px] font-semibold text-orange-950/45">
                <span
                  className="size-1.5 shrink-0 rounded-full bg-emerald-500"
                  aria-hidden="true"
                />
                Open daily • 10:00 AM – 10:00 PM
              </p>
              <p className="mt-1 pl-3.5 text-[11px] font-medium text-orange-950/30">
                Quezon City, Philippines
              </p>
            </div>
          </div>

          {/* ── Footer ── */}
          <SheetFooter className="border-t border-orange-900/8 px-4 py-4">
            <SheetClose asChild>
              <Button
                className="mobile-nav-cta h-12 w-full rounded-full font-black transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                asChild
              >
                <Link href="/menu">
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

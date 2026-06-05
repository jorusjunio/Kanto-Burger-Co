"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  Home,
  Menu,
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
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Menu", href: "/menu", icon: Utensils },
  { label: "Combos", href: "/menu#combos", icon: Sparkles },
];

type CustomerTopBarProps = {
  variant?: "hero" | "light";
};

function useHeroNavPastHero(enabled: boolean) {
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const checkBackgroundAtNavbar = () => {
      // Get element directly behind navbar (center, at navbar height)
      const element = document.elementFromPoint(
        window.innerWidth / 2,
        50 // Check at navbar level (50px from top)
      );

      if (element) {
        const style = window.getComputedStyle(element);
        const bgImage = style.backgroundImage || "";

        // Keep text white if the hero overlay gradient is present behind the navbar
        if (bgImage.includes("rgba(251,191,36,0.34)") && bgImage.includes("circle_at_74%_36%")) {
          setIsPastHero(false);
          return;
        }

        const bgColor = style.backgroundColor;
        const rgbMatch = bgColor.match(/\d+/g);
        if (rgbMatch && rgbMatch.length >= 3) {
          const [r, g, b] = rgbMatch.map(Number);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          setIsPastHero(luminance > 0.85);
        }
      }
    };

    // Check on mount and on scroll
    checkBackgroundAtNavbar();
    window.addEventListener("scroll", checkBackgroundAtNavbar, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", checkBackgroundAtNavbar);
      setIsPastHero(false);
    };
  }, [enabled]);

  return enabled && isPastHero;
}

export function CustomerTopBar({ variant = "light" }: CustomerTopBarProps) {
  const pathname = usePathname();
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const isHeroVariant = variant === "hero";
  const isPastHero = useHeroNavPastHero(isHeroVariant);
  const isHeroOnDark = isHeroVariant && !isPastHero;

  if (isHeroVariant) {
    return (
      <div
        className={cn(
          "fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-[850px] overflow-hidden rounded-[2rem] backdrop-blur-2xl backdrop-saturate-[1.6] px-5 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-300 ease-in-out",
          isPastHero
            ? "border border-black/10 bg-transparent text-stone-900"
            : "border border-white/10 bg-neutral-900/[0.25] text-white"
        )}
        data-nav-tone={isPastHero ? "light" : "hero"}
      >
        {/* Subtle liquid glass shine layer */}
        <div className={cn(
          "pointer-events-none absolute inset-0 rounded-[2rem] bg-gradient-to-b opacity-100",
          isPastHero
            ? "from-black/5 to-transparent"
            : "from-white/10 to-transparent"
        )} />
        
        <div className="relative z-10 flex w-full items-center justify-between gap-4">
          
          {/* DYNAMIC LOGO SECTION */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              prefetch
              className={cn(
                "group flex items-center gap-2.5 rounded-[2rem] border p-1 pr-3.5 transition-all duration-300",
                isPastHero
                  ? "border-black/5 bg-black/5 hover:bg-black/10"
                  : "border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20",
              )}
              aria-label="Kanto Burger Co. Home"
            >
              <Image
                src="/assets/brand/J logo without bg.png"
                alt="Kanto Burger Co."
                width={24}
                height={24}
                className={cn(
                  "object-contain transition-all duration-500",
                  isPastHero
                    ? "brightness-0 saturate-100"
                    : "brightness-100 invert-0",
                )}
                priority
              />

              <span className="hidden sm:flex flex-col gap-0.5 leading-none">
                <span
                  className={cn(
                    "text-xs font-bold tracking-[0.2em] transition-colors duration-500",
                    isPastHero ? "text-stone-900 group-hover:text-amber-800" : "text-white group-hover:text-amber-200",
                  )}
                >
                  Kanto Burger Co.
                </span>
                <span
                  className={cn(
                    "text-[9px] font-semibold uppercase tracking-[0.18em] transition-colors duration-500",
                    isPastHero ? "text-stone-500" : "text-white/50",
                  )}
                >
                  Hot burgers • Fast pickup
                </span>
              </span>
            </Link>
          </div>

          {/* COMPACT CAPSULE NAV LINKS WITH ICONS */}
          <div className={cn(
            "hidden lg:flex items-center gap-1 rounded-full p-0.5 backdrop-blur-md border transition-all duration-300",
            isPastHero
              ? "bg-black/5 border-black/5"
              : "bg-white/5 border-white/5"
          )}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300",
                    isPastHero
                      ? "text-stone-700/80 hover:text-stone-900 hover:bg-black/5"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className={cn(
                    "size-3.5 transition-colors group-hover:text-amber-300",
                    isPastHero ? "text-stone-600" : "text-white/60"
                  )} />
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute bottom-1 left-3 right-3 h-[1.5px] bg-amber-500 scale-x-0 transition-transform duration-300 origin-center group-hover:scale-x-100" />
                </Link>
              );
            })}
          </div>

          {/* COMPACT BUTTONS SECTION */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              prefetch
              className={cn(
                "group hidden md:inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-0.5",
                isPastHero
                  ? "border-black/10 bg-black/5 text-stone-700/90 hover:bg-black/10 hover:text-stone-900 hover:border-black/20"
                  : "border-white/10 bg-white/5 text-white/90 hover:bg-white/15 hover:text-white hover:border-white/20"
              )}
            >
              <ShoppingBag className="size-3 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
              <span>Cart</span>
              {itemCount > 0 ? (
                <span className="rounded-full bg-gradient-to-r from-red-500 to-orange-600 px-1.5 py-0.5 text-[8px] font-black text-white shadow-sm">
                  {itemCount}
                </span>
              ) : null}
            </Link>
            
            <Button
              asChild
              className={cn(
                "hidden md:inline-flex h-8 rounded-full px-3.5 text-[10px] font-bold uppercase tracking-[0.15em] shadow-[0_4px_25px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5",
                isPastHero
                  ? "bg-amber-400 text-amber-950 hover:bg-amber-300 hover:shadow-[0_6px_20px_rgba(251,191,36,0.25)]"
                  : "bg-white text-slate-950 hover:bg-amber-300 hover:shadow-[0_6px_20px_rgba(251,191,36,0.25)]"
              )}
            >
              <Link href="/menu">Order</Link>
            </Button>

            {/* MOBILE MENU BUTTON */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "inline-flex h-8 w-8 items-center justify-center rounded-full border outline-none transition-all duration-300 lg:hidden",
                    isPastHero
                      ? "border-black/10 bg-black/5 text-stone-700 hover:bg-black/10 hover:border-black/20"
                      : "border-white/10 bg-white/5 text-white hover:bg-white/15 hover:border-white/20"
                  )}
                  aria-label="Open navigation"
                >
                  <Menu className="size-3.5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent className="border-orange-900/10 bg-[#fff8ea] p-0">
                <SheetHeader className="border-b border-orange-900/10 p-5">
                  <SheetTitle className="text-left text-base font-extrabold uppercase text-[#25130b]">
                    Kanto Burger Co.
                  </SheetTitle>
                </SheetHeader>
                <div className="grid gap-2 p-4">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SheetClose key={item.href} asChild>
                        <Link
                          href={item.href}
                          className="flex h-12 items-center justify-between rounded-lg border border-orange-900/10 bg-white px-3 font-bold text-orange-950 shadow-sm"
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="size-4 text-red-700" aria-hidden="true" />
                            {item.label}
                          </span>
                          <ChevronRight className="size-4 text-orange-950/40" aria-hidden="true" />
                        </Link>
                      </SheetClose>
                    );
                  })}
                  <SheetClose asChild>
                    <Link
                      href="/cart"
                      className="flex h-12 items-center justify-between rounded-lg border border-orange-900/10 bg-white px-3 font-bold text-orange-950 shadow-sm"
                    >
                      <span className="flex items-center gap-3">
                        <ShoppingBag className="size-4 text-red-700" aria-hidden="true" />
                        Cart
                      </span>
                      <span className="rounded-full bg-amber-300 px-2 py-1 text-xs font-extrabold text-red-950">
                        {itemCount}
                      </span>
                    </Link>
                  </SheetClose>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button className="kanto-button h-11 w-full font-extrabold" asChild>
                      <Link href="/menu">Start order</Link>
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "customer-nav-wrapper customer-nav relative isolate inline-flex h-14 items-center gap-1 rounded-full border px-2 py-2 transition-all",
        isHeroOnDark
          ? "customer-nav--hero border-white/20 text-white"
          : "customer-nav--light border-white/80 text-[#25130b]",
      )}
      data-nav-tone={isHeroOnDark ? "hero" : "light"}
    >
      <Link
        href="/"
        prefetch
            className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 will-change-transform",
          isHeroOnDark
            ? "hover:bg-white/12 hover:shadow-[0_0_0_6px_rgba(255,255,255,0.06)]"
            : "hover:bg-orange-950/6 hover:shadow-[0_0_0_6px_rgba(251,191,36,0.10)]",
          "hover:-translate-y-0.5"
        )}
        aria-label="Home"
      >
        <span
          className={cn(
            "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1",
            isHeroOnDark ? "ring-white/40" : "ring-orange-900/10",
          )}
        >
          <Image
            src="/assets/brand/J logo without bg.png"
            alt="Kanto Burger Co."
            width={22}
            height={22}
            className="object-contain"
            priority
          />
        </span>
      </Link>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "relative size-10 rounded-full transition-all duration-300 will-change-transform",
          "hover:-translate-y-0.5",
          "focus-visible:ring-2 focus-visible:ring-amber-300/60 focus-visible:ring-offset-0",
          isHeroOnDark
            ? "text-white hover:bg-white/16 hover:text-amber-300"
            : "text-orange-950 hover:bg-orange-100/80 hover:text-red-700",
        )}
        asChild
      >
        <Link href="/cart" prefetch aria-label="Cart">
          <ShoppingBag className="size-5" aria-hidden="true" />
          {itemCount > 0 ? (
            <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white shadow-sm">
              {itemCount}
            </span>
          ) : null}
        </Link>
      </Button>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "relative size-10 rounded-full",
              isHeroOnDark
                ? "text-white hover:bg-white/15 hover:text-amber-300"
                : "text-orange-950 hover:bg-orange-100 hover:text-red-700",
            )}
            aria-label="Open navigation"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent className="border-orange-900/10 bg-[#fff8ea] p-0">
          <SheetHeader className="border-b border-orange-900/10 p-5">
            <SheetTitle className="text-left text-base font-extrabold uppercase text-[#25130b]">
              Kanto Burger Co.
            </SheetTitle>
          </SheetHeader>
          <div className="grid gap-2 p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <SheetClose key={item.href} asChild>
                  <Link
                    href={item.href}
                    className="flex h-12 items-center justify-between rounded-lg border border-orange-900/10 bg-white px-3 font-bold text-orange-950 shadow-sm"
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="size-4 text-red-700" aria-hidden="true" />
                      {item.label}
                    </span>
                    <ChevronRight className="size-4 text-orange-950/40" aria-hidden="true" />
                  </Link>
                </SheetClose>
              );
            })}
            <SheetClose asChild>
              <Link
                href="/cart"
                className="flex h-12 items-center justify-between rounded-lg border border-orange-900/10 bg-white px-3 font-bold text-orange-950 shadow-sm"
              >
                <span className="flex items-center gap-3">
                  <ShoppingBag className="size-4 text-red-700" aria-hidden="true" />
                  Cart
                </span>
                <span className="rounded-full bg-amber-300 px-2 py-1 text-xs font-extrabold text-red-950">
                  {itemCount}
                </span>
              </Link>
            </SheetClose>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button className="kanto-button h-11 w-full font-extrabold" asChild>
                <Link href="/menu">Start order</Link>
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Home,
  ShoppingBag,
  Sparkles,
  Utensils,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/features/cart/cart-store";
import { cn } from "@/lib/utils";

import { MobileNav } from "./mobile-nav";

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
        const bgColor = window.getComputedStyle(element).backgroundColor;
        
        // Parse RGB values
        const rgbMatch = bgColor.match(/\d+/g);
        if (rgbMatch && rgbMatch.length >= 3) {
          const [r, g, b] = rgbMatch.map(Number);
          // Calculate luminance to determine if background is light
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          // Only switch to dark text when background is VERY light (> 0.85)
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
          "home-topbar fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-[850px] overflow-hidden rounded-[2rem] backdrop-blur-2xl backdrop-saturate-[1.6] px-5 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-300 ease-in-out",
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
                    : "brightness-0 invert",
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

            {/* MOBILE MENU BUTTON — Hero variant */}
            <div className="inline-flex lg:hidden">
              <MobileNav />
            </div>
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

      <MobileNav />
    </div>
  );
}

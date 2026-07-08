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

// Navbar tone follows the section behind it. Instead of sampling pixel colors
// (unreliable — elementFromPoint returns the fixed navbar itself), we switch
// tone based on whether the dark hero has scrolled above the bar: over the dark
// hero → light text; over the light content below → dark text. This keeps the
// text readable against both dark and light backgrounds.
const NAV_TONE_SWITCH_Y = 60; // ~bar vertical center from the top of the viewport

function useHeroNavPastHero(enabled: boolean) {
  const [isPastHero, setIsPastHero] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const update = () => {
      const hero = document.getElementById("home-hero");
      const heroBottom = hero
        ? hero.getBoundingClientRect().bottom
        : window.innerHeight - window.scrollY;
      setIsPastHero(heroBottom < NAV_TONE_SWITCH_Y);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
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
          "home-topbar fixed inset-x-0 top-4 z-50 mx-auto w-full max-w-[850px] rounded-full backdrop-blur-xl px-5 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.14)] transition-all duration-300 ease-in-out",
          isPastHero
            ? "border border-black/10 bg-white/55 text-stone-900"
            : "border border-white/10 bg-neutral-900/35 text-white"
        )}
        data-nav-tone={isPastHero ? "light" : "hero"}
      >
        <div className="relative z-10 flex w-full items-center justify-between gap-2 sm:gap-4">
          
          {/* DYNAMIC LOGO SECTION */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              prefetch
              className={cn(
                "group flex items-center gap-2.5 rounded-full border p-1.5 transition-all duration-300 lg:rounded-[2rem] lg:p-1 lg:pr-3.5",
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

              <span className="hidden lg:flex flex-col gap-0.5 leading-none">
                <span
                  className={cn(
                    "text-xs font-bold tracking-[0.2em] transition-colors duration-500",
                    isPastHero ? "text-stone-900 group-hover:text-amber-800" : "text-white group-hover:text-amber-200",
                  )}
                >
                  Kanto Burger Co.
                </span>
              </span>
            </Link>
          </div>

          {/* CAPSULE NAV LINKS — icon-only on phones/tablets, icon + label on desktop */}
          <div className={cn(
            "flex items-center gap-1 rounded-full border p-0.5 transition-all duration-300",
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
                  aria-label={item.label}
                  title={item.label}
                  className={cn(
                    "group relative flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 lg:px-3",
                    isPastHero
                      ? "text-stone-700/80 hover:text-stone-900"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {/* Playful icon spin + scale on hover (matches the badge star). */}
                  <Icon className={cn(
                    "size-4 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-12 group-hover:scale-125 group-hover:text-amber-300 lg:size-3.5",
                    isPastHero ? "text-stone-600" : "text-white/60"
                  )} />
                  <span className="relative z-10 hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* COMPACT BUTTONS SECTION */}
          <div className="flex items-center gap-2">
            <Link
              href="/cart"
              prefetch
              aria-label="Cart"
              title="Cart"
              className={cn(
                "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-0.5 md:px-3.5",
                isPastHero
                  ? "border-black/10 bg-black/5 text-stone-700/90 hover:bg-black/10 hover:text-stone-900 hover:border-black/20"
                  : "border-white/10 bg-white/5 text-white/90 hover:bg-white/15 hover:text-white hover:border-white/20"
              )}
            >
              <ShoppingBag className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-12 group-hover:scale-125 md:size-3" aria-hidden="true" />
              <span className="hidden md:inline">Cart</span>
              {itemCount > 0 ? (
                <span className="rounded-full bg-gradient-to-r from-red-500 to-orange-600 px-1.5 py-0.5 text-[8px] font-black text-white shadow-sm">
                  {itemCount}
                </span>
              ) : null}
            </Link>
            
            <Button
              asChild
              className={cn(
                "hidden md:inline-flex h-8 rounded-full px-3.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 hover:-translate-y-0.5",
                isPastHero
                  ? "bg-amber-400 text-amber-950 hover:bg-amber-300 hover:shadow-[0_6px_20px_rgba(251,191,36,0.25)]"
                  : "bg-white text-slate-950 hover:bg-amber-300 hover:shadow-[0_6px_20px_rgba(251,191,36,0.25)]"
              )}
            >
              <Link href="/menu">Order</Link>
            </Button>
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

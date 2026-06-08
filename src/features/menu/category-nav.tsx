"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Beef,
  ChefHat,
  CupSoda,
  Drumstick,
  Pizza,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { MenuCategory } from "./types";

type CategoryNavProps = {
  categories: MenuCategory[];
};

/* ─── Category icon map ─── */
const categoryIcons: Record<string, LucideIcon> = {
  burgers: Beef,
  "chicken-and-more": Drumstick,
  sides: Pizza,
  drinks: CupSoda,
  combos: Sparkles,
};

function getCategoryIcon(slug: string) {
  return categoryIcons[slug] ?? ChefHat;
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const activePillRef = useRef<HTMLAnchorElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /* ─── IntersectionObserver: detect active section ─── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0.1 },
    );

    for (const category of categories) {
      const el = document.getElementById(category.slug);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [categories]);

  /* ─── Scroll: reset to "all" at top ─── */
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveCategory("all");
      }
    };
    const scrollOpts = { passive: true };
    window.addEventListener("scroll", handleScroll, scrollOpts);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ─── Auto-scroll active pill into center ─── */
  useEffect(() => {
    if (!activePillRef.current || !scrollRef.current) return;
    
    const container = scrollRef.current;
    const pill = activePillRef.current;
    const cr = container.getBoundingClientRect();
    const pr = pill.getBoundingClientRect();
    
    // Skip scroll if already visible by at least 30% on either side
    const pillVisibleLeft = pr.left - cr.left >= -pr.width * 0.3;
    const pillVisibleRight = pr.right <= cr.right + pr.width * 0.3;
    if (pillVisibleLeft && pillVisibleRight) return;
    
    const scrollLeft = pr.left - cr.left - cr.width / 2 + pr.width / 2;
    container.scrollBy({ left: scrollLeft, behavior: "smooth" });
  }, [activeCategory]);

  /* ─── Detect scrollable edges for fade hints (ref-based, no re-renders) ─── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      const left = el!.scrollLeft > 4;
      const right = el!.scrollLeft + el!.clientWidth < el!.scrollWidth - 4;
      // Only set state when values actually change to avoid re-renders
      setCanScrollLeft((prev) => (prev !== left ? left : prev));
      setCanScrollRight((prev) => (prev !== right ? right : prev));
    };

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categories]);

  const totalItems = categories.reduce(
    (sum, cat) => sum + cat.products.length,
    0,
  );

  function getActiveCount() {
    if (activeCategory === "all") return totalItems;
    return (
      categories.find((c) => c.slug === activeCategory)?.products.length ?? 0
    );
  }

  function isActive(slug: string) {
    return activeCategory === slug;
  }

  return (
      <div 
        className="sticky z-50 border-b border-orange-900/8 bg-[#fffbf2] backdrop-blur-2xl"
        style={{ top: '0px', position: 'sticky' }}
      >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center gap-3 py-2.5 pb-3.5">
          {/* ── Item count chip ── */}
          <div className="hidden shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-red-700 to-red-600 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-white shadow-lg shadow-red-700/25 sm:flex">
            <span className="cat-count-value tabular-nums">
              {getActiveCount()}
            </span>
            <span className="opacity-70">items</span>
          </div>

          {/* ── Scrollable pills with edge fade ── */}
          <div className="relative flex-1 overflow-hidden pb-1.5">
            {/* Left fade */}
            <div
              className={cn(
                "cat-nav-fade pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#fffbf2]/85 to-transparent transition-opacity duration-300",
                canScrollLeft ? "opacity-100" : "opacity-0",
              )}
            />
            {/* Right fade */}
            <div
              className={cn(
                "cat-nav-fade pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#fffbf2]/85 to-transparent transition-opacity duration-300",
                canScrollRight ? "opacity-100" : "opacity-0",
              )}
            />

            <div
              ref={scrollRef}
              className="cat-scroll flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {/* "All" pill */}
              <Link
                href="/menu"
                onClick={() => setActiveCategory("all")}
                ref={isActive("all") ? activePillRef : undefined}
                className={cn(
                  "shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-colors duration-200",
                  isActive("all")
                    ? "bg-red-600 text-white"
                    : "border border-orange-900/10 bg-white/70 text-orange-950/60 hover:bg-white hover:text-red-700",
                )}
              >
                <span className="flex items-center gap-2">
                  <Sparkles
                    className={cn(
                      "size-4 transition-all duration-300",
                      isActive("all")
                        ? "text-amber-300"
                        : "text-orange-950/30 group-hover:text-red-500",
                    )}
                    aria-hidden="true"
                  />
                  All
                </span>
                {/* Active shimmer */}
                {isActive("all") ? (
                  <span className="cat-pill-shimmer pointer-events-none absolute inset-0 rounded-xl" />
                ) : null}
              </Link>

              {/* Category pills */}
              {categories.map((category) => {
                const Icon = getCategoryIcon(category.slug);
                const active = isActive(category.slug);
                return (
                  <Link
                    key={category.id}
                    href={`/menu#${category.slug}`}
                    onClick={() => setActiveCategory(category.slug)}
                    ref={active ? activePillRef : undefined}
                    className={cn(
                      "shrink-0 rounded-xl px-4 py-2 text-sm font-bold transition-colors duration-200",
                      active
                        ? "bg-red-600 text-white"
                        : "border border-orange-900/10 bg-white/70 text-orange-950/60 hover:bg-white hover:text-red-700",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          "size-4 transition-all duration-300",
                          active
                            ? "text-amber-300"
                            : "text-orange-950/30 group-hover:text-red-500",
                        )}
                        aria-hidden="true"
                      />
                      {category.name}
                      <span
                        className={cn(
                          "inline-flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[11px] font-black tabular-nums transition-all duration-300",
                          active
                            ? "bg-white/20 text-white"
                            : "bg-orange-900/8 text-orange-950/25 group-hover:bg-red-50 group-hover:text-red-600",
                        )}
                      >
                        {category.products.length}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Active filter label (desktop) ── */}
          <div className="hidden shrink-0 text-right lg:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-950/30">
              Filtering
            </p>
            <p className="text-xs font-black text-[#25130b]">
              {activeCategory === "all"
                ? "All items"
                : categories.find((c) => c.slug === activeCategory)?.name ??
                  "All items"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

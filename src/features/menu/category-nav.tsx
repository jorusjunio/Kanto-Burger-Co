"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
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

/**
 * Sliding segmented control: one rounded container holding every category,
 * with a red "thumb" that glides behind whichever section is active. The thumb
 * lives inside the scrollable track so it follows horizontal overflow scrolling.
 */
export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(
    null,
  );
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const setItemRef = useCallback(
    (slug: string) => (el: HTMLAnchorElement | null) => {
      if (el) {
        itemRefs.current.set(slug, el);
      } else {
        itemRefs.current.delete(slug);
      }
    },
    [],
  );

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
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ─── Slide the thumb under the active item ─── */
  useEffect(() => {
    const update = () => {
      const el = itemRefs.current.get(activeCategory);
      if (el) {
        setThumb({ left: el.offsetLeft, width: el.offsetWidth });
      }
    };

    update();
    // Re-measure once webfonts settle (label widths shift slightly).
    document.fonts?.ready.then(update);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [activeCategory, categories]);

  /* ─── Auto-center the active item only when it was clicked ─── */
  useEffect(() => {
    const item = itemRefs.current.get(activeCategory);
    const container = scrollRef.current;
    if (!item || !container) return;

    if (document.activeElement === item) {
      const cr = container.getBoundingClientRect();
      const pr = item.getBoundingClientRect();
      const scrollLeft = pr.left - cr.left - cr.width / 2 + pr.width / 2;
      container.scrollBy({ left: scrollLeft, behavior: "smooth" });
    }
  }, [activeCategory]);

  /* ─── Edge fades for horizontal overflow ─── */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      const left = el.scrollLeft > 4;
      const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
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

  /* ─── "All" returns to the top (works even when already on /menu) ─── */
  function handleAllClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setActiveCategory("all");

    const lenis = (window as Window & {
      __lenis?: { scrollTo: (target: number, options?: { duration?: number }) => void };
    }).__lenis;

    if (lenis) {
      lenis.scrollTo(0, { duration: 0.9 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function renderItem(options: {
    slug: string;
    label: string;
    Icon: LucideIcon;
    count?: number;
    href: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  }) {
    const { slug, label, Icon, count, href, onClick } = options;
    const active = activeCategory === slug;

    return (
      <Link
        key={slug}
        href={href}
        onClick={onClick ?? (() => setActiveCategory(slug))}
        ref={setItemRef(slug)}
        className={cn(
          "relative z-10 flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold whitespace-nowrap transition-colors duration-300",
          active
            ? "text-white"
            : "text-orange-950/55 hover:text-red-700",
        )}
      >
        <Icon
          className={cn(
            "size-4 transition-colors duration-300",
            active ? "text-amber-300" : "text-orange-950/30",
          )}
          aria-hidden="true"
        />
        {label}
        {typeof count === "number" ? (
          <span
            className={cn(
              "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-black tabular-nums transition-colors duration-300",
              active
                ? "bg-white/20 text-white"
                : "bg-orange-900/8 text-orange-950/30",
            )}
          >
            {count}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <div className="sticky top-0 z-50 border-b border-orange-900/8 bg-[#fffbf2]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
        {/* ── Segmented control ── */}
        <div className="relative rounded-full bg-white/75 p-1 ring-1 ring-orange-900/10 shadow-sm">
          {/* Edge fades (only when the track overflows) */}
          <div
            className={cn(
              "pointer-events-none absolute inset-y-1 left-1 z-20 w-8 rounded-l-full bg-gradient-to-r from-white to-transparent transition-opacity duration-300",
              canScrollLeft ? "opacity-100" : "opacity-0",
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute inset-y-1 right-1 z-20 w-8 rounded-r-full bg-gradient-to-l from-white to-transparent transition-opacity duration-300",
              canScrollRight ? "opacity-100" : "opacity-0",
            )}
          />

          <div
            ref={scrollRef}
            className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* Track: relative so the thumb scrolls together with the items. */}
            <div className="relative flex w-max min-w-full items-center gap-1">
              {/* Sliding thumb */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 z-0 rounded-full bg-red-600 shadow-md shadow-red-700/25 transition-[left,width] duration-300 ease-out",
                  thumb ? "opacity-100" : "opacity-0",
                )}
                style={{ left: thumb?.left ?? 0, width: thumb?.width ?? 0 }}
              />

              {renderItem({
                slug: "all",
                label: "All",
                Icon: Sparkles,
                href: "/menu",
                onClick: handleAllClick,
              })}

              {categories.map((category) =>
                renderItem({
                  slug: category.slug,
                  label: category.name,
                  Icon: getCategoryIcon(category.slug),
                  count: category.products.length,
                  href: `/menu#${category.slug}`,
                }),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

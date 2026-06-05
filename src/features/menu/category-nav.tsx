"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { MenuCategory } from "./types";

type CategoryNavProps = {
  categories: MenuCategory[];
};

export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isFloated, setIsFloated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-25% 0px -65% 0px",
        threshold: 0,
      }
    );

    categories.forEach((category) => {
      const el = document.getElementById(category.slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  useEffect(() => {
    const handleScroll = () => {
      setIsFloated(window.scrollY > 350);

      if (window.scrollY < 200) {
        setActiveCategory("all");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Standard Inline Nav (Top) */}
      <div className="border-b border-orange-900/10 bg-[#fff7df]/92 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-4 py-3 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href="/menu"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "shrink-0 rounded-full px-5 py-2 text-sm font-black transition-all",
              activeCategory === "all"
                ? "bg-red-700 text-white shadow-md shadow-red-700/20"
                : "border border-orange-900/15 bg-white/80 text-orange-950 shadow-sm hover:border-red-700 hover:text-red-700"
            )}
          >
            All Items
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/menu#${category.slug}`}
              onClick={() => setActiveCategory(category.slug)}
              className={cn(
                "shrink-0 rounded-full px-5 py-2 text-sm font-black transition-all",
                activeCategory === category.slug
                  ? "bg-red-700 text-white shadow-md shadow-red-700/20"
                  : "border border-orange-900/15 bg-white/80 text-orange-950 shadow-sm hover:border-red-700 hover:text-red-700"
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Advanced Floating Pill Nav (Bottom Center) */}
      <div
        className={cn(
          "fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 overflow-hidden rounded-full border border-white/20 bg-black/80 px-2 py-2 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out",
          isFloated
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-16 opacity-0"
        )}
      >
        <div className="flex max-w-[90vw] gap-1 overflow-x-auto px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-xl">
          <Link
            href="/menu"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-[13px] font-black transition-colors",
              activeCategory === "all"
                ? "bg-amber-400 text-red-950 shadow-md"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/menu#${category.slug}`}
              onClick={() => setActiveCategory(category.slug)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-[13px] font-black transition-colors",
                activeCategory === category.slug
                  ? "bg-amber-400 text-red-950 shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

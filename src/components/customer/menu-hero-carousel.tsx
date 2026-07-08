"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  href: string;
};

// Promo/announcement slides. Text and images are safe to edit freely.
const slides: Slide[] = [
  {
    image: "/assets/products/Burger Barkada Box.png",
    eyebrow: "Barkada Bundle",
    title: "Sulit para sa buong barkada",
    subtitle: "4 burgers, 2 fries, at 4 iced teas.",
    href: "/menu#combos",
  },
  {
    image: "/assets/hero/Wide banner.jpg",
    eyebrow: "Free Delivery",
    title: "Libreng delivery",
    subtitle: "Sa bawat order na ₱500 pataas.",
    href: "/menu",
  },
  {
    image: "/assets/products/Crispy Chicken Sandwich 2026.jpg",
    eyebrow: "New Drop",
    title: "Crispy Chicken Sandwich",
    subtitle: "Bagong crispy, sobrang sarap.",
    href: "/menu",
  },
];

const AUTO_MS = 4500;

export function MenuHeroCarousel() {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = useCallback(
    (next: number) => setIndex((next + count) % count),
    [count],
  );

  // Auto-advance, paused on hover and disabled under reduced-motion.
  useEffect(() => {
    if (paused || count <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  return (
    <div
      data-entrance="4"
      className="relative min-h-[220px] overflow-hidden rounded-xl border border-white/70 shadow-xl shadow-orange-950/10 sm:min-h-[280px]"
      role="group"
      aria-roledescription="carousel"
      aria-label="Promos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        if (touchStartX.current === null) return;
        const dx = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchStartX.current = null;
      }}
    >
      {slides.map((slide, i) => (
        <Link
          key={slide.title}
          href={slide.href}
          aria-hidden={i !== index}
          tabIndex={i === index ? 0 : -1}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            className="object-cover"
            priority={i === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-red-950/85 via-red-950/30 to-transparent" />
          <div className="absolute inset-x-5 bottom-6">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-300">
              {slide.eyebrow}
            </p>
            <p className="mt-1 text-xl font-black leading-tight text-white sm:text-2xl">
              {slide.title}
            </p>
            <p className="mt-1 text-sm font-medium text-white/80">
              {slide.subtitle}
            </p>
          </div>
        </Link>
      ))}

      {/* Dots */}
      <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1.5">
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            aria-label={`Slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => go(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index
                ? "w-5 bg-amber-300"
                : "w-1.5 bg-white/50 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </div>
  );
}

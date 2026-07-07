"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import { useRef, type PointerEvent } from "react";

import { formatPeso } from "@/lib/format";
import { shouldUnoptimizeImage } from "@/lib/image";

type FavoriteCardAccent = {
  label: string;
  imageClass: string;
  tone: string;
};

type FavoriteCardProps = {
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  index: number;
  accent: FavoriteCardAccent;
  href?: string;
};

// Maximum tilt (in degrees) applied at the card edges.
const MAX_TILT = 7;

/**
 * Crowd-favorite card with an interactive, pointer-driven 3D tilt and a
 * cursor-following spotlight. Motion is written to CSS custom properties on the
 * card and eased entirely in CSS, so the animation stays buttery even while the
 * pointer moves. The entrance reveal lives on the outer wrapper so it never
 * competes with the tilt transform.
 */
export function FavoriteCard({
  name,
  description,
  price,
  image,
  index,
  accent,
  href = "/menu",
}: FavoriteCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const frameRef = useRef(0);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    // Measure the (untransformed) wrapper so the tilt never feeds back on itself.
    const rect = event.currentTarget.getBoundingClientRect();
    const px = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
    const py = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);

    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      // Lean the corner nearest the pointer toward the viewer.
      card.style.setProperty("--rx", `${((py - 0.5) * MAX_TILT * 2).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${((0.5 - px) * MAX_TILT * 2).toFixed(2)}deg`);
      card.style.setProperty("--mx", `${(px * 100).toFixed(2)}%`);
      card.style.setProperty("--my", `${(py * 100).toFixed(2)}%`);
    });
  };

  const handlePointerLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
    }
    // Ease back to rest; CSS handles the spring.
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--mx", "50%");
    card.style.setProperty("--my", "50%");
  };

  return (
    <div
      className="favorite-card-reveal h-full"
      data-scroll-reveal
      suppressHydrationWarning
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Link
        ref={cardRef}
        href={href}
        className="favorite-card group relative flex h-full min-h-[470px] flex-col overflow-hidden rounded-lg"
      >
        <div className="favorite-card__media relative min-h-[285px] flex-1 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(min-width: 1280px) 300px, (min-width: 1024px) 280px, (min-width: 640px) 50vw, 100vw"
              unoptimized={shouldUnoptimizeImage(image)}
              className={`object-cover ${accent.imageClass}`}
            />
          ) : null}
          <div className="favorite-card__wash" />
          <div className="favorite-card__spotlight" aria-hidden="true" />
          <span className="favorite-card__badge favorite-card__badge--top">
            <Star className="size-3.5 fill-amber-300" aria-hidden="true" />
            {accent.label}
          </span>
          <span className="favorite-card__rank">0{index + 1}</span>
        </div>
        <div className="favorite-card__content">
          <p className="favorite-card__tone">{accent.tone}</p>
          <p className="text-lg font-black uppercase leading-tight text-white">
            {name}
          </p>
          <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-orange-50/68">
            {description}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3 pt-3">
            <p className="text-xl font-black text-amber-300">
              {formatPeso(price)}
            </p>
            <span className="favorite-card__cta">
              <ChevronRight className="size-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";

type HeroBurgerShowcaseProps = {
  heroImage: string;
  priceLabel: string;
};

type Pose = {
  shiftX: number;
  shiftY: number;
  shineX: number;
  shineY: number;
  tiltX: number;
  tiltY: number;
  scale: number;
};

const defaultPose: Pose = {
  shiftX: 0,
  shiftY: 0,
  shineX: 55,
  shineY: 36,
  tiltX: 0,
  tiltY: 0,
  scale: 1,
};

// Cinematic intro — the showcase swings in tilted and slightly small, then
// eases to rest. Lives in the lerp so it blends seamlessly into the idle drift.
const introPose: Pose = {
  shiftX: 0,
  shiftY: 16,
  shineX: 72,
  shineY: 26,
  tiltX: -8,
  tiltY: 20,
  scale: 0.8,
};

function lerp(current: number, target: number, factor: number) {
  return current + (target - current) * factor;
}

export function HeroBurgerShowcase({
  heroImage,
  priceLabel,
}: HeroBurgerShowcaseProps) {
  const rigRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef<Pose>({ ...defaultPose });
  const currentRef = useRef<Pose>({ ...introPose });
  // Idle weight: 1 = ambient "turntable" drift, 0 = fully pointer-driven.
  const idleRef = useRef(1);
  const idleTargetRef = useRef(1);
  const frameRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      return;
    }

    const tick = (now: number) => {
      const current = currentRef.current;
      const target = targetRef.current;
      const factor = 0.12;

      current.shiftX = lerp(current.shiftX, target.shiftX, factor);
      current.shiftY = lerp(current.shiftY, target.shiftY, factor);
      current.shineX = lerp(current.shineX, target.shineX, factor);
      current.shineY = lerp(current.shineY, target.shineY, factor);
      current.tiltX = lerp(current.tiltX, target.tiltX, factor);
      current.tiltY = lerp(current.tiltY, target.tiltY, factor);
      current.scale = lerp(current.scale, target.scale, factor);

      idleRef.current = lerp(idleRef.current, idleTargetRef.current, 0.05);
      const idle = idleRef.current;

      // Ambient drift so the product always feels alive, like a commercial
      // turntable shot. Fades out smoothly while the pointer is steering.
      const t = now / 1000;
      const ambTiltX = Math.sin(t * 0.55) * 3.4 * idle;
      const ambTiltY = Math.cos(t * 0.4) * 6 * idle;
      const ambShiftX = Math.sin(t * 0.33) * 6 * idle;
      const ambShiftY = Math.cos(t * 0.5) * 4 * idle;

      const rig = rigRef.current;
      if (rig) {
        rig.style.transform = `
          translate3d(${(current.shiftX + ambShiftX).toFixed(1)}px, ${(current.shiftY + ambShiftY).toFixed(1)}px, 0)
          rotateX(${(current.tiltX + ambTiltX).toFixed(2)}deg)
          rotateY(${(current.tiltY + ambTiltY).toFixed(2)}deg)
          scale(${current.scale.toFixed(3)})
        `;
      }

      const shine = shineRef.current;
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${current.shineX.toFixed(1)}% ${current.shineY.toFixed(1)}%, rgb(255 255 255 / 0.34), transparent 32%)`;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    idleTargetRef.current = 0;
    targetRef.current = {
      shiftX: x * 30,
      shiftY: y * 20,
      shineX: x * 100 + 50,
      shineY: y * 100 + 50,
      tiltX: -y * 12,
      tiltY: x * 14,
      scale: 1.04,
    };
  }

  function handlePointerLeave() {
    idleTargetRef.current = 1;
    targetRef.current = { ...defaultPose };
  }

  return (
    <div
      className="hero-showcase absolute inset-0"
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      <div className="hero-showcase__glow" aria-hidden="true" />
      <div
        className="hero-showcase__steam hero-showcase__steam--one"
        aria-hidden="true"
      />
      <div
        className="hero-showcase__steam hero-showcase__steam--two"
        aria-hidden="true"
      />
      <div className="hero-showcase__orbit hero-showcase__orbit--one" aria-hidden="true" />
      <div className="hero-showcase__orbit hero-showcase__orbit--two" aria-hidden="true" />
      <div className="hero-showcase__shadow" aria-hidden="true" />

      <div ref={rigRef} className="hero-showcase__rig">
        {/* Rotating spotlight rays behind the burger */}
        <div className="hero-showcase__rays" aria-hidden="true" />

        <div className="hero-showcase__burger">
          <Image
            src={heroImage}
            alt="Kanto Burger Co. stacked burger"
            fill
            sizes="(min-width: 1280px) 660px, (min-width: 1024px) 54vw, 92vw"
            className="hero-showcase__main object-contain"
            priority
            draggable={false}
          />
          <span ref={shineRef} className="hero-showcase__shine" aria-hidden="true" />
          <span className="hero-showcase__depth hero-showcase__depth--one" aria-hidden="true" />
          <span className="hero-showcase__depth hero-showcase__depth--two" aria-hidden="true" />
        </div>

        {/* Twinkling sparkle accents */}
        <span className="hero-spark hero-spark--1" aria-hidden="true" />
        <span className="hero-spark hero-spark--2" aria-hidden="true" />
        <span className="hero-spark hero-spark--3" aria-hidden="true" />
        <span className="hero-spark hero-spark--4" aria-hidden="true" />
      </div>

      <div className="hero-price-badge price-flip absolute right-[4%] top-[16%] z-30 sm:right-[8%] lg:right-[2%] lg:top-[18%]">
        <div className="price-flip__inner relative h-20 w-32">
          {/* Front — the price */}
          <div className="price-flip__face price-flip__front deal-shimmer overflow-hidden rounded-lg bg-amber-300 p-3 text-center shadow-xl shadow-amber-950/25 ring-1 ring-white/55">
            <div className="relative z-20 grid place-items-center">
              <p className="text-xs font-black uppercase text-red-900">From</p>
              <p className="whitespace-nowrap text-[1.35rem] font-black leading-none text-red-900">
                {priceLabel}
              </p>
            </div>
          </div>
          {/* Back — the hook */}
          <div className="price-flip__face price-flip__back deal-shimmer overflow-hidden rounded-lg bg-amber-300 p-3 text-center shadow-xl shadow-amber-950/25 ring-1 ring-white/55">
            <div className="relative z-20 grid place-items-center px-1">
              <p className="text-[0.95rem] font-black uppercase leading-tight text-red-900">
                Hot Suit Deal!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

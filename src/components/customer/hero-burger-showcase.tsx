"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";

type HeroBurgerShowcaseProps = {
  heroImage: string;
  priceLabel: string;
};

const defaultPose = {
  shiftX: 0,
  shiftY: 0,
  shineX: 55,
  shineY: 36,
  tiltX: 0,
  tiltY: 0,
  scale: 1,
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
  const targetRef = useRef(defaultPose);
  const currentRef = useRef(defaultPose);
  const frameRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      return;
    }

    const tick = () => {
      const current = currentRef.current;
      const target = targetRef.current;
      const factor = 0.14;

      current.shiftX = lerp(current.shiftX, target.shiftX, factor);
      current.shiftY = lerp(current.shiftY, target.shiftY, factor);
      current.shineX = lerp(current.shineX, target.shineX, factor);
      current.shineY = lerp(current.shineY, target.shineY, factor);
      current.tiltX = lerp(current.tiltX, target.tiltX, factor);
      current.tiltY = lerp(current.tiltY, target.tiltY, factor);
      current.scale = lerp(current.scale, target.scale, factor);

      const rig = rigRef.current;
      if (rig) {
        rig.style.transform = `
          translate3d(${current.shiftX.toFixed(1)}px, ${current.shiftY.toFixed(1)}px, 0)
          rotateX(${current.tiltX.toFixed(2)}deg)
          rotateY(${current.tiltY.toFixed(2)}deg)
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

  function setTarget(pose: typeof defaultPose) {
    targetRef.current = pose;
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    setTarget({
      shiftX: x * 26,
      shiftY: y * 18,
      shineX: x * 100 + 50,
      shineY: y * 100 + 50,
      tiltX: -y * 10,
      tiltY: x * 12,
      scale: 1.03,
    });
  }

  function handlePointerLeave() {
    setTarget(defaultPose);
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
      </div>

      <div className="hero-price-badge absolute right-[4%] top-[16%] z-30 sm:right-[8%] lg:right-[2%] lg:top-[18%]">
        <div className="deal-shimmer relative grid h-20 w-32 place-items-center overflow-hidden rounded-lg bg-amber-300 p-3 text-center shadow-xl shadow-amber-950/25 ring-1 ring-white/55">
          <div className="relative z-20 grid place-items-center">
            <p className="text-xs font-black uppercase text-red-900">From</p>
            <p className="whitespace-nowrap text-[1.35rem] font-black leading-none text-red-900">
              {priceLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

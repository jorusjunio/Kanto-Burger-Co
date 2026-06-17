"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { CustomerTopBar } from "@/components/customer/customer-top-bar";

const HEADER_HEIGHT = 56; // h-14
const MARGIN = 16; // top-4 / bottom-4

/**
 * Customer top bar positioning.
 *
 * - On `/menu` the bar is permanently docked to the bottom-right corner with
 *   no animation and no transition — it is simply fixed there from first paint.
 * - On every other page (except the landing `/`) it flicks from the top-right
 *   to the bottom-right as the user scrolls past the hero.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Decide the header on the CLIENT only. During static prerender and ISR
  // regeneration on the server, `usePathname()` can return null instead of the
  // real route — which would otherwise bake the floating nav into the home
  // page's HTML, where it must never appear. Rendering nothing until mounted
  // guarantees the correct header per route and keeps server HTML header-free.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (pathname === "/") {
    return null;
  }

  // Menu page: static, fixed bottom-right. No scroll listener, no transform,
  // no transition — nothing to animate.
  if (pathname === "/menu") {
    return (
      <header className="fixed z-40 bottom-4 right-4 sm:right-8 lg:right-12">
        <CustomerTopBar />
      </header>
    );
  }

  return <ScrollAwareHeader />;
}

/**
 * Smoothly animate the top bar from top-right to bottom-right when scrolling
 * down past the hero. Uses translateY with a spring-like cubic-bezier for a
 * polished "flick" effect.
 */
function ScrollAwareHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [translateYPx, setTranslateYPx] = useState(0);
  const prevScrolledRef = useRef(
    typeof window !== "undefined" ? window.scrollY > 200 : false,
  );
  const hasMountedRef = useRef(false);
  const [animPhase, setAnimPhase] = useState<
    "idle" | "going-down" | "going-up"
  >("idle");

  /* ── Scroll listener ── */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Calculate translateY on resize ── */
  const calcTranslateY = useCallback(() => {
    setTranslateYPx(window.innerHeight - HEADER_HEIGHT - MARGIN * 2);
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    hasMountedRef.current = true;
    calcTranslateY();
    window.addEventListener("resize", calcTranslateY);
    return () => window.removeEventListener("resize", calcTranslateY);
  }, [calcTranslateY]);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* ── Animate on scroll threshold change ── */
  useEffect(() => {
    // Skip animation on initial mount to avoid unwanted entrance
    if (!hasMountedRef.current) return;
    if (prevScrolledRef.current === isScrolled) return;

    // Update immediately so rapid scrolls are handled correctly
    prevScrolledRef.current = isScrolled;

    setAnimPhase(isScrolled ? "going-down" : "going-up");
    const timer = setTimeout(() => setAnimPhase("idle"), 600);
    return () => clearTimeout(timer);
  }, [isScrolled]);

  return (
    <header
      className="fixed z-40 top-4 right-4 sm:right-8 lg:right-12"
      style={
        animPhase !== "idle"
          ? ({
              animation:
                animPhase === "going-down"
                  ? "header-slide-down 600ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
                  : "header-slide-up 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards",
              "--header-target-y": `${translateYPx}px`,
            } as React.CSSProperties)
          : // At idle, use translateY for position to avoid snap
            {
              transform: isScrolled
                ? `translateY(${translateYPx}px)`
                : "translateY(0)",
              transition:
                "transform 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease",
            }
      }
    >
      <CustomerTopBar />
    </header>
  );
}

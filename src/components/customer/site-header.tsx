"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { CustomerTopBar } from "@/components/customer/customer-top-bar";
import { cn } from "@/lib/utils";

const HEADER_HEIGHT = 56; // h-14
const MARGIN = 16; // top-4 / bottom-4

/**
 * Smoothly animate the top bar from top-right to bottom-right when scrolling
 * down past the hero. Uses translateY with a spring-like cubic-bezier for a
 * polished "flick" effect.
 */
export function SiteHeader() {
  const pathname = usePathname();
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

  useEffect(() => {
    hasMountedRef.current = true;
    calcTranslateY();
    window.addEventListener("resize", calcTranslateY);
    return () => window.removeEventListener("resize", calcTranslateY);
  }, [calcTranslateY]);

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

  if (pathname === "/") {
    return null;
  }

  return (
    <header
      className={cn(
        "fixed z-40 top-4 right-4 sm:right-8 lg:right-12",
      )}
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

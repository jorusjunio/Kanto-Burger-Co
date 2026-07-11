"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

function canElementScroll(element: HTMLElement | null) {
  let current = element;

  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const canScrollY =
      /(auto|scroll)/.test(style.overflowY) &&
      current.scrollHeight > current.clientHeight;

    if (canScrollY) {
      return true;
    }

    current = current.parentElement;
  }

  return false;
}

export function SmoothScroll() {
  const pathname = usePathname();
  const enableLenis = true;

  useEffect(() => {
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-scroll-reveal]"),
    );
    const revealObserver =
      revealElements.length > 0
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.setAttribute("data-scroll-visible", "");
                } else {
                  entry.target.removeAttribute("data-scroll-visible");
                }
              });
            },
            {
              rootMargin: "0px 0px -8% 0px",
              threshold: 0.05,
            },
          )
        : null;

    revealElements.forEach((element, index) => {
      // Only auto-assign delay if the element doesn't have a custom one
      if (!element.style.getPropertyValue("--reveal-delay")) {
        element.style.setProperty(
          "--reveal-delay",
          `${Math.min(index * 45, 270)}ms`,
        );
      }
      revealObserver?.observe(element);
    });

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      revealElements.forEach((element) => {
        element.setAttribute("data-scroll-visible", "");
      });

      return () => {
        revealObserver?.disconnect();
      };
    }

    if (!enableLenis) {
      return () => {
        revealObserver?.disconnect();
      };
    }

    const lenis = new Lenis({
      duration: 0.92,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      smoothWheel: true,
      wheelMultiplier: 0.78,
      touchMultiplier: 1.05,
      anchors: true,
      prevent: canElementScroll,
      // Measure the BODY, not <html>: html has `h-full`, so its box never grows
      // with content and Lenis's ResizeObserver never fires — leaving a stale
      // scroll limit (e.g. frozen scrolling after checkout → menu navigation).
      // The body grows with content, so auto-resize works as intended.
      content: document.body,
    });

    // Expose the instance so components (e.g. category nav "All") can drive
    // smooth programmatic scrolls without fighting Lenis.
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    const stopSmoothScroll = () => lenis.stop();
    const startSmoothScroll = () => lenis.start();
    let frameId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);
    window.addEventListener("project-preview-open", stopSmoothScroll);
    window.addEventListener("project-preview-close", startSmoothScroll);

    return () => {
      revealObserver?.disconnect();
      window.removeEventListener("project-preview-open", stopSmoothScroll);
      window.removeEventListener("project-preview-close", startSmoothScroll);
      cancelAnimationFrame(frameId);
      delete (window as Window & { __lenis?: Lenis }).__lenis;
      lenis.destroy();
    };
  }, [pathname, enableLenis]);

  return null;
}

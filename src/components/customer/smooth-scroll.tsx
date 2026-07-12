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
    document.documentElement.classList.add("has-scroll-reveal");

    const observedRevealElements = new Set<HTMLElement>();
    const markIfInViewport = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const isVisible =
        rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

      if (isVisible || !revealObserver) {
        element.setAttribute("data-scroll-visible", "");
      }
    };

    const revealObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
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
        );

    const observeRevealElements = () => {
      const revealElements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-scroll-reveal]"),
      );

      revealElements.forEach((element, index) => {
        if (observedRevealElements.has(element)) {
          return;
        }

        observedRevealElements.add(element);

        // Only auto-assign delay if the element doesn't have a custom one
        if (!element.style.getPropertyValue("--reveal-delay")) {
          element.style.setProperty(
            "--reveal-delay",
            `${Math.min(index * 45, 270)}ms`,
          );
        }

        revealObserver?.observe(element);
        markIfInViewport(element);
      });
    };

    observeRevealElements();

    const revealScanTimers = [100, 400, 900, 1800].map((delay) =>
      window.setTimeout(observeRevealElements, delay),
    );

    const mutationObserver =
      typeof MutationObserver === "undefined"
        ? null
        : new MutationObserver(() => {
          observeRevealElements();
        });

    mutationObserver?.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      observedRevealElements.forEach((element) => {
        element.setAttribute("data-scroll-visible", "");
      });

      return () => {
        revealScanTimers.forEach(window.clearTimeout);
        revealObserver?.disconnect();
        mutationObserver?.disconnect();
        document.documentElement.classList.remove("has-scroll-reveal");
      };
    }

    if (!enableLenis) {
      return () => {
        revealScanTimers.forEach(window.clearTimeout);
        revealObserver?.disconnect();
        mutationObserver?.disconnect();
        document.documentElement.classList.remove("has-scroll-reveal");
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
      revealScanTimers.forEach(window.clearTimeout);
      revealObserver?.disconnect();
      mutationObserver?.disconnect();
      document.documentElement.classList.remove("has-scroll-reveal");
      window.removeEventListener("project-preview-open", stopSmoothScroll);
      window.removeEventListener("project-preview-close", startSmoothScroll);
      cancelAnimationFrame(frameId);
      delete (window as Window & { __lenis?: Lenis }).__lenis;
      lenis.destroy();
    };
  }, [pathname, enableLenis]);

  return null;
}

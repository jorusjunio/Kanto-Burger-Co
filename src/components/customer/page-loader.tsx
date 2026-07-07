"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Routes that trigger the cinematic loading screen on initial/direct load
const LOADING_ROUTES = new Set(["/"]);

export function PageLoader() {
  const pathname = usePathname();
  const prevPathname = useRef<string | null>(null);

  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<
    "idle" | "enter" | "hold" | "exit" | "done"
  >("idle");
  const [progress, setProgress] = useState(0);

  const rafRef = useRef<number>(0);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    cancelAnimationFrame(rafRef.current);
  }, []);

  const timer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timerRefs.current.push(id);
    return id;
  }, []);

  // Smooth progress using requestAnimationFrame for jank-free interpolation
  const animateProgress = useCallback(
    (from: number, to: number, duration: number, onDone?: () => void) => {
      const start = performance.now();
      const step = (now: number) => {
        const elapsed = now - start;
        // Ease out cubic for silky deceleration
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setProgress(from + (to - from) * eased);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          onDone?.();
        }
      };
      rafRef.current = requestAnimationFrame(step);
    },
    [],
  );

  // Full teardown of the loader. Safe to call at any point — clears pending
  // timers, removes the overlay, and drops the is-page-loading class so the
  // full-screen loader can never stay stuck and block scrolling/clicks.
  const dismiss = useCallback(() => {
    clearTimers();
    document.documentElement.classList.remove("is-page-loading");
    setVisible(false);
    setPhase("idle");
    setProgress(0);
  }, [clearTimers]);

  const runLoader = useCallback((isMenu: boolean) => {
    clearTimers();
    setProgress(0);
    setPhase("enter");
    setVisible(true);
    document.documentElement.classList.add("is-page-loading");

    // Failsafe: guarantee teardown even if an animation callback is ever
    // dropped, so the overlay can't get stuck. Fires safely after the normal
    // completion window for each variant.
    timer(() => dismiss(), isMenu ? 2600 : 3600);

    if (isMenu) {
      // Menu timings: ~1000ms load + 500ms exit = ~1.5s total
      timer(() => {
        animateProgress(0, 70, 300, () => {
          animateProgress(70, 90, 400, () => {
            setPhase("hold");
            timer(() => {
              animateProgress(90, 100, 150, () => {
                setPhase("exit");
                timer(() => {
                  setPhase("done");
                  timer(() => {
                    setVisible(false);
                    setPhase("idle");
                    setProgress(0);
                    document.documentElement.classList.remove("is-page-loading");
                  }, 520); // 500ms CSS exit duration
                }, 40);
              });
            }, 100);
          });
        });
      }, 50);
    } else {
      // Home timings: ~1600ms load + 1000ms exit = ~2.6s total
      timer(() => {
        animateProgress(0, 70, 450, () => {
          animateProgress(70, 90, 600, () => {
            setPhase("hold");
            timer(() => {
              animateProgress(90, 100, 200, () => {
                setPhase("exit");
                timer(() => {
                  setPhase("done");
                  timer(() => {
                    setVisible(false);
                    setPhase("idle");
                    setProgress(0);
                    document.documentElement.classList.remove("is-page-loading");
                  }, 1020); // 1000ms CSS exit duration
                }, 40);
              });
            }, 300);
          });
        });
      }, 50);
    }
  }, [clearTimers, timer, animateProgress, dismiss]);

  // Initial page load
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (LOADING_ROUTES.has(pathname)) {
      runLoader(pathname === "/menu");
    }
    return clearTimers;
  }, [pathname, runLoader, clearTimers]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Route changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (prevPathname.current === null) {
      prevPathname.current = pathname;
      return;
    }
    if (prevPathname.current !== pathname) {
      if (pathname === "/") {
        runLoader(false);
      } else if (pathname === "/menu" && prevPathname.current === "/") {
        // Menu loader only when navigating from the home page
        runLoader(true);
      } else {
        // Navigated to a route that shows no loader — tear down any loader that
        // was still animating on the previous route, otherwise its stuck
        // overlay would block scrolling and clicks on the new page.
        dismiss();
      }
    }
    prevPathname.current = pathname;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!visible) return null;

  const isMenu = pathname === "/menu";

  return (
    <div
      aria-hidden="true"
      className="page-loader"
      data-phase={phase}
      data-variant={isMenu ? "menu" : "home"}
    >
      <div className="page-loader__backdrop" />

      <div className="page-loader__center">
        {isMenu ? (
          <div className="page-loader__menu-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-amber-400"
            >
              <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
              <path d="M7 2v20" />
              <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
            </svg>
          </div>
        ) : (
          <>
            <p className="page-loader__logo">
              <span className="page-loader__logo-kanto">Kanto</span>
              <span className="page-loader__logo-burger">Burger Co.</span>
            </p>
            <p className="page-loader__tagline">Hot, fresh &amp; made for you</p>
          </>
        )}
      </div>

      <div className="page-loader__track">
        <div
          className="page-loader__bar"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
    </div>
  );
}

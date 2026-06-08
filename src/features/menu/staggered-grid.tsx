"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type StaggeredGridProps = {
  children: ReactNode;
  className?: string;
};

export function StaggeredGrid({ children, className }: StaggeredGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={(child as React.ReactElement).key ?? index}
              className={cn(
                "menu-card-enter",
                isVisible && "menu-card-enter--visible",
              )}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}

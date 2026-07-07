import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

interface NotFoundStateProps {
  title?: string;
  description?: string;
  /** Primary action destination. */
  href?: string;
  actionLabel?: string;
}

/**
 * Shared presentational 404 body. Server component — reused by every
 * route-group `not-found.tsx` so the empty states stay visually consistent.
 */
export function NotFoundState({
  title = "Page not found",
  description = "The page you're looking for doesn't exist or may have moved. Let's get you back on track.",
  href = "/",
  actionLabel = "Back to home",
}: NotFoundStateProps) {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <span className="mb-6 inline-flex size-16 items-center justify-center rounded-full border border-foreground/10 bg-muted text-muted-foreground">
          <Compass className="size-7" />
        </span>

        <p className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-primary">
          404
        </p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-foreground lg:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          {description}
        </p>

        <Button asChild className="mt-8" size="lg">
          <Link href={href}>{actionLabel}</Link>
        </Button>
      </div>
    </div>
  );
}

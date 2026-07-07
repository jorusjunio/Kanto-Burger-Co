"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  /** The error thrown during render — logged for observability. */
  error: Error & { digest?: string };
  /** Re-renders the failed segment. Provided by Next.js error boundaries. */
  reset: () => void;
  title?: string;
  description?: string;
  /** Where the error occurred, used to tag the console log. */
  scope?: string;
}

/**
 * Shared presentational error boundary body. Kept UI-only and dependency-light
 * so it can be reused by every route-group `error.tsx` without duplicating the
 * layout/log/reset wiring.
 */
export function ErrorState({
  error,
  reset,
  title = "Something went wrong",
  description = "We hit a snag loading this page. Please try again — if it keeps happening, come back in a little while.",
  scope = "app",
}: ErrorStateProps) {
  useEffect(() => {
    // Client-side boundary: surface to the browser console (and any attached
    // monitoring) with a scope tag. Server logging stays in the server actions.
    console.error(`[error-boundary:${scope}]`, error);
  }, [error, scope]);

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center px-4 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <span className="mb-6 inline-flex size-16 items-center justify-center rounded-full border border-destructive/20 bg-destructive/10 text-destructive">
          <AlertTriangle className="size-7" />
        </span>

        <h1 className="text-2xl font-black uppercase tracking-tight text-foreground lg:text-3xl">
          {title}
        </h1>
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          {description}
        </p>

        {error.digest ? (
          <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground/60">
            Ref: {error.digest}
          </p>
        ) : null}

        <Button onClick={reset} className="mt-8" size="lg">
          <RotateCcw />
          Try Again
        </Button>
      </div>
    </div>
  );
}

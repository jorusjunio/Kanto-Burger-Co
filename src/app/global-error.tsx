"use client";

import { ErrorState } from "@/components/feedback/error-state";
import "./globals.css";

/**
 * Last-resort boundary. Fires only when the root layout itself throws, so it
 * must render its own <html>/<body> — the normal layout (fonts, providers) is
 * bypassed entirely.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <ErrorState
          error={error}
          reset={reset}
          scope="global"
          title="Something broke"
          description="The app ran into an unexpected error. Please try again — we're on it if this keeps happening."
        />
      </body>
    </html>
  );
}

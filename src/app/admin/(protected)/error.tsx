"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      error={error}
      reset={reset}
      scope="admin"
      description="We couldn't load this part of the dashboard. Try again, or refresh if the problem persists."
    />
  );
}

"use client";

import { ErrorState } from "@/components/feedback/error-state";

export default function CustomerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState error={error} reset={reset} scope="customer" />;
}

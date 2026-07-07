import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level fallback for the customer surface. Keeps navigation instant while
 * RSC data streams in — a lightweight menu-grid skeleton on the cream shell.
 */
export default function CustomerLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 overflow-hidden rounded-xl bg-card p-4 ring-1 ring-foreground/10"
          >
            <Skeleton className="aspect-[4/3] w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="mt-2 flex items-center justify-between">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-9 w-24 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

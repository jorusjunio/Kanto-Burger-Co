import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level fallback for admin pages. Renders inside the protected layout
 * (sidebar + header already present), so this only skeletons the page body:
 * a stat row plus a table-like block that fits every dashboard view.
 */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-xl bg-card p-5 ring-1 ring-foreground/10"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <Skeleton className="h-6 w-40" />
        <div className="mt-6 flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-5 flex-1" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

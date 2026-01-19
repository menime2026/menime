import { Skeleton } from "@/components/ui/skeleton";

export function WishlistSkeleton() {
  return (
    <div className="grid gap-x-8 gap-y-16 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          {/* Image Skeleton */}
          <Skeleton className="aspect-3/4 w-full rounded-sm" />

          {/* Details Skeleton */}
          <div className="space-y-3">
            <div className="space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-10 w-full rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

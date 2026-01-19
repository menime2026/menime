import { Skeleton } from "@/components/ui/skeleton";

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-4">
          {/* Image skeleton */}
          <div className="aspect-3/4 w-full overflow-hidden bg-slate-100">
            <Skeleton className="h-full w-full" />
          </div>

          {/* Content skeleton */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

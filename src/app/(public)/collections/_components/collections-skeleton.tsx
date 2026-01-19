import { Skeleton } from "@/components/ui/skeleton";

export function CollectionsSkeleton() {
  return (
    <div className="grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-16">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="relative aspect-3/4 w-full overflow-hidden bg-slate-100">
          <Skeleton className="h-full w-full" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="inline-block bg-white/90 px-6 py-4">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NestedCollectionsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="aspect-square w-full overflow-hidden bg-slate-100">
            <Skeleton className="h-full w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

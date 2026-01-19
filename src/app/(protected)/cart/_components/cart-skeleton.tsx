import { Skeleton } from "@/components/ui/skeleton";

export function CartSkeleton() {
  return (
    <div className="grid gap-16 lg:grid-cols-[1.5fr_0.8fr] lg:items-start">
      <div className="space-y-0 divide-y divide-slate-100">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="py-8 first:pt-0 flex gap-6">
            {/* Image Skeleton */}
            <Skeleton className="aspect-3/4 w-24 shrink-0 rounded-sm" />

            {/* Details Skeleton */}
            <div className="flex flex-1 flex-col justify-between py-1">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-3/4 max-w-[200px]" />
                  <div className="flex gap-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>

              <div className="flex items-end justify-between mt-4">
                <Skeleton className="h-8 w-20" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Skeleton */}
      <aside className="lg:sticky lg:top-24 space-y-8 bg-slate-50/50 p-8 rounded-sm">
        <Skeleton className="h-6 w-40" />

        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-2">
          <div className="flex justify-between items-baseline">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-3 w-48" />
        </div>

        <Skeleton className="h-14 w-full rounded-sm" />
        <Skeleton className="h-3 w-40 mx-auto" />
      </aside>
    </div>
  );
}

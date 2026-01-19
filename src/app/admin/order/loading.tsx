import { Skeleton } from "@/components/ui/skeleton";

export default function OrderLoading() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="mt-2 h-6 w-96" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Orders List */}
        <div className="lg:col-span-8">
          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
            <div className="mb-8 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>

            {/* Table Skeleton */}
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <div className="bg-slate-50/50 px-6 py-4">
                 <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-16" />
                 </div>
              </div>
              <div className="divide-y divide-slate-100">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-4 items-center gap-4 px-6 py-4">
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Details & Summary */}
        <div className="space-y-8 lg:col-span-4">
          {/* Order Details Form Skeleton */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
             <Skeleton className="h-6 w-32" />
             <Skeleton className="mt-2 h-4 w-48" />

             <div className="mt-8 space-y-6">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <Skeleton className="h-12 w-24 rounded-full" />
                    <Skeleton className="h-12 w-32 rounded-full" />
                </div>
             </div>
          </div>

          {/* Summary Skeleton */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
            <Skeleton className="h-3 w-20" />
            <div className="mt-6 space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between">
                    <Skeleton className="h-4 w-10" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-24" />
                </div>
                 <div className="flex justify-between pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            <div className="mt-8 grid gap-6">
                <div className="space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-16 w-full" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-16 w-full" />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function ReportLoading() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="mt-2 h-6 w-96" />
      </div>

      {/* KPI Grid */}
      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[2.5rem] bg-white p-8 shadow-sm">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-10 w-32" />
            <Skeleton className="mt-1 h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Revenue Trend & Fulfillment Mix */}
      <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">
        {/* Revenue Trend */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="mt-8 space-y-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="mt-3 h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Fulfillment Mix */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
          <Skeleton className="h-3 w-32" />
          <div className="mt-8 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Products & Collections */}
      <div className="grid gap-8 xl:grid-cols-2">
        {/* Top Products */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
          <Skeleton className="h-3 w-32" />
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-100">
            <div className="bg-slate-50/50 px-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid grid-cols-3 items-center gap-4 px-6 py-4">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collection Performance */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
          <Skeleton className="h-3 w-40" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Customers & Recent Orders */}
      <div className="grid gap-8 xl:grid-cols-2">
        {/* New Customers */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
          <Skeleton className="h-3 w-32" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
          <Skeleton className="h-3 w-32" />
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-100">
            <div className="bg-slate-50/50 px-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid grid-cols-3 items-center gap-4 px-6 py-4">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

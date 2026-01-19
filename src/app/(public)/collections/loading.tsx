import { Skeleton } from "@/components/ui/skeleton";
import { CollectionsSkeleton, NestedCollectionsSkeleton } from "./_components/collections-skeleton";

export default function CollectionsLoading() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Skeleton */}
      <section className="relative flex min-h-[40vh] flex-col items-center justify-center bg-slate-50 px-6 py-20 text-center">
        <Skeleton className="h-16 w-64 md:h-24 md:w-96" />
        <Skeleton className="mt-6 h-6 w-64 max-w-lg sm:w-96" />
      </section>

      {/* Main Collections Grid Skeleton */}
      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
        <CollectionsSkeleton />
      </section>

      {/* Nested Collections Skeleton */}
      <section className="mx-auto max-w-7xl px-6 py-16 border-t border-slate-100">
        <div className="mb-10 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        <NestedCollectionsSkeleton />
      </section>
    </div>
  );
}

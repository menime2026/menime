import { ProductGridSkeleton } from "./_components/product-grid-skeleton";

export default function ProductsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Hero Skeleton */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-2xl space-y-6">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-12 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200" />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl flex-1 px-6 py-16">
        <ProductGridSkeleton />
      </section>
    </div>
  );
}

import { ProductGridSkeleton } from "@/components/collections/product-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CollectionLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section Skeleton */}
      <section className="relative flex min-h-[30vh] flex-col items-center justify-center bg-slate-50 px-6 py-16 text-center">
        <Skeleton className="h-12 w-64 md:h-16 md:w-96" />
        <Skeleton className="mt-4 h-6 w-full max-w-lg" />
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Toolbar Skeleton */}
        <div className="sticky top-20 z-30 mb-8 flex items-center justify-between border-b border-slate-100 bg-white/80 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              disabled
              className="flex items-center gap-2 rounded-full border-slate-200 px-6 font-medium uppercase tracking-wider opacity-50"
            >
              <Sliders className="h-4 w-4" />
              Filters
            </Button>
            <div className="hidden lg:flex gap-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Skeleton className="hidden h-5 w-24 sm:inline-block" />
            <div className="hidden sm:block">
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <ProductGridSkeleton />
      </main>
    </div>
  );
}

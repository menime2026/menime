"use client";

import { FilterChips } from "@/components/collections/filter-chips";
import { FilterPanel } from "@/components/collections/filter-panel";
import { ProductGridSkeleton } from "@/components/collections/product-grid-skeleton";
import { SortDropdown } from "@/components/collections/sort-dropdown";
import StorefrontProductCard from "@/components/storefront/product-card";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { StorefrontCollection, StorefrontProduct } from "@/lib/storefront/catalog";
import { Settings2, Sliders, X, ChevronDown } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FALLBACK_FEATURED_CATEGORIES = ["JEANS", "T-SHIRTS", "JACKETS", "SHIRTS", "SWEATSHIRT"];

type Filters = {
  category: string[];
  size: string[];
  discount: string[];
  color: string[];
  price: [number, number];
  fit: string[];
  style: string[];
};

type CollectionPageClientProps = {
  collection: StorefrontCollection;
  childrenCollections: StorefrontCollection[];
  products: StorefrontProduct[];
};

const createDefaultFilters = (): Filters => ({
  category: [],
  size: [],
  discount: [],
  color: [],
  price: [0, 100000] as [number, number],
  fit: [],
  style: [],
});

const formatCategory = (value: string) => value.trim().toUpperCase();

export function CollectionPageClient({ collection, childrenCollections, products }: CollectionPageClientProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState<Filters>(createDefaultFilters);
  const [isPending, startTransition] = useTransition();

  const derivedCategories = childrenCollections.length
    ? childrenCollections.map((child) => formatCategory(child.name))
    : FALLBACK_FEATURED_CATEGORIES;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (filters.category.length > 0) {
        // Check if any of the product's collections match the selected categories
        const hasMatchingCategory = product.collections.some(c =>
          filters.category.includes(formatCategory(c.name))
        );
        if (!hasMatchingCategory) {
          return false;
        }
      }

      if (filters.price && (product.price < filters.price[0] || product.price > filters.price[1])) {
        return false;
      }

      return true;
    });
  }, [filters, products]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price);
      case "a-z":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "z-a":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "newest":
        return sorted.sort((a, b) => {
          const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bDate - aDate;
        });
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  const handleClearFilters = () => {
    startTransition(() => {
      setFilters(createDefaultFilters());
    });
  };

  const handleApplyFilters = () => {
    setIsFilterOpen(false);
  };

  const handleSortChange = (newSortBy: string) => {
    startTransition(() => {
      setSortBy(newSortBy);
    });
  };

  const handleCategoryToggle = (category: string) => {
    const normalized = formatCategory(category);
    startTransition(() => {
      setFilters((prev) => ({
        ...prev,
        category: prev.category.includes(normalized)
          ? prev.category.filter((cat) => cat !== normalized)
          : [...prev.category, normalized],
      }));
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative flex min-h-[30vh] flex-col items-center justify-center bg-slate-50 px-6 py-16 text-center">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 md:text-6xl lg:text-7xl">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="mt-4 max-w-2xl text-lg font-light text-slate-600">
            {collection.description}
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {derivedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryToggle(cat)}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition",
                filters.category.includes(cat)
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-900 hover:border-slate-900"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Toolbar */}
        <div className="sticky top-20 z-30 mb-8 flex items-center justify-between border-b border-slate-100 bg-white/80 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-2 rounded-full border-slate-200 px-6 font-medium uppercase tracking-wider hover:bg-slate-50"
            >
              <Sliders className="h-4 w-4" />
              Filters
            </Button>
            <div className="hidden lg:block">
              <FilterChips filters={filters} setFilters={setFilters} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm font-medium text-slate-500 sm:inline-block">
              {sortedProducts.length} Products
            </span>
            <div className="hidden sm:block">
              <SortDropdown sortBy={sortBy} setSortBy={handleSortChange} />
            </div>
          </div>
        </div>

        {/* Mobile Sort & Filter Bar (Fixed Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-2 border-t border-slate-200 bg-white sm:hidden">
          <Button
            variant="ghost"
            onClick={() => setIsFilterOpen(true)}
            className="flex h-16 items-center justify-center gap-2 rounded-none border-r border-slate-200 text-xs font-bold uppercase tracking-widest"
          >
            <Sliders className="h-4 w-4" />
            Filter
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-16 items-center justify-center gap-2 rounded-none text-xs font-bold uppercase tracking-widest"
              >
                <Settings2 className="h-4 w-4" />
                Sort
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-3xl">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="text-sm font-bold uppercase tracking-widest">Sort By</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Featured", value: "featured" },
                  { label: "Price: Low to High", value: "price-low" },
                  { label: "Price: High to Low", value: "price-high" },
                  { label: "Newest First", value: "newest" },
                ].map((option) => (
                  <SheetClose asChild key={option.value}>
                    <button
                      onClick={() => handleSortChange(option.value)}
                      className={cn(
                        "flex items-center justify-between rounded-lg p-4 text-left text-sm font-medium transition",
                        sortBy === option.value ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                      {option.label}
                      {sortBy === option.value && <div className="h-2 w-2 rounded-full bg-slate-900" />}
                    </button>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Filter Sheet */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetContent side="left" className="w-full max-w-md p-0 sm:max-w-md">
            <SheetHeader className="border-b border-slate-100 px-6 py-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-sm font-bold uppercase tracking-widest">Filters</SheetTitle>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>
            <div className="h-[calc(100vh-80px)] overflow-y-auto px-6 py-6">
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                onClear={handleClearFilters}
                isMobile
                onApply={handleApplyFilters}
                title={collection.name}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Product Grid */}
        <div className="min-h-[50vh]">
          {isPending ? (
            <ProductGridSkeleton />
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {sortedProducts.map((product) => (
                <StorefrontProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
              <h3 className="text-lg font-medium text-slate-900">No products found</h3>
              <p className="mt-2 text-slate-500">Try adjusting your filters or check back later.</p>
              <Button variant="link" onClick={handleClearFilters} className="mt-4 text-slate-900">
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

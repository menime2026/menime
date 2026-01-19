"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/format";

interface SearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Reset query when sheet is closed
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebouncedQuery("");
    }
  }, [open]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return { results: [] };
      const res = await fetch(`/api/storefront/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: debouncedQuery.length >= 2,
  });

  const products = data?.results || [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="w-full h-[80vh] sm:h-[600px] p-0 flex flex-col bg-white">
        <SheetHeader className="px-4 py-4 border-b border-gray-200">
          <SheetTitle className="sr-only">Search</SheetTitle>
          <SheetDescription className="sr-only">Search for products</SheetDescription>
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 max-w-7xl mx-auto w-full">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="flex-1 text-lg outline-none placeholder:text-gray-400 bg-transparent"
              autoFocus
            />
            {/* <SheetClose className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </SheetClose> */}
          </form>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          <div className="max-w-7xl mx-auto w-full">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : query.length > 0 && query.length < 2 ? (
               <p className="text-center text-gray-500 py-12">Type at least 2 characters to search</p>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => onOpenChange(false)}
                    className="group block bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-3/4 bg-gray-100 rounded-md overflow-hidden mb-3">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                          No Image
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 truncate mb-1">{product.name}</h3>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</p>
                    {product.category && (
                      <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                    )}
                  </Link>
                ))}
              </div>
            ) : debouncedQuery.length >= 2 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-2">No products found for "{debouncedQuery}"</p>
                <p className="text-sm text-gray-400">Try checking your spelling or use different keywords.</p>
              </div>
            ) : (
              <div className="py-8">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Popular Searches</h3>
                 <div className="flex flex-wrap gap-2">
                   {["T-Shirts", "Jeans", "Jackets", "Shoes", "Accessories"].map((term) => (
                     <button
                       key={term}
                       onClick={() => setQuery(term)}
                       className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-400 hover:bg-gray-50 rounded-full text-sm text-gray-700 transition-all"
                     >
                       {term}
                     </button>
                   ))}
                 </div>
              </div>
            )}
          </div>
        </div>

        {products && products.length > 0 && (
           <div className="p-4 border-t border-gray-200 bg-white">
             <div className="max-w-7xl mx-auto w-full text-center">
               <button
                 onClick={handleSearchSubmit}
                 className="text-sm font-bold uppercase tracking-widest text-gray-900 hover:text-red-600 transition-colors"
               >
                 View all {data?.count || products.length} results
               </button>
             </div>
           </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

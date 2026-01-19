import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CollectionNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white px-4 py-20">
      <div className="w-full max-w-4xl text-center space-y-12">

        {/* Editorial Display */}
        <div className="relative py-10">
          <h1 className="text-[8rem] md:text-[12rem] font-light leading-none tracking-tighter text-neutral-50 select-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-0">
            ARCHIVE
          </h1>
          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-neutral-400">
              Collection Unavailable
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-neutral-900 tracking-tight">
              The Edit is Closed
            </h2>
          </div>
        </div>

        {/* Message */}
        <div className="max-w-lg mx-auto space-y-8 relative z-10">
          <p className="text-neutral-500 font-light leading-relaxed text-lg">
            This collection is no longer available or has been moved to our private archives.
            Explore our current seasonal edits below.
          </p>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/collections"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-neutral-900 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 transition-all duration-300"
            >
              <span>View All Collections</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-3 px-8 py-4 border border-neutral-200 text-neutral-900 text-xs font-bold uppercase tracking-[0.2em] hover:border-neutral-900 transition-all duration-300"
            >
              <span>Return Home</span>
            </Link>
          </div>
        </div>

        {/* Curated Collections Grid */}
        <div className="pt-20 border-t border-neutral-100 w-full">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-400 mb-10">
            Current Seasons
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Dresses", href: "/collections/women-dresses", label: "FW 2025" },
              { name: "Women's Jeans", href: "/collections/women-jeans", label: "FW 2025" },
              { name: "New Arrivals", href: "/collections/new-arrivals", label: "Just In" },
              { name: "Essentials", href: "/collections/essentials", label: "Core" },
            ].map((collection) => (
              <Link
                key={collection.name}
                href={collection.href}
                className="group block text-left p-6 bg-neutral-50 hover:bg-neutral-100 transition-colors duration-500"
              >
                <div className="flex justify-between items-start mb-8">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-neutral-400 group-hover:text-neutral-600 transition-colors">
                    {collection.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </div>
                <h3 className="text-lg font-serif text-neutral-900 group-hover:translate-x-1 transition-transform duration-300">
                  {collection.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

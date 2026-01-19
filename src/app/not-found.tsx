import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white px-4 py-20">
      <div className="w-full max-w-3xl text-center space-y-12">

        {/* Editorial 404 Display */}
        <div className="relative">
          <h1 className="text-[10rem] md:text-[16rem] font-light leading-none tracking-tighter text-neutral-100 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-sm font-medium tracking-[0.3em] uppercase text-neutral-500 mb-4">
              Error
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-neutral-900 tracking-tight">
              Out of Style
            </h2>
          </div>
        </div>

        {/* Message */}
        <div className="max-w-md mx-auto space-y-6">
          <p className="text-neutral-600 font-light leading-relaxed">
            The page you are looking for seems to have gone out of season.
            It might have been removed or is temporarily unavailable.
          </p>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-neutral-900 text-white text-sm uppercase tracking-widest hover:bg-neutral-800 transition-all duration-300"
            >
              <span>Return Home</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/products"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 border border-neutral-200 text-neutral-900 text-sm uppercase tracking-widest hover:border-neutral-900 transition-all duration-300"
            >
              <span>View Collection</span>
            </Link>
          </div>
        </div>

        {/* Curated Links */}
        <div className="pt-16 border-t border-neutral-100 w-full">
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400 mb-8">
            Explore Our Collections
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: "New Arrivals", href: "/products?sort=newest" },
              { label: "Best Sellers", href: "/products?sort=best-selling" },
              { label: "Dresses", href: "/collections/women-dresses" },
              { label: "Women's Jeans", href: "/collections/women-jeans" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="py-2 text-neutral-600 hover:text-neutral-900 transition-colors border-b border-transparent hover:border-neutral-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

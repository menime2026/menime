import Image from "next/image";
import Link from "next/link";
import { getStorefrontCollections } from "@/lib/storefront/catalog";
import { formatNumber } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;

const CollectionsLandingPage = async () => {
  const collections = await getStorefrontCollections();

  const rootCollections = collections.filter((collection) => !collection.parent);
  const nestedCollections = collections.filter((collection) => collection.parent);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Hero Section */}
      <section className="relative flex min-h-[40vh] flex-col items-center justify-center bg-slate-50 px-6 py-20 text-center">
        <h1 className="text-5xl font-black uppercase tracking-tighter text-slate-900 md:text-7xl lg:text-8xl">
          Collections
        </h1>
        <p className="mt-6 max-w-lg text-lg font-light text-slate-600">
          Curated edits of wardrobe staples and seasonal statements.
          Designed for the modern aesthetic.
        </p>
      </section>

      {/* Main Collections Grid */}
      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:gap-x-8 lg:gap-y-16">
          {rootCollections.map((collection) => {
            const image = collection.image;

            return (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group block"
              >
                <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100">
                  {image ? (
                    <Image
                      src={image.url}
                      alt={collection.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100">
                      <span className="text-xl font-bold uppercase tracking-widest text-slate-300">
                        {collection.name}
                      </span>
                    </div>
                  )}

                  {/* Overlay for text visibility */}
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />

                  <div className="absolute bottom-6 left-6 right-6">
                     <div className="inline-block bg-white/90 backdrop-blur-sm px-6 py-4 transition-transform duration-500 group-hover:-translate-y-2">
                        <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900">
                          {collection.name}
                        </h2>
                        {typeof collection.productCount === "number" && (
                          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                            {formatNumber(collection.productCount)} Items
                          </p>
                        )}
                     </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {rootCollections.length === 0 && (
             <div className="col-span-full flex min-h-[300px] items-center justify-center border border-dashed border-slate-200 bg-slate-50">
                <p className="text-slate-500">No collections found.</p>
             </div>
          )}
        </div>
      </section>

      {/* Nested/Other Collections */}
      {nestedCollections.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16 border-t border-slate-100">
          <div className="mb-10 flex items-center justify-between">
            <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">More to Explore</h3>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {nestedCollections.map((collection) => (
               <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group flex flex-col gap-3"
              >
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                   {collection.image ? (
                    <Image
                      src={collection.image.url}
                      alt={collection.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                   ) : (
                     <div className="flex h-full w-full items-center justify-center text-slate-300">
                       <span className="text-xs uppercase">No Image</span>
                     </div>
                   )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 group-hover:underline">{collection.name}</h4>
                  <p className="text-sm text-slate-500">{collection.parent?.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CollectionsLandingPage;

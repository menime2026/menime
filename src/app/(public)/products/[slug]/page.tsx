import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import Image from "next/image";

import {
  getFeaturedProducts,
  getStorefrontProductBySlug,
  type StorefrontProduct,
} from "@/lib/storefront/catalog";
import ProductGallery from "../_components/product-gallery";
import ProductPurchasePanel from "../_components/product-purchase-panel";
import StorefrontProductCard from "@/components/storefront/product-card";
import ProductReviews from "../_components/product-reviews";

export const revalidate = 60;

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const getProductCached = cache(async (slug: string) => getStorefrontProductBySlug(slug));

const buildMetadata = async (slug: string): Promise<Metadata | null> => {
  const data = await getProductCached(slug);
  if (!data) {
    return null;
  }

  return {
    title: `${data.product.name} | Meni-me`,
    description: data.product.description ?? "Discover tailored silhouettes and modern staples crafted for the Meni-me collective.",
    openGraph: {
      title: data.product.name,
      description:
        data.product.description ?? "Discover tailored silhouettes and modern staples crafted for the Meni-me collective.",
      images: data.product.media.map((image) => ({
        url: image.url,
      })),
    },
  } satisfies Metadata;
};

export const generateMetadata = async ({ params }: ProductPageProps): Promise<Metadata> => {
  const { slug } = await params;

  return (await buildMetadata(slug)) ?? {};
};

const getRelatedProducts = async (product: StorefrontProduct) => {
  const related = await getFeaturedProducts({ limit: 8 });
  const filtered = related.filter((item: StorefrontProduct) => item.id !== product.id);

  const collections = new Set(product.collections.map((collection) => collection.id));

  const prioritized = filtered
    .sort((a: StorefrontProduct, b: StorefrontProduct) => {
      const aMatches = a.collections.some((collection: { id: string }) => collections.has(collection.id));
      const bMatches = b.collections.some((collection: { id: string }) => collections.has(collection.id));

      if (aMatches === bMatches) {
        return 0;
      }

      return aMatches ? -1 : 1;
    })
    .slice(0, 3);

  return prioritized;
};

const formatDate = (value: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
};

const ProductPage = async ({ params }: ProductPageProps) => {
  const { slug } = await params;

  const data = await getProductCached(slug);

  if (!data) {
    notFound();
  }

  const { product, reviews, averageRating, reviewCount, distribution } = data;
  const related = await getRelatedProducts(product);

  const description = product.description ??
    "Elevate your wardrobe with our studio-edited essentials and showstopping statements — crafted for all the moments you live in.";

  const initialReviewBundle = {
    averageRating,
    reviewCount,
    reviews: reviews.map((review: { id: string; rating: number; title: string | null; comment: string | null; createdAt: Date; user: { id: string; name: string; image: string | null } | null }) => ({
      id: review.id,
      rating: review.rating,
      title: review.title ?? null,
      comment: review.comment ?? null,
      createdAt: review.createdAt.toISOString(),
      user: {
        id: review.user?.id ?? "guest",
        name: review.user?.name ?? "Anonymous",
        image: review.user?.image ?? null,
      },
    })),
    userReview: null,
    distribution: distribution.map((entry) => ({
      rating: entry.rating,
      count: entry.count,
      percentage: entry.percentage,
    })),
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Breadcrumb / Navigation */}
      <nav className="mx-auto w-full max-w-7xl px-6 py-6 text-xs uppercase tracking-[0.2em] text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/collections/all" className="hover:text-slate-900 transition">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-900">{product.name}</span>
      </nav>

      <section className="mx-auto w-full max-w-7xl px-6 pb-24 pt-4">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          {/* Product Gallery */}
          <ProductGallery title={product.name} images={product.media} />

          {/* Product Details - Sticky on Desktop */}
          <div className="flex flex-col gap-10 lg:sticky lg:top-24">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="inline-block h-px w-8 bg-slate-900"></span>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-900">Meni-me Exclusive</p>
                </div>
                <h1 className="text-4xl font-light text-slate-900 md:text-5xl leading-tight">{product.name}</h1>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-slate-600 border-b border-slate-100 pb-8">
                {averageRating ? (
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {"★".repeat(Math.round(averageRating))}
                      <span className="text-slate-200">{"★".repeat(5 - Math.round(averageRating))}</span>
                    </div>
                    <span className="text-xs uppercase tracking-widest text-slate-500">({reviewCount} Reviews)</span>
                  </div>
                ) : (
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400">New Arrival</span>
                )}

                {product.stock > 0 ? (
                  <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    In Stock
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-rose-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                    Sold Out
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium uppercase tracking-wider text-slate-900">Description</h3>
                <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                  <p>{description}</p>
                </div>
              </div>

              {product.collections.length ? (
                <div className="flex flex-wrap gap-2">
                  {product.collections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/collections/${collection.slug}`}
                      className="bg-slate-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-900 hover:text-white"
                    >
                      {collection.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <ProductPurchasePanel
              productId={product.id}
              productName={product.name}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              stock={product.stock}
              sku={product.sku}
              sizeOptions={product.sizeOptions}
              colorOptions={product.colorOptions}
            />

            {/* Additional Info Accordions (Static for aesthetics) */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div className="group cursor-pointer">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-900">Shipping & Returns</span>
                  <span className="text-slate-400">+</span>
                </div>
                <p className="hidden text-xs text-slate-500 leading-relaxed py-2 group-hover:block animate-in fade-in">
                  Free standard shipping on all orders. Returns accepted within 30 days of delivery.
                </p>
              </div>
              <div className="group cursor-pointer border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-900">Care Instructions</span>
                  <span className="text-slate-400">+</span>
                </div>
                 <p className="hidden text-xs text-slate-500 leading-relaxed py-2 group-hover:block animate-in fade-in">
                  Machine wash cold with like colors. Tumble dry low. Do not bleach.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-white py-24">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-2xl font-light text-slate-900 md:text-3xl mb-4">Client Reviews</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              See what our community has to say about the {product.name}.
            </p>
          </div>
          <ProductReviews
            productId={product.id}
            productName={product.name}
            initialData={initialReviewBundle}
          />
        </div>
      </section>

      {related.length ? (
        <section className="mx-auto w-full max-w-7xl px-6 py-24 border-t border-slate-100">
          <div className="mb-12 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-3">You Might Also Like</span>
            <h2 className="text-3xl font-light text-slate-900">Curated For You</h2>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {related.map((item: StorefrontProduct) => (
              <StorefrontProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default ProductPage;

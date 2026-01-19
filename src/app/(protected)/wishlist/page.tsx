'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserWishlistData } from '@/server/storefront-service';

import { Button } from '@/components/ui/button';
import { WishlistItemCard } from './_components/wishlist-item-card';
import { WishlistSkeleton } from './_components/wishlist-skeleton';

const WishlistPage = () => {
  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ['user-wishlist'],
    queryFn: async () => {
      const response = await fetch('/api/storefront/wishlist');
      if (!response.ok) throw new Error('Failed to fetch wishlist');
      return response.json() as Promise<UserWishlistData>;
    },
  });

  const wishlistItems = wishlistData?.items ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:py-20">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-8">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-900">Your Wishlist</p>
            <h1 className="text-4xl font-light text-slate-900 md:text-5xl">Saved Items</h1>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest">
            <Link href="/products" className="text-slate-900 hover:text-slate-600 transition-colors border-b border-transparent hover:border-slate-600 pb-0.5">
              Continue Shopping
            </Link>
          </div>
        </div>

        {isLoading ? (
          <WishlistSkeleton />
        ) : wishlistItems.length > 0 ? (
          <div className="grid gap-x-8 gap-y-16 grid-cols-2 lg:grid-cols-4">
            {wishlistItems.map((item) => (
              <WishlistItemCard
                key={item.id}
                id={item.id}
                productId={item.productId}
                productName={item.product.name}
                price={item.product.price}
                image={item.product.mediaUrls[0] || '/placeholder.png'}
                slug={item.product.slug}
              />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center space-y-6">
            <h2 className="text-2xl font-light text-slate-900">Your wishlist is empty</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Save your favorite silhouettes to keep them on your radar.
            </p>
            <Button asChild className="h-12 px-8 rounded-sm bg-slate-900 text-xs font-bold uppercase tracking-widest text-white hover:bg-slate-800">
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default WishlistPage;

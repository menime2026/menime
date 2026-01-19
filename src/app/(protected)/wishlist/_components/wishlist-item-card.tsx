'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/providers/toast-provider';
import { commerceCountsQueryKey } from '@/lib/query-keys';
import { X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface WishlistItemCardProps {
  id: string;
  productId: string;
  productName: string;
  price: number;
  image: string;
  slug: string;
}

export function WishlistItemCard({
  id,
  productId,
  productName,
  price,
  image,
  slug,
}: WishlistItemCardProps) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const sendAuthorizedRequest = async (
    url: string,
    options: RequestInit,
    fallbackMessage: string,
  ) => {
    const response = await fetch(url, options);

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.status === 401) {
      throw new Error('Please sign in to continue.');
    }

    if (!response.ok) {
      const message =
        data && typeof (data as { error?: unknown }).error === 'string'
          ? ((data as { error: string }).error)
          : fallbackMessage;
      throw new Error(message);
    }

    return data;
  };

  const removeFromWishlistMutation = useMutation<void, Error>({
    mutationFn: async () => {
      await sendAuthorizedRequest(
        '/api/storefront/wishlist/items',
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        },
        'Unable to remove from wishlist. Please try again.',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wishlist'] });
      queryClient.invalidateQueries({ queryKey: commerceCountsQueryKey });
      addToast({
        title: 'Removed from wishlist',
        description: `${productName} was removed from your wishlist.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Could not remove from wishlist',
        description: error.message || 'Unable to remove from wishlist. Please try again.',
        variant: 'error',
      });
    },
  });

  const moveToCartMutation = useMutation<void, Error>({
    mutationFn: async () => {
      await sendAuthorizedRequest(
        '/api/storefront/cart/items',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity: 1 }),
        },
        'Unable to move to bag. Please try again.',
      );

      await sendAuthorizedRequest(
        '/api/storefront/wishlist/items',
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        },
        'Unable to remove from wishlist after moving. Please try again.',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wishlist'] });
      queryClient.invalidateQueries({ queryKey: ['user-cart'] });
      queryClient.invalidateQueries({ queryKey: commerceCountsQueryKey });
      addToast({
        title: 'Moved to bag',
        description: `${productName} was added to your bag.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Could not move to bag',
        description: error.message || 'Unable to move to bag. Please try again.',
        variant: 'error',
      });
    },
  });

  const handleRemoveFromWishlist = async () => {
    await removeFromWishlistMutation.mutateAsync();
  };

  const handleMoveToCart = async () => {
    await moveToCartMutation.mutateAsync();
  };

  const isLoading = removeFromWishlistMutation.isPending || moveToCartMutation.isPending;
  const FALLBACK_GRADIENT = 'bg-linear-to-br from-slate-200 via-slate-100 to-slate-300';

  return (
    <div className="group flex flex-col gap-4" data-wishlist-item-id={id}>
      {/* Image Container */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100">
        <Link href={`/products/${slug}`} className="block h-full w-full">
          {image ? (
            <Image
              src={image}
              alt={productName}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className={`flex h-full w-full items-center justify-center ${FALLBACK_GRADIENT}`}>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Meni-me
              </span>
            </div>
          )}
        </Link>

        {/* Quick Remove Button (Top Right) */}
        <button
          onClick={handleRemoveFromWishlist}
          disabled={isLoading}
          className="absolute right-2 top-2 p-2 text-slate-900 opacity-0 transition-opacity hover:text-rose-600 group-hover:opacity-100 disabled:opacity-50"
          title="Remove from wishlist"
        >
          <span className="sr-only">Remove</span>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="space-y-1">
          <Link href={`/products/${slug}`} className="block">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 hover:text-slate-600 transition-colors">
              {productName}
            </h3>
          </Link>
          <p className="text-sm text-slate-600">₹{price.toLocaleString()}</p>
        </div>

        <Button
          onClick={handleMoveToCart}
          disabled={isLoading}
          className="w-full h-10 rounded-sm bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-slate-800 transition-all active:scale-[0.99]"
        >
          {isLoading ? 'Processing...' : 'Add to Bag'}
        </Button>
      </div>
    </div>
  );
}

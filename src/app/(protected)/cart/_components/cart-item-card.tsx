'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/providers/toast-provider';
import { commerceCountsQueryKey } from '@/lib/query-keys';
import Image from 'next/image';

interface CartItemCardProps {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image: string;
}

export function CartItemCard({
  id,
  productId,
  productName,
  price,
  quantity,
  size,
  color,
  image,
}: CartItemCardProps) {
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

  const removeItemMutation = useMutation<void, Error>({
    mutationFn: async () => {
      await sendAuthorizedRequest(
        '/api/storefront/cart/items',
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        },
        'Unable to remove from bag. Please try again.',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cart'] });
      queryClient.invalidateQueries({ queryKey: commerceCountsQueryKey });
      addToast({
        title: 'Removed from bag',
        description: `${productName} was removed from your bag.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Could not remove item',
        description: error.message || 'Unable to remove from bag. Please try again.',
        variant: 'error',
      });
    },
  });

  const moveToWishlistMutation = useMutation<void, Error>({
    mutationFn: async () => {
      await sendAuthorizedRequest(
        '/api/storefront/wishlist/items',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        },
        'Unable to save to wishlist. Please try again.',
      );

      await sendAuthorizedRequest(
        '/api/storefront/cart/items',
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        },
        'Unable to remove from bag after saving. Please try again.',
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cart'] });
      queryClient.invalidateQueries({ queryKey: commerceCountsQueryKey });
      addToast({
        title: 'Moved to wishlist',
        description: `${productName} is saved for later.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      addToast({
        title: 'Could not move to wishlist',
        description: error.message || 'Unable to move to wishlist. Please try again.',
        variant: 'error',
      });
    },
  });

  const handleRemove = async () => {
    await removeItemMutation.mutateAsync();
  };

  const handleMoveToWishlist = async () => {
    await moveToWishlistMutation.mutateAsync();
  };

  const isLoading = removeItemMutation.isPending || moveToWishlistMutation.isPending;

  return (
    <div className="flex gap-6 group" data-cart-item-id={id}>
      {/* Product Image - Portrait Aspect Ratio */}
      <div className="relative aspect-3/4 w-24 shrink-0 overflow-hidden bg-slate-100">
        <Image
          src={image}
          alt={productName}
          fill
          sizes="96px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col justify-between py-1">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 leading-tight">
              {productName}
            </h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              {size && (
                <span className="flex items-center gap-1">
                  Size: <span className="text-slate-900">{size}</span>
                </span>
              )}
              {color && (
                <span className="flex items-center gap-1">
                  Color: <span className="text-slate-900">{color}</span>
                </span>
              )}
            </div>
          </div>
          <p className="text-sm font-medium text-slate-900">
            ₹{(price * quantity).toLocaleString()}
          </p>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs text-slate-600 border border-slate-200 px-2 py-1 rounded-sm">
                <span>Qty</span>
                <span className="font-medium text-slate-900">{quantity}</span>
             </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <button
              onClick={handleMoveToWishlist}
              disabled={isLoading}
              className="text-slate-500 hover:text-slate-900 underline underline-offset-4 transition-colors disabled:opacity-50"
            >
              Save for Later
            </button>
            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="text-slate-500 hover:text-rose-600 underline underline-offset-4 transition-colors disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

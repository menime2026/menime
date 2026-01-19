"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StorefrontProduct } from "@/lib/storefront/catalog";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import RatingStars from "@/components/ui/rating-stars";
import { useToast } from "@/components/providers/toast-provider";
import { useAuthModal } from "@/components/providers/auth-modal-provider";

const getPrimaryImage = (product: StorefrontProduct) => {
  if (product.media.length > 0) {
    return product.media[0];
  }

  const collectionWithImage = product.collections.find((collection) => collection.image !== null);

  return collectionWithImage?.image ?? null;
};

type StorefrontProductCardProps = {
  product: StorefrontProduct;
  className?: string;
};

const StorefrontProductCard = ({ product, className }: StorefrontProductCardProps) => {
  const image = getPrimaryImage(product);
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const { addToast } = useToast();
  const { openModal } = useAuthModal();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/storefront/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      if (response.status === 401) {
        openModal("sign-in");
        throw new Error("AUTH_REQUIRED");
      }

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-cart"] });
      queryClient.invalidateQueries({ queryKey: ["commerce-counts"] });
      setIsAdding(false);
      addToast({
        title: `${product.name} was added to your bag`,
        variant: "success",
      });
    },
    onError: (error: unknown) => {
      setIsAdding(false);
      if (error instanceof Error && error.message === "AUTH_REQUIRED") {
        return;
      }
      addToast({
        title: "We couldn’t add this item",
        description:
          error instanceof Error && error.message
            ? error.message
            : "Please try again shortly.",
        variant: "error",
      });
    },
  });

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    await addToCartMutation.mutateAsync();
  };

  const handleCheckout = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      await addToCartMutation.mutateAsync();
      router.push("/checkout");
    } catch {
      setIsAdding(false);
    }
  };

  return (
    <div className={cn("group relative", className)}>
      <Link href={`/products/${product.slug}`} className="block overflow-hidden bg-slate-100">
        <div className="relative aspect-3/4 w-full overflow-hidden">
          {image ? (
            <Image
              src={image.url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 40vw, 22vw"
              className="object-cover transition duration-700 group-hover:scale-105"
              priority={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-300">
              <span className="text-xs uppercase tracking-widest">No Image</span>
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full p-4 transition-transform duration-300 group-hover:translate-y-0">
            <Button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="w-full bg-white text-slate-900 hover:bg-slate-100"
              size="lg"
            >
              {isAdding ? (
                <span className="animate-pulse">Adding...</span>
              ) : (
                <>
                  Add to Bag
                </>
              )}
            </Button>
          </div>

          {/* Badges */}
          {hasDiscount && (
            <div className="absolute left-3 top-3">
              <span className="bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-900">
                Sale
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-4 flex justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-slate-900">
            <Link href={`/products/${product.slug}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
          <p className="text-xs text-slate-500">
            {product.collections.length > 0
              ? product.collections[0].name
              : "New Arrival"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900">
            {formatCurrency(product.price)}
          </p>
          {hasDiscount && product.compareAtPrice && (
            <p className="text-xs text-slate-500 line-through">
              {formatCurrency(product.compareAtPrice)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorefrontProductCard;

"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/providers/toast-provider";
import { formatCurrency } from "@/lib/format";
import { commerceCountsQueryKey } from "@/lib/query-keys";
import { useAuthModal } from "@/components/providers/auth-modal-provider";

const getColorSwatchStyle = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const isHex = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/u.test(trimmed);
  const isFunctional = /^(?:rgb|hsl)a?\(/u.test(trimmed);
  const isKeyword = /^[a-zA-Z]+$/u.test(trimmed);

  if (isHex || isFunctional || isKeyword) {
    return { backgroundColor: trimmed } as const;
  }

  return undefined;
};

export type ProductPurchasePanelProps = {
  productId: string;
  productName: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  sku: string | null;
  sizeOptions?: string[];
  colorOptions?: string[];
};

const ProductPurchasePanel = ({
  productId,
  productName,
  price,
  compareAtPrice,
  stock,
  sku,
  sizeOptions = [],
  colorOptions = [],
}: ProductPurchasePanelProps) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { openModal } = useAuthModal();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusTone, setStatusTone] = useState<"info" | "success" | "error">("info");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const hasDiscount = typeof compareAtPrice === "number" && compareAtPrice > price;
  const total = useMemo(() => quantity * price, [quantity, price]);
  const isOutOfStock = stock <= 0;
  const normalizedSizeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          sizeOptions
            .map((option) => option.trim())
            .filter((option) => option.length > 0),
        ),
      ),
    [sizeOptions],
  );
  const normalizedColorOptions = useMemo(
    () =>
      Array.from(
        new Set(
          colorOptions
            .map((option) => option.trim())
            .filter((option) => option.length > 0),
        ),
      ),
    [colorOptions],
  );
  const requiresSize = normalizedSizeOptions.length > 0;
  const requiresColor = normalizedColorOptions.length > 0;

  const resolvedSelectedSize = useMemo(() => {
    if (!requiresSize) {
      return null;
    }

    if (selectedSize && normalizedSizeOptions.includes(selectedSize)) {
      return selectedSize;
    }

    return null;
  }, [requiresSize, selectedSize, normalizedSizeOptions]);

  const resolvedSelectedColor = useMemo(() => {
    if (!requiresColor) {
      return null;
    }

    if (selectedColor && normalizedColorOptions.includes(selectedColor)) {
      return selectedColor;
    }

    return null;
  }, [requiresColor, selectedColor, normalizedColorOptions]);

  const handleQuantityChange = (value: number) => {
    if (Number.isNaN(value) || value < 1) {
      return;
    }

    if (stock > 0 && value > stock) {
      setQuantity(stock);
      return;
    }

    setQuantity(value);
  };

  const adjustQuantity = (delta: number) => {
    const next = quantity + delta;
    if (next < 1) {
      setQuantity(1);
      return;
    }

    if (stock > 0 && next > stock) {
      setQuantity(stock);
      return;
    }

    setQuantity(next);
  };

  const clearInlineStatus = () => {
    if (statusTone === "error") {
      setStatusTone("info");
      setStatusMessage(null);
    }
  };

  const handleSelectSize = (value: string) => {
    setSelectedSize((current) => (current === value ? null : value));
    clearInlineStatus();
  };

  const handleSelectColor = (value: string) => {
    setSelectedColor((current) => (current === value ? null : value));
    clearInlineStatus();
  };

  const ensureSelections = (context: "bag" | "wishlist") => {
    const missing: string[] = [];

    if (requiresSize && !resolvedSelectedSize) {
      missing.push("size");
    }

    if (requiresColor && !resolvedSelectedColor) {
      missing.push("color");
    }

    if (missing.length === 0) {
      return true;
    }

    const message = `Select a ${missing.join(" and ")} before adding to your ${context === "bag" ? "bag" : "wishlist"}.`;
    setStatusTone("error");
    setStatusMessage(message);
    addToast({
      title: "Select options",
      description: message,
      variant: "error",
    });

    return false;
  };

  const sendStorefrontRequest = async (url: string, body: Record<string, unknown>) => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (response.status === 401) {
      openModal("sign-in");
      throw new Error("AUTH_REQUIRED");
    }

    if (!response.ok) {
      const message =
        data && typeof (data as { error?: unknown }).error === "string"
          ? ((data as { error: string }).error)
          : "Something went wrong. Please try again.";
      throw new Error(message);
    }
  };

  const cartMutation = useMutation<
    void,
    Error,
    { quantity: number; selectedSize?: string | null; selectedColor?: string | null }
  >({
    mutationFn: async ({ quantity: selectedQuantity, selectedSize: sizeValue, selectedColor: colorValue }) => {
      await sendStorefrontRequest("/api/storefront/cart/items", {
        productId,
        quantity: selectedQuantity,
        ...(typeof sizeValue !== "undefined" ? { selectedSize: sizeValue } : {}),
        ...(typeof colorValue !== "undefined" ? { selectedColor: colorValue } : {}),
      });
    },
    onMutate: () => {
      setStatusTone("info");
      setStatusMessage(null);
    },
    onSuccess: () => {
      setStatusTone("success");
      setStatusMessage(`${productName} is waiting in your bag.`);
      addToast({
        title: "Added to bag",
        description: `${productName} is waiting in your bag.`,
        variant: "success",
      });
      void queryClient.invalidateQueries({ queryKey: commerceCountsQueryKey });
    },
    onError: (error) => {
      if (error.message === "AUTH_REQUIRED") {
        setStatusTone("info");
        setStatusMessage(null);
        return;
      }
      setStatusTone("error");
      setStatusMessage(error.message || "Unable to add to bag. Please try again.");
      addToast({
        title: "Could not add to bag",
        description: error.message || "Unable to add to bag. Please try again.",
        variant: "error",
      });
    },
  });

  const wishlistMutation = useMutation<
    void,
    Error,
    { selectedSize?: string | null; selectedColor?: string | null }
  >({
    mutationFn: async ({ selectedSize: sizeValue, selectedColor: colorValue } = {}) => {
      await sendStorefrontRequest("/api/storefront/wishlist/items", {
        productId,
        ...(typeof sizeValue !== "undefined" ? { selectedSize: sizeValue } : {}),
        ...(typeof colorValue !== "undefined" ? { selectedColor: colorValue } : {}),
      });
    },
    onMutate: () => {
      setStatusTone("info");
      setStatusMessage(null);
    },
    onSuccess: () => {
      setStatusTone("success");
      setStatusMessage(`${productName} is saved to your wishlist.`);
      addToast({
        title: "Saved to wishlist",
        description: `${productName} is ready whenever you are.`,
        variant: "success",
      });
      void queryClient.invalidateQueries({ queryKey: commerceCountsQueryKey });
    },
    onError: (error) => {
      if (error.message === "AUTH_REQUIRED") {
        setStatusTone("info");
        setStatusMessage(null);
        return;
      }
      setStatusTone("error");
      setStatusMessage(error.message || "Unable to save to wishlist. Please try again.");
      addToast({
        title: "Could not save to wishlist",
        description: error.message || "Unable to save to wishlist. Please try again.",
        variant: "error",
      });
    },
  });

  const isCartProcessing = cartMutation.isPending;
  const isWishlistProcessing = wishlistMutation.isPending;

  const handleAddToBag = () => {
    if (!ensureSelections("bag")) {
      return;
    }

    cartMutation.mutate({
      quantity,
      selectedSize: requiresSize ? resolvedSelectedSize ?? null : undefined,
      selectedColor: requiresColor ? resolvedSelectedColor ?? null : undefined,
    });
  };

  const handleSaveToWishlist = () => {
    if (!ensureSelections("wishlist")) {
      return;
    }

    wishlistMutation.mutate({
      selectedSize: requiresSize ? resolvedSelectedSize ?? null : undefined,
      selectedColor: requiresColor ? resolvedSelectedColor ?? null : undefined,
    });
  };

  return (
    <div className="space-y-8 pt-6">
      {/* Price Section */}
      <div className="space-y-1 border-b border-slate-100 pb-6">
        <div className="flex items-baseline gap-4">
          <span className="text-3xl font-light tracking-tight text-slate-900">
            {formatCurrency(price)}
          </span>
          {hasDiscount && compareAtPrice ? (
            <span className="text-lg text-slate-400 line-through decoration-slate-300 decoration-1">
              {formatCurrency(compareAtPrice)}
            </span>
          ) : null}
        </div>
        {hasDiscount && compareAtPrice ? (
          <p className="text-xs font-medium uppercase tracking-wider text-rose-600">
            Limited Time Offer
          </p>
        ) : null}
      </div>

      {/* Color Selection */}
      {requiresColor ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Color <span className="font-normal text-slate-500 ml-2">{resolvedSelectedColor}</span>
            </span>
            {!resolvedSelectedColor && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-rose-500">
                Required
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {normalizedColorOptions.map((option) => {
              const isSelected = resolvedSelectedColor === option;
              const swatchStyle = getColorSwatchStyle(option);

              if (swatchStyle) {
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelectColor(option)}
                    className={cn(
                      "group relative h-10 w-10 rounded-full border border-slate-200 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
                      isSelected ? "ring-2 ring-slate-900 ring-offset-2" : "hover:border-slate-400"
                    )}
                    aria-pressed={isSelected}
                    aria-label={`Select color ${option}`}
                    title={option}
                  >
                    <span
                      className="absolute inset-0.5 rounded-full border border-black/5"
                      style={swatchStyle}
                    />
                  </button>
                );
              }

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectColor(option)}
                  className={cn(
                    "min-w-12 rounded-sm border px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all",
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900"
                  )}
                  aria-pressed={isSelected}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Size Selection */}
      {requiresSize ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900">
              Size <span className="font-normal text-slate-500 ml-2">{resolvedSelectedSize}</span>
            </span>
            {!resolvedSelectedSize && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-rose-500">
                Required
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {normalizedSizeOptions.map((option) => {
              const isSelected = resolvedSelectedSize === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelectSize(option)}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-sm border text-xs font-medium uppercase tracking-wider transition-all",
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-900 hover:text-slate-900"
                  )}
                  aria-pressed={isSelected}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <button type="button" className="text-xs underline underline-offset-4 text-slate-500 hover:text-slate-900 transition-colors">
            Size Guide
          </button>
        </div>
      ) : null}

      {/* Quantity & Actions */}
      <div className="space-y-6 pt-4 border-t border-slate-100">
        {/* Quantity - Minimalist */}
        <div className="flex items-center gap-6">
           <span className="text-xs font-bold uppercase tracking-widest text-slate-900">Quantity</span>
           <div className="flex items-center border border-slate-200 rounded-sm">
              <button
                onClick={() => adjustQuantity(-1)}
                disabled={quantity <= 1}
                className="h-8 w-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 transition-colors"
              >
                −
              </button>
              <div className="h-8 w-10 flex items-center justify-center text-sm font-medium text-slate-900 border-x border-slate-100">
                {quantity}
              </div>
              <button
                onClick={() => adjustQuantity(1)}
                disabled={stock > 0 ? quantity >= stock : false}
                className="h-8 w-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 transition-colors"
              >
                +
              </button>
           </div>
           {stock > 0 && stock < 10 && (
             <span className="text-xs text-amber-600 font-medium">Only {stock} left</span>
           )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            className="h-14 w-full rounded-sm bg-slate-900 text-xs font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-slate-800 active:scale-[0.99]"
            disabled={isOutOfStock || isCartProcessing}
            onClick={handleAddToBag}
            data-loader-skip
          >
            {isCartProcessing ? (
              <span className="animate-pulse">Adding to Bag...</span>
            ) : isOutOfStock ? (
              "Out of Stock"
            ) : (
              "Add to Bag"
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="h-14 w-full rounded-sm border-slate-200 text-xs font-bold uppercase tracking-[0.2em] text-slate-900 transition-all hover:border-slate-900 hover:bg-white active:scale-[0.99]"
            disabled={isWishlistProcessing}
            onClick={handleSaveToWishlist}
            data-loader-skip
          >
            {isWishlistProcessing ? "Saving..." : "Save to Wishlist"}
          </Button>
        </div>

        {/* Status Messages */}
        {statusMessage ? (
          <div
            className={cn(
              "flex items-center gap-2 rounded-sm p-3 text-xs font-medium",
              statusTone === "success"
                ? "bg-emerald-50 text-emerald-700"
                : statusTone === "error"
                  ? "bg-rose-50 text-rose-700"
                  : "bg-slate-50 text-slate-600",
            )}
            role="status"
            aria-live="polite"
          >
            {statusTone === "success" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            {statusTone === "error" && <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />}
            {statusMessage}
          </div>
        ) : null}
      </div>

      {/* Extra Info */}
      <div className="space-y-3 border-t border-slate-100 pt-6 text-xs text-slate-500">
        {sku && (
          <div className="flex justify-between">
            <span>SKU</span>
            <span className="font-mono text-slate-900">{sku}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span className="text-slate-900">Calculated at checkout</span>
        </div>
      </div>
    </div>
  );
};

export default ProductPurchasePanel;

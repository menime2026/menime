'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CartItemWithProduct, UserCartData } from '@/server/storefront-service';

import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { CartItemCard } from './_components/cart-item-card';
import { CartSkeleton } from './_components/cart-skeleton';

const CartPage = () => {

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['user-cart'],
    queryFn: async () => {
      const response = await fetch('/api/storefront/cart');
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json() as Promise<UserCartData>;
    },
  });

  const cartItems: CartItemWithProduct[] = cartData?.items ?? [];

  const subtotal = cartItems.reduce((total: number, item: CartItemWithProduct) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const shipping = subtotal >= 250 ? 0 : 12;
  const taxes = Math.round(subtotal * 0.09 * 100) / 100;
  const total = subtotal + shipping + taxes;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:py-20">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-slate-100 pb-8">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-900">Your Bag</p>
            <h1 className="text-4xl font-light text-slate-900 md:text-5xl">Shopping Cart</h1>
          </div>
          <div className="text-right">
             <p className="text-sm text-slate-500 mb-4">
              {isLoading ? 'Loading...' : `${cartItems.length} ${cartItems.length === 1 ? 'Item' : 'Items'}`}
            </p>
            <Link
              href="/products"
              className="text-xs font-bold uppercase tracking-widest text-slate-900 hover:text-slate-600 transition-colors border-b border-slate-900 pb-0.5 hover:border-slate-600"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {isLoading ? (
          <CartSkeleton />
        ) : (
          <div className="grid gap-16 lg:grid-cols-[1.5fr_0.8fr] lg:items-start">
            <div className="space-y-0 divide-y divide-slate-100">
              {cartItems.length > 0 ? (
                cartItems.map((item: CartItemWithProduct) => (
                  <div key={item.id} className="py-8 first:pt-0">
                    <CartItemCard
                      id={item.id}
                      productId={item.productId}
                      productName={item.product.name}
                      price={item.product.price}
                      quantity={item.quantity}
                      image={item.product.mediaUrls[0] || '/placeholder.png'}
                      size={item.selectedSize || undefined}
                      color={item.selectedColor || undefined}
                    />
                  </div>
                ))
              ) : (
                <div className="py-20 text-center space-y-6">
                  <h2 className="text-2xl font-light text-slate-900">Your bag is empty</h2>
                  <p className="text-slate-500 max-w-md mx-auto">
                    Looks like you haven't added anything to your bag yet. Explore our latest collections to find your new favorites.
                  </p>
                  <Button asChild className="h-12 px-8 rounded-sm bg-slate-900 text-xs font-bold uppercase tracking-widest text-white hover:bg-slate-800">
                    <Link href="/products">Start Shopping</Link>
                  </Button>
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <aside className="lg:sticky lg:top-24 space-y-8 bg-slate-50/50 p-8 rounded-sm">
                <h2 className="text-lg font-medium uppercase tracking-wider text-slate-900">Order Summary</h2>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Tax</span>
                    <span>{formatCurrency(taxes)}</span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-base font-medium text-slate-900">Total</span>
                    <span className="text-2xl font-light text-slate-900">{formatCurrency(total)}</span>
                  </div>
                  <p className="text-xs text-slate-400">Including taxes and shipping</p>
                </div>

                <Button asChild className="w-full h-14 rounded-sm bg-slate-900 text-xs font-bold uppercase tracking-widest text-white hover:bg-slate-800 transition-all active:scale-[0.99]">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>

                <div className="text-center">
                   <p className="text-xs text-slate-500">
                     Free shipping on orders over {formatCurrency(250)}
                   </p>
                </div>
              </aside>
            )}
          </div>
        )}
      </section>
    </div>
  );
};export default CartPage;

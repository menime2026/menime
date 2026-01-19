'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CartItemWithProduct } from '@/server/storefront-service';
import { formatCurrency } from '@/lib/format';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CheckoutPayment from './_components/checkout-payment';

const FALLBACK_GRADIENT = 'bg-linear-to-br from-slate-200 via-slate-100 to-slate-300';

const CheckoutPage = () => {
  const { data: cartData } = useQuery({
    queryKey: ['user-cart'],
    queryFn: async () => {
      const response = await fetch('/api/storefront/cart');
      if (!response.ok) throw new Error('Failed to fetch cart');
      return response.json();
    },
  });

  const { data: profileData } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
  });

  const cartItems: CartItemWithProduct[] = cartData?.items ?? [];

  const checkoutPayload = cartItems.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 250 ? 0 : 12;
  const taxes = Math.round(subtotal * 0.09 * 100) / 100;
  const total = subtotal + shipping + taxes;

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <h1 className="text-2xl font-light text-slate-900">Your bag is empty</h1>
        <p className="mt-4 text-sm text-slate-500">Add items to your cart to proceed.</p>
        <Button asChild className="mt-8 h-12 rounded-none bg-slate-900 px-8 text-xs font-bold uppercase tracking-widest text-white hover:bg-slate-800">
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 lg:px-12">
          <Link href="/" className="text-xl font-bold tracking-tighter text-slate-900">
            MENI-ME
          </Link>
          <Link
            href="/cart"
            className="text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:text-slate-600"
          >
            Back to Bag
          </Link>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1600px] grid-cols-1 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_560px]">
        {/* Left Column: Checkout Form */}
        <div className="px-6 py-12 lg:px-12 lg:py-16 lg:border-r lg:border-slate-100">
          <div className="mx-auto max-w-2xl">
            <div className="mb-12">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Checkout
              </p>
              <h1 className="text-3xl font-light text-slate-900">
                Delivery & Payment
              </h1>
            </div>

            <CheckoutPayment
              amount={total}
              currency="INR"
              items={checkoutPayload}
              profile={profileData}
            />
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="bg-slate-50 px-6 py-12 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:overflow-y-auto lg:px-12 lg:py-16">
          <div className="mx-auto max-w-md lg:max-w-none">
            <h2 className="mb-8 text-xs font-bold uppercase tracking-widest text-slate-900">
              Order Summary
            </h2>

            <div className="space-y-6">
              {cartItems.map((item) => {
                const image = item.product.mediaUrls[0] ?? null;
                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative aspect-3/4 w-20 overflow-hidden bg-slate-200">
                      {image ? (
                        <Image
                          src={image}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className={`flex h-full w-full items-center justify-center ${FALLBACK_GRADIENT}`} />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">{item.product.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="my-8 h-px bg-slate-200" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes</span>
                <span>{formatCurrency(taxes)}</span>
              </div>
              <div className="flex justify-between pt-4 text-base font-medium text-slate-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="mt-12 rounded-sm border border-slate-200 bg-white p-6">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-900">
                The Meni-me Promise
              </h3>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>• Secure payment processing via Razorpay</li>
                <li>• Complimentary shipping on orders over {formatCurrency(250)}</li>
                <li>• 30-day returns for unworn items</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

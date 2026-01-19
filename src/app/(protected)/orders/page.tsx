'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import type { UserOrderData } from '@/server/order-service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@clerk/nextjs';
import { OrderCard } from './_components/order-card';

const OrderPage = () => {
  const { user, isSignedIn } = useUser();
  const { data: ordersResponse, isLoading } = useQuery({
    queryKey: ['user-orders'],
    queryFn: async () => {
      const response = await fetch('/api/storefront/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      return response.json() as Promise<{ orders: UserOrderData[] }>;
    },
  });

  const orders: UserOrderData[] = ordersResponse?.orders ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-12 lg:py-20">
          <div className="mb-16 border-b border-slate-100 pb-6">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="grid gap-12 lg:grid-cols-[300px_1fr] xl:gap-24">
            <div className="space-y-10">
              <div className="flex flex-col gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-8">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-12 lg:py-20">
        <div className="mb-16 border-b border-slate-100 pb-6">
          <h1 className="text-xs font-bold uppercase tracking-widest text-slate-900">
            Order History
          </h1>
        </div>

        <div className="grid gap-12 lg:grid-cols-[300px_1fr] xl:gap-24">
          {/* Sidebar / User Info */}
          <aside className="h-fit space-y-10 lg:sticky lg:top-24">
            <div className="flex flex-col items-start gap-6">
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-slate-50 ring-1 ring-slate-100">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || 'User'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                    <span className="text-2xl font-light uppercase">
                      {user?.firstName?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-light text-slate-900">
                  {user?.fullName || 'Guest User'}
                </h2>
                <p className="text-sm text-slate-500">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
            </div>

            <nav className="flex flex-col space-y-1">
              <Link
                href="/profile"
                className="group flex items-center justify-between border-b border-slate-50 py-3 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                Profile Settings
                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <Link
                href="/profile#addresses"
                className="group flex items-center justify-between border-b border-slate-50 py-3 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                Address Book
                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <Link
                href="/orders"
                className="group flex items-center justify-between border-b border-slate-50 py-3 text-sm font-medium text-slate-900 transition-colors hover:text-slate-600"
              >
                Order History
                <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="space-y-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-light text-slate-900">Your Orders</h2>
              <p className="text-slate-500">
                Track your shipments and review your purchase history.
              </p>
            </div>

            {orders.length > 0 ? (
              <div className="space-y-8">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-none border border-dashed border-slate-200 bg-slate-50/50 text-center">
                <h3 className="text-xl font-light text-slate-900">No orders yet</h3>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  You haven&apos;t placed any orders yet. Start building your collection today.
                </p>
                <Button asChild className="mt-8 rounded-none bg-slate-900 px-8 uppercase tracking-widest hover:bg-slate-800">
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;

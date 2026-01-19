'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight, Download, RefreshCw, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/providers/toast-provider';
import { useUser } from '@clerk/nextjs';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { OrderDetailData } from '@/server/order-service';
import { OrderStatus } from '@prisma/client';

const CANCELLABLE_STATUSES: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.PROCESSING];

const formatDate = (date?: Date | string | null) => {
  if (!date) return null;
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  } catch {
    return null;
  }
};

const fetchOrderDetail = async (orderId: string): Promise<OrderDetailData> => {
  const response = await fetch(`/api/storefront/orders/${orderId}`);
  if (response.status === 404) {
    throw new Error('Order not found');
  }
  if (!response.ok) {
    throw new Error('Unable to load order. Please try again.');
  }
  const data = (await response.json()) as { order: OrderDetailData };
  return data.order;
};

const cancelOrderRequest = async (orderId: string): Promise<OrderDetailData> => {
  const response = await fetch(`/api/storefront/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'cancel' }),
  });

  const payload = (await response.json().catch(() => null)) as { order?: OrderDetailData; error?: string } | null;

  if (!response.ok || !payload?.order) {
    throw new Error(payload?.error || 'Unable to cancel this order.');
  }

  return payload.order;
};

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.PROCESSING]: 'Processing',
  [OrderStatus.SHIPPED]: 'Shipped',
  [OrderStatus.DELIVERED]: 'Delivered',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.RETURNED]: 'Returned',
};

type TimelineStep = {
  key: string;
  label: string;
  description: string;
  completed: boolean;
  isCurrent: boolean;
};

const buildTimeline = (order: OrderDetailData): TimelineStep[] => {
  if (order.status === OrderStatus.CANCELLED) {
    return [
      {
        key: 'cancelled',
        label: 'Order cancelled',
        description: formatDate(order.cancelledAt) || 'Cancellation confirmed',
        completed: true,
        isCurrent: true,
      },
    ];
  }

  const statusRank: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
  ];

  return statusRank.map((status) => {
    const idx = statusRank.indexOf(status);
    const currentIdx = statusRank.indexOf(order.status);
    const completed = currentIdx >= idx;
    const isCurrent = order.status === status;

    let description = 'Awaiting next milestone';
    if (status === OrderStatus.PENDING) {
      description = formatDate(order.placedAt) || 'Ordered';
    } else if (status === OrderStatus.SHIPPED && order.fulfilledAt) {
      description = formatDate(order.fulfilledAt) || 'Shipment confirmed';
    } else if (status === OrderStatus.DELIVERED && order.fulfilledAt) {
      description = formatDate(order.fulfilledAt) || 'Delivered';
    } else if (status === OrderStatus.PROCESSING && completed) {
      description = 'Preparing your pieces';
    }

    return {
      key: status,
      label: ORDER_STATUS_LABELS[status],
      description,
      completed,
      isCurrent,
    };
  });
};

const formatAddress = (address?: Record<string, unknown> | null) => {
  if (!address) return null;
  const parts: string[] = [];
  if (typeof address.fullName === 'string') parts.push(address.fullName);
  const line1 = typeof address.streetLine1 === 'string' ? address.streetLine1 : undefined;
  const line2 = typeof address.streetLine2 === 'string' ? address.streetLine2 : undefined;
  if (line1) parts.push(line1);
  if (line2) parts.push(line2);
  const city = typeof address.city === 'string' ? address.city : undefined;
  const state = typeof address.state === 'string' ? address.state : undefined;
  const postalCode = typeof address.postalCode === 'string' ? address.postalCode : undefined;
  const region = [city, state, postalCode].filter(Boolean).join(', ');
  if (region) parts.push(region);
  const country = typeof address.country === 'string' ? address.country : undefined;
  if (country) parts.push(country);
  if (typeof address.phoneNumber === 'string') {
    parts.push(`Phone: ${address.phoneNumber}`);
  }
  return parts;
};

const OrderDetailPage = () => {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const router = useRouter();
  const { user } = useUser();

  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<OrderDetailData, Error>({
    queryKey: ['user-order', orderId],
    queryFn: () => {
      if (!orderId) {
        throw new Error('Missing order id');
      }
      return fetchOrderDetail(orderId);
    },
    retry: false,
    enabled: Boolean(orderId),
  });

  const cancelMutation = useMutation<OrderDetailData, Error, void>({
    mutationFn: () => {
      if (!orderId) {
        throw new Error('Missing order id');
      }
      return cancelOrderRequest(orderId);
    },
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(['user-order', orderId], updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      addToast({
        title: 'Order cancelled',
        description: `${updatedOrder.orderNumber} has been cancelled.`,
        variant: 'success',
      });
    },
    onError: (mutationError) => {
      addToast({
        title: 'Unable to cancel order',
        description: mutationError.message,
        variant: 'error',
      });
    },
  });

  const canCancel = order ? CANCELLABLE_STATUSES.includes(order.status) : false;
  // Invoice is available immediately
  const canDownloadInvoice = !!order;

  const addressLines = formatAddress(order?.shippingAddress);
  const timeline = order ? buildTimeline(order) : [];

  const subtotal = order ? formatCurrency(order.subtotal) : null;
  const total = order ? formatCurrency(order.total) : null;

  const statusBadgeClass = useMemo(() => {
    if (!order) return 'text-slate-600 bg-slate-50 border-slate-100';
    switch (order.status) {
      case OrderStatus.DELIVERED:
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case OrderStatus.SHIPPED:
        return 'text-blue-600 bg-blue-50 border-blue-100';
      case OrderStatus.PROCESSING:
      case OrderStatus.PENDING:
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case OrderStatus.CANCELLED:
        return 'text-rose-600 bg-rose-50 border-rose-100';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  }, [order]);

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
              <div className="flex justify-between">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
              </div>
              <Skeleton className="h-64 w-full" />
              <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
        <p className="text-lg font-semibold text-slate-900">{error?.message || 'Order unavailable'}</p>
        <p className="mt-2 text-sm text-slate-500">We couldn&apos;t load that order. Please return to your order history.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-12 lg:py-20">
        <div className="mb-16 border-b border-slate-100 pb-6">
          <h1 className="text-xs font-bold uppercase tracking-widest text-slate-900">
            Order Details
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
            {/* Header */}
            <div className="flex flex-col gap-6 border-b border-slate-100 pb-12 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Link href="/orders" className="group flex items-center justify-center rounded-full border border-slate-200 p-2 transition-colors hover:border-slate-900 hover:bg-slate-900 hover:text-white">
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <h1 className="text-3xl font-light text-slate-900">Order #{order.orderNumber}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-4 pl-14">
                  <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider', statusBadgeClass)}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="text-sm text-slate-500">Placed on {formatDate(order.placedAt)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pl-14 lg:pl-0">
                <Button
                  variant="outline"
                  className="h-10 rounded-full border-slate-200 px-6 text-xs font-bold uppercase tracking-widest hover:bg-slate-50"
                  onClick={() => refetch()}
                  disabled={cancelMutation.isPending}
                >
                  <RefreshCw className={cn("mr-2 h-3 w-3", cancelMutation.isPending && "animate-spin")} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  className="h-10 rounded-full border-slate-200 px-6 text-xs font-bold uppercase tracking-widest hover:bg-slate-50"
                  disabled={!canDownloadInvoice}
                  onClick={() => {
                    if (!canDownloadInvoice) return;
                    const invoiceUrl = `/api/storefront/orders/${order.id}/invoice`;
                    window.open(invoiceUrl, "_blank", "noopener,noreferrer");
                  }}
                >
                  <Download className="mr-2 h-3 w-3" />
                  Invoice
                </Button>
                {canCancel && (
                  <Button
                    variant="outline"
                    className="h-10 rounded-full border-rose-200 px-6 text-xs font-bold uppercase tracking-widest text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    disabled={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate()}
                  >
                    <XCircle className="mr-2 h-3 w-3" />
                    {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-12 xl:grid-cols-3">
              <div className="space-y-12 xl:col-span-2">
                {/* Items List */}
                <div className="space-y-8">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">Items ({order.items.length})</h2>
                  <div className="divide-y divide-slate-100 border-t border-b border-slate-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex gap-6 py-6">
                        <div className="relative h-32 w-24 shrink-0 overflow-hidden bg-slate-50">
                          {item.product?.mediaUrls && item.product.mediaUrls.length > 0 ? (
                            <Image
                              src={item.product.mediaUrls[0]}
                              alt={item.product?.name || 'Product'}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-slate-100">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between py-1">
                          <div className="space-y-1">
                            <h3 className="font-medium text-slate-900">{item.product?.name || item.productName}</h3>
                            <p className="text-sm text-slate-500">
                              {item.selectedSize ? `Size: ${item.selectedSize}` : ''}
                              {item.selectedSize && item.selectedColor ? ' | ' : ''}
                              {item.selectedColor ? `Color: ${item.selectedColor}` : ''}
                            </p>
                            <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium text-slate-900">{formatCurrency(item.lineTotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-8">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">Order Status</h2>
                  <div className="relative border-l border-slate-200 ml-3 space-y-8 pl-8 py-2">
                    {timeline.map((step, index) => (
                      <div key={step.key} className="relative">
                        <span
                          className={cn(
                            'absolute -left-[39px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white transition-colors',
                            step.completed ? 'border-slate-900' : 'border-slate-200',
                            step.isCurrent && 'ring-4 ring-slate-50'
                          )}
                        >
                          {step.completed && <div className="h-2 w-2 rounded-full bg-slate-900" />}
                        </span>
                        <div className={cn('space-y-1 transition-opacity', !step.completed && !step.isCurrent && 'opacity-50')}>
                          <p className="text-sm font-medium text-slate-900">{step.label}</p>
                          <p className="text-xs text-slate-500">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Details */}
              <div className="space-y-12">
                {/* Order Summary */}
                <div className="space-y-6 bg-slate-50 p-8">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">Summary</h2>
                  <div className="space-y-4 border-b border-slate-200 pb-4 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-lg font-medium text-slate-900">
                    <span>Total</span>
                    <span>{total}</span>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-6">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">Shipping Address</h2>
                  {addressLines ? (
                    <div className="text-sm leading-relaxed text-slate-600">
                      {addressLines.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No shipping address provided.</p>
                  )}
                </div>

                {/* Help Section */}
                <div className="space-y-6 border-t border-slate-100 pt-8">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">Need Help?</h2>
                  <p className="text-sm text-slate-500">
                    Questions about your order? Our concierge team is here to assist you.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full rounded-none border-slate-900 text-xs font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white"
                    onClick={() => router.push('/support')}
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;

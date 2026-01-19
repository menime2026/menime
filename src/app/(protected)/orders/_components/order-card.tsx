'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserOrderData } from '@/server/order-service';
import { CancelOrderModal } from './cancel-order-modal';

interface OrderCardProps {
  order: UserOrderData;
}

const FALLBACK_GRADIENT = 'bg-linear-to-br from-slate-200 via-slate-100 to-slate-300';

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

const getStatusColor = (status: string, cancellationStatus?: string) => {
  if (cancellationStatus && cancellationStatus !== 'NONE') {
    switch (cancellationStatus) {
      case 'REQUESTED':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'APPROVED':
      case 'REFUNDED':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'REJECTED':
        return 'text-rose-600 bg-rose-50 border-rose-100';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  }

  switch (status) {
    case 'PENDING':
    case 'PROCESSING':
      return 'text-amber-600 bg-amber-50 border-amber-100';
    case 'SHIPPED':
      return 'text-blue-600 bg-blue-50 border-blue-100';
    case 'DELIVERED':
      return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    case 'CANCELLED':
      return 'text-rose-600 bg-rose-50 border-rose-100';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-100';
  }
};

export function OrderCard({ order }: OrderCardProps) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const formattedTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: order.currency || 'INR',
  }).format(order.total);

  const canCancel = (order.status === 'PENDING' || order.status === 'PROCESSING') && order.cancellationStatus === 'NONE';
  const showCancellationStatus = order.cancellationStatus !== 'NONE';

  return (
    <div className="group relative overflow-hidden border border-slate-100 bg-white p-6 transition-all hover:border-slate-200 hover:shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-slate-900">
              Order #{order.orderNumber}
            </h3>
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status, order.cancellationStatus)}`}>
              {showCancellationStatus ? `Cancellation ${order.cancellationStatus}` : order.status}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Placed on {formatDate(order.placedAt)}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total</p>
          <p className="text-lg font-medium text-slate-900">{formattedTotal}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {order.items.slice(0, 5).map((item, index) => (
          <div key={`${item.id}-${index}`} className="group/item relative aspect-3/4 overflow-hidden bg-slate-50">
            {item.product?.mediaUrls && item.product.mediaUrls.length > 0 ? (
              <Image
                src={item.product.mediaUrls[0]}
                alt={item.product?.name || 'Product'}
                fill
                className="object-cover transition-transform duration-500 group-hover/item:scale-105"
              />
            ) : (
              <div className={`flex h-full w-full items-center justify-center ${FALLBACK_GRADIENT}`}>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                  No Image
                </span>
              </div>
            )}
            {item.quantity > 1 && (
              <div className="absolute bottom-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-[10px] font-medium text-slate-900 shadow-sm backdrop-blur-sm">
                {item.quantity}
              </div>
            )}
          </div>
        ))}
        {order.items.length > 5 && (
          <div className="flex aspect-3/4 items-center justify-center bg-slate-50 text-slate-500">
            <span className="text-xs font-medium">+{order.items.length - 5} more</span>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-slate-50 pt-6">
        <p className="text-sm text-slate-500">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </p>
        <div className="flex items-center gap-4">
          {canCancel && (
            <CancelOrderModal orderId={order.id} />
          )}
          <Button asChild variant="link" className="group/btn h-auto p-0 text-slate-900 hover:no-underline">
            <Link href={`/orders/${order.id}`} className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest">View Details</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

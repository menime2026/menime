"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatCurrency, formatNumber } from "@/lib/format";
import { RefreshCcw } from "lucide-react";
import { OrderStatus, PaymentStatus, CancellationStatus } from "@prisma/client";

const orderFormSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  paymentStatus: z.nativeEnum(PaymentStatus),
  cancellationStatus: z.nativeEnum(CancellationStatus),
  notes: z.string().optional().nullable(),
});

const fetcher = async <T,>(url: string): Promise<T> => {
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }

  return res.json();
};

type OrderItemResponse = {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  product: {
    id: string;
    name: string;
    slug: string;
  };
};

type OrderAddress = {
  fullName?: string;
  streetLine1?: string;
  streetLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  [key: string]: unknown;
} | null;

type OrderResponse = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingFee: number | null;
  tax: number | null;
  total: number;
  currency: string;
  notes: string | null;
  placedAt: string;
  fulfilledAt: string | null;
  cancelledAt: string | null;
  cancellationStatus: CancellationStatus;
  cancellationReason: string | null;
  refundAccountDetails: Record<string, unknown> | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  items: OrderItemResponse[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
};

const mapOrderToForm = (order: OrderResponse) => ({
  status: order.status,
  paymentStatus: order.paymentStatus,
  cancellationStatus: order.cancellationStatus,
  notes: order.notes ?? "",
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

type OrderClientProps = {
  initialOrders?: OrderResponse[];
};

const OrderClient = ({ initialOrders }: OrderClientProps) => {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    initialOrders && initialOrders.length > 0 ? initialOrders[0].id : null,
  );

  const { data: orders = [], isFetching } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => fetcher<OrderResponse[]>("/api/admin/order"),
    initialData: initialOrders,
  });

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      cancellationStatus: CancellationStatus.NONE,
      notes: "",
    },
  });

  const selectedOrder = useMemo(() => {
    if (orders.length === 0) return null;
    if (selectedOrderId) {
      return orders.find((order) => order.id === selectedOrderId) ?? orders[0];
    }

    return orders[0];
  }, [orders, selectedOrderId]);

  const lastSyncedId = useRef<string | null>(selectedOrder?.id ?? null);

  useEffect(() => {
    if (!selectedOrder || form.formState.isDirty) {
      return;
    }

    if (lastSyncedId.current === selectedOrder.id) {
      return;
    }

    form.reset(mapOrderToForm(selectedOrder));
    lastSyncedId.current = selectedOrder.id;
  }, [selectedOrder, form, form.formState.isDirty]);

  const updateMutation = useMutation({
    mutationFn: async (payload: OrderFormValues) => {
      if (!selectedOrder) return;

      const response = await fetch(`/api/admin/order/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: payload.status,
          paymentStatus: payload.paymentStatus,
          cancellationStatus: payload.cancellationStatus,
          notes: payload.notes?.trim() ? payload.notes.trim() : null,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({ message: "Unable to update order" }));
        throw new Error(body.message ?? "Unable to update order");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      form.reset(variables);
    },
  });

  const handleRowClick = (order: OrderResponse) => {
    setSelectedOrderId(order.id);
    form.reset(mapOrderToForm(order));
  };

  const onSubmit: SubmitHandler<OrderFormValues> = (values) => {
    return updateMutation.mutate(values);
  };

  const mutationError = updateMutation.error as Error | undefined;

  const orderRows = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      customerName: order.user.name ?? "Guest",
    }));
  }, [orders]);

  const renderAddress = (address: OrderAddress) => {
    if (!address) return "Not provided";

    const parts = [
      address.fullName,
      address.streetLine1,
      address.streetLine2,
      [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
      address.country,
    ]
      .filter(Boolean)
      .join("\n");

    return parts || "Not provided";
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-light text-slate-900">Recent Orders</h2>
              <p className="mt-1 text-sm text-slate-500">
                {isFetching ? "Refreshing orders…" : `${formatNumber(orderRows.length)} records found`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })}
              className="rounded-full border-slate-200 px-4 font-medium uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <RefreshCcw className="mr-2 h-3 w-3" /> Refresh
            </Button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Order</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Customer</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Total</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderRows.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <tr
                      key={order.id}
                      className={cn(
                        "group cursor-pointer transition-all hover:bg-slate-50",
                        isSelected ? "bg-slate-50" : "",
                      )}
                      onClick={() => handleRowClick(order)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{order.orderNumber}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(order.placedAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <p className="font-medium text-slate-900">{order.customerName}</p>
                        <p className="text-xs text-slate-500">{order.user.email}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-600">
                            {order.status}
                          </span>
                          {order.cancellationStatus !== 'NONE' && (
                            <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                              order.cancellationStatus === 'REQUESTED' ? 'bg-amber-100 text-amber-700' :
                              order.cancellationStatus === 'APPROVED' || order.cancellationStatus === 'REFUNDED' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {order.cancellationStatus}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {orderRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      {isFetching ? "Loading orders…" : "No orders yet"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {selectedOrder ? (
            <div className="mt-8 border-t border-slate-100 pt-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Line items</h3>
              <div className="mt-6 space-y-4">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 text-sm text-slate-600">
                    <div>
                      <p className="font-medium text-slate-900">{item.product.name}</p>
                      <p className="text-xs text-slate-500">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                    </div>
                    <p className="font-medium text-slate-900">{formatCurrency(item.lineTotal)}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="space-y-8 lg:col-span-4">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
          <h2 className="text-xl font-light text-slate-900">Order Details</h2>
          <p className="mt-2 text-sm text-slate-500">
            Update fulfillment and payment state.
          </p>

          {selectedOrder ? (
            <Form {...form}>
              <form className="mt-8 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                {mutationError ? (
                  <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {mutationError.message}
                  </p>
                ) : null}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">Fulfillment status</FormLabel>
                      <FormControl>
                        <select
                          className="h-12 w-full rounded-xl border-0 bg-slate-50 px-4 text-sm text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-slate-900/5"
                          value={field.value}
                          onChange={(event) => field.onChange(event.target.value as OrderStatus)}
                        >
                          {Object.values(OrderStatus).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>Communicate where the package stands.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">Payment status</FormLabel>
                      <FormControl>
                        <select
                          className="h-12 w-full rounded-xl border-0 bg-slate-50 px-4 text-sm text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-slate-900/5"
                          value={field.value}
                          onChange={(event) => field.onChange(event.target.value as PaymentStatus)}
                        >
                          {Object.values(PaymentStatus).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>Track what finance should expect.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cancellationStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">Cancellation status</FormLabel>
                      <FormControl>
                        <select
                          className="h-12 w-full rounded-xl border-0 bg-slate-50 px-4 text-sm text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-slate-900/5"
                          value={field.value}
                          onChange={(event) => field.onChange(event.target.value as CancellationStatus)}
                        >
                          {Object.values(CancellationStatus).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>Manage cancellation requests.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedOrder.cancellationStatus !== 'NONE' && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                    <h4 className="mb-2 text-sm font-bold text-amber-900">Cancellation Request Details</h4>
                    <div className="space-y-2 text-sm text-amber-800">
                      <p><span className="font-medium">Reason:</span> {selectedOrder.cancellationReason}</p>
                      {selectedOrder.refundAccountDetails && (
                        <div>
                          <p className="font-medium">Refund Account:</p>
                          <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">
                            {JSON.stringify(selectedOrder.refundAccountDetails, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-500">Internal notes</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Gift wrap request, delivery instructions…"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          className="rounded-xl border-0 bg-slate-50 px-4 py-3 text-slate-900 transition-all focus:bg-white focus:ring-2 focus:ring-slate-900/5"
                        />
                      </FormControl>
                      <FormDescription>Only your team can see these.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => (selectedOrder ? form.reset(mapOrderToForm(selectedOrder)) : undefined)}
                    disabled={updateMutation.isPending}
                    className="h-12 rounded-full border-slate-200 px-6 font-medium uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="h-12 rounded-full bg-slate-900 px-8 font-medium uppercase tracking-wider text-white hover:bg-slate-800"
                  >
                    Save changes
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <p className="mt-6 text-sm text-slate-500">Select an order to manage statuses.</p>
          )}
        </div>

        {selectedOrder ? (
          <div className="rounded-[2.5rem] bg-white p-8 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Summary</h3>
            <dl className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="font-medium text-slate-900">{formatCurrency(selectedOrder.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd className="font-medium text-slate-900">{selectedOrder.shippingFee !== null ? formatCurrency(selectedOrder.shippingFee) : "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Tax</dt>
                <dd className="font-medium text-slate-900">{selectedOrder.tax !== null ? formatCurrency(selectedOrder.tax) : "—"}</dd>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-4 text-base font-bold text-slate-900">
                <dt>Total</dt>
                <dd>{formatCurrency(selectedOrder.total)}</dd>
              </div>
              <div className="flex justify-between pt-2">
                <dt>Placed</dt>
                <dd>{new Date(selectedOrder.placedAt).toLocaleString()}</dd>
              </div>
              {selectedOrder.fulfilledAt ? (
                <div className="flex justify-between">
                  <dt>Fulfilled</dt>
                  <dd>{new Date(selectedOrder.fulfilledAt).toLocaleString()}</dd>
                </div>
              ) : null}
              {selectedOrder.cancelledAt ? (
                <div className="flex justify-between text-rose-500">
                  <dt>Cancelled</dt>
                  <dd>{new Date(selectedOrder.cancelledAt).toLocaleString()}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-8 grid gap-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Shipping to
                </h4>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{renderAddress(selectedOrder.shippingAddress)}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Billing to
                </h4>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{renderAddress(selectedOrder.billingAddress)}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OrderClient;
export type { OrderResponse };

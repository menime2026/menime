import { Button } from "@/components/ui/button";
import { getAdminReportSummary } from "@/lib/admin/report";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, MoreHorizontal, ShoppingBag, Users2 } from "lucide-react";
import Link from "next/link";
import PerformanceGraph from "../_components/performance-graph";
import { StatCard } from "../_components/stat-card";
import TrendChart from "../_components/trend-chart";

type AdminReportSummary = Awaited<ReturnType<typeof getAdminReportSummary>>;

const DashboardPage = async () => {
  const report: AdminReportSummary = await getAdminReportSummary();
  const { kpis, revenueTrend, topProducts, collectionPerformance, newCustomers, recentOrders, orderTotals } = report;
  const statusPriority = ["PENDING", "PROCESSING", "SHIPPED", "RETURNED", "CANCELLED"];
  const nonDeliveredOrders = recentOrders
    .filter((order) => order.status !== "DELIVERED")
    .sort((a, b) => {
      const aPriority = statusPriority.indexOf(a.status);
      const bPriority = statusPriority.indexOf(b.status);
      if (aPriority === -1 && bPriority === -1) return a.status.localeCompare(b.status);
      if (aPriority === -1) return 1;
      if (bPriority === -1) return -1;
      return aPriority - bPriority;
    });
  const statusSummary = nonDeliveredOrders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-12">
      <section className="flex flex-col gap-8 rounded-[2.5rem] bg-white p-8 lg:p-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Operations overview</p>
            <h1 className="text-4xl font-light text-slate-900 lg:text-5xl">Commerce Pulse</h1>
            <p className="max-w-xl text-sm text-slate-500">
              Track revenue, customer growth, and operational performance across your Hub Fashiion storefront.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/report"
              className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 px-6 text-xs font-bold uppercase tracking-widest text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
            >
              Download report
            </Link>
            <Link
              href="/admin/order"
              className="inline-flex h-10 items-center justify-center rounded-full bg-slate-900 px-6 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-slate-800"
            >
              Manage orders
            </Link>
          </div>
        </div>
        <div className="grid gap-6 border-t border-slate-100 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fulfillment rate</p>
            <p className="mt-2 text-3xl font-light text-slate-900">{formatPercent(kpis.fulfillmentRate)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Open orders</p>
            <p className="mt-2 text-3xl font-light text-slate-900">{formatNumber(kpis.pendingOrders)}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Average basket</p>
            <p className="mt-2 text-3xl font-light text-slate-900">{formatCurrency(kpis.averageOrderValue)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(kpis.totalRevenue)}
          change={`${formatPercent(kpis.fulfillmentRate)} fulfillment`}
          caption="All time store revenue"
        />
        <StatCard
          title="Orders"
          value={formatNumber(kpis.totalOrders)}
          change={`${formatNumber(kpis.pendingOrders)} open`}
          caption="Lifetime customer orders"
          icon={ShoppingBag}
          tone="success"
        />
        <StatCard
          title="Average Order Value"
          value={formatCurrency(kpis.averageOrderValue)}
          change={`${formatCurrency(kpis.totalRevenue / Math.max(kpis.totalOrders, 1))} avg`}
          caption="Per order"
          tone="warning"
        />
        <StatCard
          title="Abandoned carts"
          value={formatNumber(kpis.abandonedCarts)}
          change={`${formatPercent(kpis.fulfillmentRate)} fulfillment rate`}
          caption="Carts started without checkout"
          icon={Users2}
          tone="danger"
        />
      </section>

      <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8 rounded-4xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Revenue momentum</p>
              <h2 className="mt-2 text-2xl font-light text-slate-900">Trend & detailed graph</h2>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {revenueTrend.length} month view
            </p>
          </div>
          <TrendChart data={revenueTrend} />
          <PerformanceGraph
            data={revenueTrend}
            title="Revenue graph"
            subtitle="Past 6 months"
          />
        </div>
        <div className="rounded-4xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="flex h-full flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Order volume</p>
                <p className="mt-2 text-4xl font-light text-slate-900">{formatNumber(orderTotals.quantity)}</p>
                <p className="mt-1 text-xs text-slate-500">Items fulfilled this year</p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  <ArrowUpRight className="h-3 w-3" /> {formatPercent(kpis.fulfillmentRate)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  <ArrowDownRight className="h-3 w-3" /> {kpis.cancelledOrders} cancelled
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Delivered</span>
                <span className="font-medium text-slate-900">{formatNumber(kpis.fulfilledOrders)}</span>
              </div>
              <div className="flex h-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="bg-slate-900"
                  style={{ width: `${Math.min(kpis.fulfillmentRate, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Pending</span>
                <span>{formatNumber(kpis.pendingOrders)}</span>
              </div>
            </div>
            <div className="flex flex-1 flex-col rounded-3xl border border-slate-100 bg-slate-50 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active pipeline</p>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {nonDeliveredOrders.length} orders
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.keys(statusSummary).length === 0 ? (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No outstanding statuses</span>
                ) : (
                  [...statusPriority, ...Object.keys(statusSummary).filter((status) => !statusPriority.includes(status))]
                    .filter((status) => statusSummary[status])
                    .map((status) => (
                      <span key={status} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {status} · {statusSummary[status]}
                      </span>
                    ))
                )}
              </div>
              <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300">
                {nonDeliveredOrders.length === 0 ? (
                  <p className="text-xs text-slate-500">No pending or exception orders — fulfillment is caught up.</p>
                ) : (
                  nonDeliveredOrders.map((order) => {
                    const badgeTone: Record<string, string> = {
                      PENDING: "bg-amber-50 text-amber-700 border-amber-100",
                      PROCESSING: "bg-sky-50 text-sky-700 border-sky-100",
                      CANCELLED: "bg-rose-50 text-rose-600 border-rose-100",
                      RETURNED: "bg-indigo-50 text-indigo-700 border-indigo-100",
                    };
                    const badgeClass = badgeTone[order.status] ?? "bg-slate-50 text-slate-700 border-slate-100";

                    return (
                      <div key={order.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">#{order.orderNumber}</p>
                          <p className="text-xs text-slate-500">{order.user?.name ?? "Guest"}</p>
                        </div>
                        <div className="text-right">
                          <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest", badgeClass)}>
                            {order.status}
                          </span>
                          <p className="mt-1 text-sm font-medium text-slate-900">{formatCurrency(order.total)}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

            <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-4xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Top performers</p>
              <h2 className="mt-2 text-2xl font-light text-slate-900">Best selling products</h2>
            </div>
            <Button variant="outline" size="sm" className="h-8 rounded-full border-slate-200 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50">
              View report
            </Button>
          </div>
          <div className="space-y-6">
            {topProducts.map((product, i) => (
              <div key={product.id} className="group flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-xs font-bold text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  {i + 1}
                </div>
                <div className="h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                  {product.images[0] && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="text-xs text-slate-500">{formatNumber(product.quantitySold)} units sold</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">{formatCurrency(product.price)}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Top tier</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-4xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Collection mix</p>
              <h2 className="mt-2 text-2xl font-light text-slate-900">Sales by category</h2>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-50">
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </Button>
          </div>
          <div className="flex h-[300px] items-center justify-center">
            <div className="relative flex h-full w-full items-center justify-center">
              {/* Placeholder for a donut chart - in a real app use Recharts PieChart */}
              <div className="relative h-48 w-48 rounded-full border-16 border-slate-100">
                <div className="absolute -inset-16 rounded-full border-16 border-slate-900 border-l-transparent border-b-transparent rotate-45"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-light text-slate-900">
                    {formatPercent(
                      collectionPerformance[0]?.quantitySold /
                        collectionPerformance.reduce((acc, curr) => acc + curr.quantitySold, 0) || 0
                    )}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {collectionPerformance[0]?.name || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {collectionPerformance.slice(0, 4).map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                <div className="h-2 w-2 rounded-full bg-slate-900" />
                <div>
                  <p className="text-sm font-medium text-slate-900">{cat.name}</p>
                  <p className="text-xs text-slate-500">{cat.quantitySold} units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 xl:grid-cols-[3fr_2fr]">
        <div className="rounded-4xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Recent activity</p>
              <h2 className="mt-2 text-2xl font-light text-slate-900">Latest orders</h2>
            </div>
            <Link href="/admin/order" className="inline-flex h-8 items-center justify-center rounded-full border border-slate-200 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50">
              View all orders
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-bold">Order ID</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">#{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{order.user?.name || "Guest"}</div>
                      <div className="text-xs text-slate-500">{order.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">{formatCurrency(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recentOrders.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">
                No orders yet. Run a seasonal campaign to bring shoppers in.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-4xl border border-slate-100 bg-white p-8 shadow-sm">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Community</p>
              <h2 className="mt-2 text-2xl font-light text-slate-900">Fresh customers</h2>
            </div>
            <Link href="/admin/customer" className="inline-flex h-8 items-center justify-center rounded-full border border-slate-200 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-900 hover:bg-slate-50">
              Manage
            </Link>
          </div>
          <div className="space-y-6">
            {newCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {customer.name?.[0] || "G"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{customer.name}</p>
                  <p className="text-xs text-slate-500">
                    Joined {customer.createdAt.toLocaleDateString()} · {customer.orderCount} orders
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-900">{formatCurrency(customer.lifetimeValue)}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">LTV</span>
                </div>
              </div>
            ))}
            {newCustomers.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-500">
                Grow your community with targeted marketing campaigns.
              </div>
            )}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100">
            <Button className="w-full rounded-full bg-slate-900 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-slate-800">
              View customer database
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

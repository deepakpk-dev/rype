"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  AlertTriangle,
  Clock,
  Database,
  ShieldAlert,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { useCurrentUser } from "@/lib/session-helpers";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatEUR } from "@/lib/utils";
import type { OrderWithItems } from "@/lib/orders/queries";

export function DashboardClient({
  stats,
  recent,
  lowStock,
  lowStockThreshold,
  dbError,
}: {
  stats: { total: number; pending: number; revenue: number };
  recent: OrderWithItems[];
  lowStock: number;
  lowStockThreshold: number;
  dbError: string | null;
}) {
  const { user } = useCurrentUser();

  return (
    <div>
      <Suspense fallback={null}>
        <DeniedBanner />
      </Suspense>

      <div className="mb-8">
        <div className="text-xs font-medium uppercase tracking-wider text-rype-mute">
          Welcome back
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Hey, {user?.name?.split(" ")[0] ?? "there"}.
        </h1>
        <p className="mt-1 text-sm text-rype-mute">
          Here&apos;s what&apos;s moving through the warehouse today.
        </p>
      </div>

      {dbError && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-rype-orange/30 bg-rype-orange/5 px-4 py-3 text-sm text-rype-orange">
          <Database className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium text-rype-ink">Database not connected</div>
            <div className="mt-0.5 text-rype-ink/70">{dbError}</div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total orders" value={stats.total.toString()} icon={ShoppingBag} tone="leaf" />
        <StatCard
          label="Revenue"
          value={formatEUR(stats.revenue)}
          icon={TrendingUp}
          hint="Excluding cancelled"
          tone="yellow"
        />
        <StatCard
          label="Pending"
          value={stats.pending.toString()}
          icon={Clock}
          hint="Need processing"
          tone="orange"
        />
        <StatCard
          label="Low stock"
          value={lowStock.toString()}
          icon={AlertTriangle}
          hint={`≤ ${lowStockThreshold} units`}
          tone="red"
        />
      </div>

      <div className="mt-8 card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-rype-leafDark hover:underline">
            View all →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="py-12 text-center text-sm text-rype-mute">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-rype-mute">
                <tr>
                  <th className="px-2 py-2 font-medium">Order</th>
                  <th className="px-2 py-2 font-medium">Customer</th>
                  <th className="px-2 py-2 font-medium">Items</th>
                  <th className="px-2 py-2 font-medium">Total</th>
                  <th className="px-2 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => (
                  <tr key={o.id} className="border-t border-rype-line">
                    <td className="px-2 py-3 font-mono text-xs text-rype-mute">{o.id}</td>
                    <td className="px-2 py-3">
                      <div className="font-medium">{o.customerName}</div>
                      <div className="text-xs text-rype-mute">{o.customerCity}</div>
                    </td>
                    <td className="px-2 py-3 text-rype-mute">
                      {o.items.reduce((a, i) => a + i.qty, 0)}
                    </td>
                    <td className="px-2 py-3 font-medium">{formatEUR(o.total)}</td>
                    <td className="px-2 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function DeniedBanner() {
  const params = useSearchParams();
  if (params.get("denied") !== "1") return null;
  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-rype-red/30 bg-rype-red/5 px-4 py-3 text-sm text-rype-red">
      <ShieldAlert className="h-4 w-4" />
      That page is admin-only. You were redirected back to the dashboard.
    </div>
  );
}

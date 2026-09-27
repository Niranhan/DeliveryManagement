import { useAppData } from '@/context/AppDataContext';
import { computeStats, computeRestaurantBreakdown } from '@/utils/stats';
import { formatRsPlain } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';

export function DailySummaryScreen() {
  const { currentDutyOrders } = useAppData();
  const stats = computeStats(currentDutyOrders);
  const breakdown = computeRestaurantBreakdown(currentDutyOrders);

  return (
    <AppShell>
      <PageHeader title="Daily Summary" />

      <div className="page-pad pt-2 pb-6 space-y-5">
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Today's Summary</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <StatCard label="Orders Completed" value={String(stats.completedCount)} emphasis />
            <StatCard label="Total Margin" value={formatRsPlain(stats.totalMargin)} tone="success" emphasis />
            <StatCard label="Paid to Restaurants" value={formatRsPlain(stats.totalPaid)} />
            <StatCard label="Collected from Customers" value={formatRsPlain(stats.totalCollected)} />
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Restaurant Breakdown</h2>
          {breakdown.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">No completed orders yet.</p>
          ) : (
            <div className="space-y-2.5">
              {breakdown.map((row) => (
                <div key={row.restaurantId} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-ink-900">{row.restaurantName}</p>
                    <span className="text-xs text-ink-400">{row.orderCount} orders</span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-ink-100 pt-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-ink-400">Paid</p>
                      <p className="text-sm font-semibold text-ink-700">{formatRsPlain(row.paid)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-ink-400">Collected</p>
                      <p className="text-sm font-semibold text-ink-700">{formatRsPlain(row.collected)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-ink-400">Margin</p>
                      <p className={`text-sm font-bold ${row.margin >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                        {row.margin >= 0 ? '+' : '-'}Rs. {Math.abs(row.margin).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

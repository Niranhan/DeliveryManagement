import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { computeStats } from '@/utils/stats';
import { formatRsPlain } from '@/types';
import { monthlyReportService } from '@/services/monthlyReportService';
import type { MonthlyReport } from '@/types';
import { currentMonth, formatMonthLabel } from '@/utils/month';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { OrderCard } from '@/components/OrderCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ChevronRight, Plus, Calendar } from 'lucide-react';

export function HomeScreen() {
  const navigate = useNavigate();
  const { currentDutyOrders } = useAppData();
  const stats = computeStats(currentDutyOrders);
  const activeOrders = currentDutyOrders.filter((o) => o.status === 'WAITING');
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [monthlyLoading, setMonthlyLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setMonthlyLoading(true);
    monthlyReportService
      .getForMonth(currentMonth())
      .then((r) => {
        if (mounted) setMonthlyReport(r);
      })
      .catch(() => {
        if (mounted) setMonthlyReport(null);
      })
      .finally(() => {
        if (mounted) setMonthlyLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const settlement = monthlyReport && monthlyReport.salary != null ? monthlyReport.salary - monthlyReport.totalAdvances - monthlyReport.totalLiabilities : 0;
  const isNegative = settlement < 0;

  return (
    <AppShell>
      <div className="page-pad pt-5">
        <p className="text-sm text-ink-500">{greeting}</p>
        <h1 className="mt-0.5 text-2xl font-bold text-ink-900">Today's Deliveries</h1>
        <p className="mt-0.5 text-sm text-ink-400">{today}</p>
      </div>

      <div className="page-pad mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Today's Duty</p>
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Orders" value={String(stats.completedCount)} emphasis />
          <StatCard label="Margin" value={formatRsPlain(stats.totalMargin)} tone="success" emphasis />
          <StatCard label="Paid" value={formatRsPlain(stats.totalPaid)} />
          <StatCard label="Collected" value={formatRsPlain(stats.totalCollected)} />
        </div>
      </div>

      <div className="page-pad mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-ink-900">Active Orders</h2>
            <p className="text-xs text-ink-400">{stats.activeCount} active</p>
          </div>
          {activeOrders.length > 0 && (
            <button
              onClick={() => navigate('/active')}
              className="no-tap flex items-center gap-0.5 text-sm font-semibold text-brand-600 active:opacity-70"
            >
              View all
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {activeOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-6 text-center">
            <p className="text-sm font-medium text-ink-700">No active deliveries</p>
            <p className="mt-0.5 text-xs text-ink-400">All your deliveries are completed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.slice(0, 3).map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                variant="active"
                action={
                  <PrimaryButton
                    size="md"
                    fullWidth
                    onClick={() => navigate(`/orders/${o.id}/complete`)}
                  >
                    Collect from customer
                  </PrimaryButton>
                }
              />
            ))}
          </div>
        )}
      </div>

      <div className="page-pad mt-6">
        <PrimaryButton onClick={() => navigate('/orders/new')}>
          <Plus size={20} />
          Pick Up Order
        </PrimaryButton>
      </div>

      {/* Monthly Overview */}
      <div className="page-pad mt-6">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-900">Monthly Overview</h2>
          <button
            onClick={() => navigate('/monthly')}
            className="no-tap flex items-center gap-0.5 text-sm font-semibold text-brand-600 active:opacity-70"
          >
            Details
            <ChevronRight size={16} />
          </button>
        </div>

        {monthlyLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : monthlyReport ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard label="Monthly Orders" value={String(monthlyReport.totalOrders)} />
              <StatCard label="Delivery Margin" value={formatRsPlain(monthlyReport.deliveryMargin)} tone="success" />
            </div>

            <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{formatMonthLabel(currentMonth())}</p>
              <div className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Salary</span>
                  <span className="font-semibold text-ink-900">
                    {monthlyReport.salary != null ? formatRsPlain(monthlyReport.salary) : 'Not set'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Advances</span>
                  <span className="font-semibold text-ink-900">{formatRsPlain(monthlyReport.totalAdvances)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-500">Company Liability</span>
                  <span className="font-semibold text-ink-900">{formatRsPlain(monthlyReport.totalLiabilities)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-ink-100 pt-1.5">
                  <span className="text-sm font-bold text-ink-700">
                    {isNegative ? 'Payable to Company' : 'Amount to Receive'}
                  </span>
                  <span className={`text-sm font-bold ${isNegative ? 'text-danger-600' : 'text-success-600'}`}>
                    {formatRsPlain(Math.abs(settlement))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate('/monthly')}
            className="no-tap flex w-full items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 text-left shadow-card active:shadow-card-hover"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">Monthly Overview</p>
                <p className="text-xs text-ink-400">View monthly report and settlement</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-ink-300" />
          </button>
        )}
      </div>

      <div className="page-pad mt-6 pb-4">
        <button
          onClick={() => navigate('/summary')}
          className="no-tap flex w-full items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 text-left shadow-card active:shadow-card-hover"
        >
          <div>
            <p className="text-sm font-semibold text-ink-900">Daily Summary</p>
            <p className="text-xs text-ink-400">View breakdown by restaurant</p>
          </div>
          <ChevronRight size={18} className="text-ink-300" />
        </button>
      </div>
    </AppShell>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { monthlyReportService } from '@/services/monthlyReportService';
import type { MonthlyReport } from '@/types';
import { formatRsPlain } from '@/types';
import { currentMonth } from '@/utils/month';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { StatCard } from '@/components/ui/StatCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { TrendingUp, Wallet, ArrowDownCircle, AlertCircle } from 'lucide-react';

export function MonthlyOverviewScreen() {
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentMonth());
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    monthlyReportService
      .getForMonth(month)
      .then((r) => {
        if (mounted) setReport(r);
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message || 'Could not load monthly data.');
          setReport(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [month]);

  const settlement = report && report.amountToReceive != null ? report.amountToReceive : 0;
  const settlementAvailable = report ? report.amountToReceive != null : false;
  const isNegative = report ? settlement < 0 : false;

  return (
    <AppShell>
      <PageHeader title="Monthly Overview" />

      <div className="page-pad pt-2 pb-6 space-y-5">
        <MonthSelector month={month} onChange={setMonth} />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-ink-100 bg-white p-4 text-center">
            <p className="text-sm text-danger-600">{error}</p>
          </div>
        ) : report ? (
          <>
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Delivery Activity</h2>
              <div className="grid grid-cols-2 gap-2.5">
                <StatCard label="Total Orders" value={String(report.totalOrders)} emphasis />
                <StatCard label="Completed" value={String(report.completedOrders)} />
                <StatCard label="Paid to Restaurants" value={formatRsPlain(report.totalPaid)} />
                <StatCard label="Collected" value={formatRsPlain(report.totalCollected)} />
              </div>
              <div className="mt-2.5">
                <StatCard label="Delivery Margin" value={formatRsPlain(report.deliveryMargin)} tone="success" emphasis />
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Salary Settlement</h2>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Wallet size={20} />
                    </div>
                    <span className="text-sm font-semibold text-ink-700">Monthly Salary</span>
                  </div>
                  <span className="text-base font-bold text-ink-900">
                    {report.salary != null ? formatRsPlain(report.salary) : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-100 text-warning-600">
                      <ArrowDownCircle size={20} />
                    </div>
                    <span className="text-sm font-semibold text-ink-700">Salary Advances</span>
                  </div>
                  <span className="text-base font-bold text-ink-900">{formatRsPlain(report.totalAdvances)}</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-100 text-danger-600">
                      <AlertCircle size={20} />
                    </div>
                    <span className="text-sm font-semibold text-ink-700">Company Liability</span>
                  </div>
                  <span className="text-base font-bold text-ink-900">{formatRsPlain(report.totalLiabilities)}</span>
                </div>

                <div
                  className={`flex items-center justify-between rounded-2xl border-2 p-4 shadow-card ${
                    isNegative ? 'border-danger-200 bg-danger-50' : 'border-success-200 bg-success-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isNegative ? 'bg-danger-100 text-danger-600' : 'bg-success-100 text-success-600'
                      }`}
                    >
                      <TrendingUp size={20} />
                    </div>
                    <span className="text-sm font-bold text-ink-900">
                      {isNegative ? 'Payable to Company' : 'Amount to Receive'}
                    </span>
                  </div>
                  <span className={`text-lg font-bold ${isNegative ? 'text-danger-600' : 'text-success-600'}`}>
                    {settlementAvailable ? formatRsPlain(Math.abs(settlement)) : 'Not available'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <PrimaryButton variant="secondary" onClick={() => navigate(`/salary?month=${month}`)}>
                Edit Salary
              </PrimaryButton>
              <PrimaryButton variant="secondary" onClick={() => navigate(`/advances?month=${month}`)}>
                View Salary Advances
              </PrimaryButton>
              <PrimaryButton variant="secondary" onClick={() => navigate(`/liabilities?month=${month}`)}>
                View Company Liability
              </PrimaryButton>
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

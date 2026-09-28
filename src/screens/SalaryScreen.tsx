import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { salaryService } from '@/services/salaryService';
import type { MonthlySalary } from '@/types';
import { formatRsPlain } from '@/types';
import { currentMonth, formatMonthLabel } from '@/utils/month';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AmountInput } from '@/components/ui/AmountInput';

export function SalaryScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [month, setMonth] = useState(params.get('month') ?? currentMonth());
  const [salary, setSalary] = useState<MonthlySalary | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    salaryService
      .getForMonth(month)
      .then((s) => {
        if (!mounted) return;
        setSalary(s);
        setAmount(s ? String(s.salaryAmount) : '');
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Could not load salary.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [month]);

  const handleSave = async () => {
    const amt = Number(amount);
    if (!amount.trim() || isNaN(amt) || amt < 0) {
      setError('Enter a valid salary amount.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const saved = await salaryService.setForMonth(month, amt);
      setSalary(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save salary.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell showNav={false}>
      <PageHeader title="Monthly Salary" onBack={() => navigate(-1)} />

      <div className="page-pad pt-2 pb-6 space-y-5">
        <MonthSelector month={month} onChange={setMonth} />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-500">
              {formatMonthLabel(month)}
            </p>

            {salary && (
              <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Current Salary</p>
                <p className="mt-1 text-2xl font-bold text-ink-900">{formatRsPlain(salary.salaryAmount)}</p>
              </div>
            )}

            <div>
              <AmountInput
                label="Monthly Salary Amount"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
              />
              {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
            </div>

            <PrimaryButton onClick={handleSave} loading={saving}>
              {saving ? 'Saving...' : 'Save Salary'}
            </PrimaryButton>

            {!salary && !loading && (
              <p className="text-center text-sm text-ink-400">No salary entered for this month.</p>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

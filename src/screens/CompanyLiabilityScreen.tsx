import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { liabilityService } from '@/services/liabilityService';
import type { CompanyLiability } from '@/types';
import { formatRsPlain } from '@/types';
import { currentMonth, formatMonthLabel, todayIsoDate } from '@/utils/month';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { MonthSelector } from '@/components/ui/MonthSelector';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AmountInput } from '@/components/ui/AmountInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { Trash2, Plus } from 'lucide-react';

export function CompanyLiabilityScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [month, setMonth] = useState(params.get('month') ?? currentMonth());
  const [liabilities, setLiabilities] = useState<CompanyLiability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAdd, setShowAdd] = useState(false);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayIsoDate());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    let mounted = true;
    setLoading(true);
    setError('');
    liabilityService
      .getForMonth(month)
      .then((l) => {
        if (mounted) setLiabilities(l);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Could not load liabilities.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  };

  useEffect(() => {
    const cleanup = load();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const total = liabilities.reduce((sum, l) => sum + l.amount, 0);

  const handleAdd = async () => {
    const amt = Number(amount);
    if (!amount.trim() || isNaN(amt) || amt <= 0) {
      setFormError('Enter a valid amount.');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      await liabilityService.create({ amount: amt, usageDate: date, note });
      setShowAdd(false);
      setAmount('');
      setNote('');
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not add liability.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await liabilityService.delete(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete liability.');
    }
  };

  return (
    <AppShell showNav={false}>
      <PageHeader title="Company Money" onBack={() => navigate(-1)} />

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
        ) : (
          <>
            <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Total Liability · {formatMonthLabel(month)}</p>
              <p className="mt-1 text-2xl font-bold text-ink-900">{formatRsPlain(total)}</p>
            </div>

            {showAdd ? (
              <div className="space-y-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
                <h3 className="text-sm font-bold text-ink-900">Record Company Money Used</h3>
                <AmountInput
                  label="Amount"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setFormError('');
                  }}
                />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-ink-200 bg-white px-4 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Note (optional)</label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Personal expense"
                    className="h-12 w-full rounded-2xl border border-ink-200 bg-white px-4 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                {formError && <p className="text-xs text-danger-600">{formError}</p>}
                <div className="flex gap-2.5">
                  <PrimaryButton onClick={handleAdd} loading={saving}>
                    Add
                  </PrimaryButton>
                  <PrimaryButton variant="secondary" onClick={() => setShowAdd(false)}>
                    Cancel
                  </PrimaryButton>
                </div>
              </div>
            ) : (
              <PrimaryButton onClick={() => setShowAdd(true)}>
                <Plus size={20} />
                Add Liability
              </PrimaryButton>
            )}

            {liabilities.length === 0 ? (
              <EmptyState title="No company-money usage" description={`No liabilities recorded for ${formatMonthLabel(month)}.`} />
            ) : (
              <div className="space-y-2.5">
                {liabilities.map((l) => (
                  <div key={l.id} className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink-900">{formatRsPlain(l.amount)}</p>
                      <p className="text-xs text-ink-400">
                        {new Date(l.usageDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {l.note && ` · ${l.note}`}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(l.id)}
                      className="no-tap flex h-9 w-9 items-center justify-center rounded-full text-ink-400 active:bg-danger-50 active:text-danger-600"
                      aria-label="Delete liability"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

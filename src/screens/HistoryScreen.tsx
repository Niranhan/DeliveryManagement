import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { ClipboardList, Calendar } from 'lucide-react';

export function HistoryScreen() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <PageHeader title="History" />

      <div className="page-pad pt-2 pb-6 space-y-3">
        <button
          onClick={() => navigate('/history/duty')}
          className="no-tap flex w-full items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card active:shadow-card-hover"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <ClipboardList size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-ink-900">Duty History</p>
              <p className="text-xs text-ink-400">View closed duties and download reports</p>
            </div>
          </div>
          <Calendar size={18} className="text-ink-300" />
        </button>

        <button
          onClick={() => navigate('/monthly')}
          className="no-tap flex w-full items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card active:shadow-card-hover"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Calendar size={20} />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-ink-900">Monthly Overview</p>
              <p className="text-xs text-ink-400">Monthly reports, salary and settlement</p>
            </div>
          </div>
          <Calendar size={18} className="text-ink-300" />
        </button>
      </div>
    </AppShell>
  );
}

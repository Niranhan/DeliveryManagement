import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { computeStats } from '@/utils/stats';
import { formatRsPlain } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { OrderCard } from '@/components/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { ClipboardCheck } from 'lucide-react';

type Tab = 'today' | 'all';

export function OrdersScreen() {
  const navigate = useNavigate();
  const { orders } = useAppData();
  const [tab, setTab] = useState<Tab>('today');

  const completed = useMemo(() => orders.filter((o) => o.status === 'COMPLETED'), [orders]);
  const stats = computeStats(orders);

  return (
    <AppShell>
      <PageHeader title="Orders" />

      <div className="page-pad pt-2">
        <div className="flex gap-1 rounded-2xl bg-ink-100 p-1">
          {(['today', 'all'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`no-tap flex-1 rounded-xl py-2.5 text-sm font-semibold capitalize transition-colors ${
                tab === t ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500'
              }`}
            >
              {t === 'today' ? 'Today' : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="page-pad mt-4">
        <div className="grid grid-cols-3 gap-2.5">
          <StatCard label="Completed" value={String(stats.completedCount)} emphasis />
          <StatCard label="Paid" value={formatRsPlain(stats.totalPaid)} />
          <StatCard label="Collected" value={formatRsPlain(stats.totalCollected)} />
        </div>
        <div className="mt-2.5">
          <StatCard label="Total Margin" value={formatRsPlain(stats.totalMargin)} tone="success" emphasis />
        </div>
      </div>

      <div className="page-pad mt-5 pb-6">
        {completed.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck size={28} />}
            title="No completed orders yet"
            description="Completed deliveries will appear here."
          />
        ) : (
          <div className="space-y-3">
            {completed.map((o) => (
              <OrderCard key={o.id} order={o} variant="completed" onClick={() => navigate(`/orders/${o.id}`)} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

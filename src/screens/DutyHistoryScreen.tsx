import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dutyService } from '@/services/dutyService';
import { orderService } from '@/services/dataService';
import type { Duty, Order } from '@/types';
import { formatRsPlain } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { generateDutyReportPdf } from '@/utils/pdfReport';
import { History as HistoryIcon, FileText, Download } from 'lucide-react';

// Hoisted so we don't reconstruct on every render or per-duty iteration.
const inrFormatter = new Intl.NumberFormat('en-IN');

export function DutyHistoryScreen() {
  const navigate = useNavigate();
  const [duties, setDuties] = useState<Duty[]>([]);
  const [ordersByDuty, setOrdersByDuty] = useState<Map<string, Order[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<{ dutyId: string; message: string } | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [closedDuties, allOrders] = await Promise.all([
          dutyService.getClosedDuties(),
          orderService.getAll(),
        ]);
        if (!mounted) return;
        setDuties(closedDuties);

        // Build the duty->orders index in a single O(n) pass over allOrders
        // instead of an O(d*n) filter loop.
        const map = new Map<string, Order[]>();
        for (const d of closedDuties) map.set(d.id, []);
        for (const o of allOrders) {
          const bucket = map.get(o.dutyId);
          if (bucket) bucket.push(o);
        }
        setOrdersByDuty(map);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Could not load duty history.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleDownload = async (duty: Duty) => {
    const orders = ordersByDuty.get(duty.id) ?? [];
    setDownloadingId(duty.id);
    setDownloadError(null);
    try {
      await generateDutyReportPdf({ duty, orders });
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : 'Could not generate the PDF. Please try again.';
      setDownloadError({ dutyId: duty.id, message: msg });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <AppShell>
      <PageHeader title="Duty History" />

      <div className="page-pad pt-2 pb-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-ink-100 bg-white p-4 text-center">
            <p className="text-sm text-danger-600">{error}</p>
          </div>
        ) : duties.length === 0 ? (
          <EmptyState
            icon={<HistoryIcon size={28} />}
            title="No duty history yet"
            description="Closed duties will appear here with their reports."
          />
        ) : (
          <div className="space-y-3">
            {duties.map((duty) => {
              const orders = ordersByDuty.get(duty.id) ?? [];
              const completed = orders.filter((o) => o.status === 'COMPLETED');
              const paid = completed.reduce((s, o) => s + o.paidToRestaurant, 0);
              const collected = completed.reduce(
                (s, o) => s + (o.collectedFromCustomer ?? 0),
                0,
              );
              const margin = collected - paid;
              const rowDownloadError =
                downloadError && downloadError.dutyId === duty.id ? downloadError.message : null;

              return (
                <div
                  key={duty.id}
                  className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-ink-900">
                        {new Date(duty.openedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-400">
                        {completed.length} orders · Closed at{' '}
                        {duty.closedAt
                          ? new Date(duty.closedAt).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : ''}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-ink-100 pt-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-ink-400">Paid</p>
                      <p className="text-sm font-semibold text-ink-700">{formatRsPlain(paid)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-ink-400">Collected</p>
                      <p className="text-sm font-semibold text-ink-700">
                        {formatRsPlain(collected)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-ink-400">Margin</p>
                      <p
                        className={`text-sm font-bold ${
                          margin >= 0 ? 'text-success-600' : 'text-danger-600'
                        }`}
                      >
                        {margin >= 0 ? '+' : '-'}Rs. {inrFormatter.format(Math.abs(margin))}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <PrimaryButton
                      variant="secondary"
                      size="md"
                      fullWidth={false}
                      onClick={() => navigate(`/duty/${duty.id}`)}
                    >
                      <FileText size={16} />
                      View
                    </PrimaryButton>
                    <PrimaryButton
                      variant="secondary"
                      size="md"
                      fullWidth={false}
                      loading={downloadingId === duty.id}
                      disabled={downloadingId === duty.id}
                      onClick={() => handleDownload(duty)}
                    >
                      <Download size={16} />
                      PDF
                    </PrimaryButton>
                  </div>

                  {rowDownloadError && (
                    <p role="alert" className="mt-2 text-xs text-danger-600">
                      {rowDownloadError}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
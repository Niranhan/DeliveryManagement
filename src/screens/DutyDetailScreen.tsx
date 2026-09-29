import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { requireUserId } from '@/lib/auth';
import type { Duty, Order } from '@/types';
import { formatRsPlain } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { OrderCard } from '@/components/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { ClipboardList } from 'lucide-react';

interface DbDuty {
  id: string;
  user_id: string;
  date: string;
  status: 'OPEN' | 'CLOSED';
  opened_at: string;
  closed_at: string | null;
  closing_report_generated: boolean;
}

interface DbOrder {
  id: string;
  user_id: string;
  order_number: string;
  restaurant_id: string;
  customer_reference: string;
  paid_to_restaurant: number;
  collected_from_customer: number | null;
  status: 'WAITING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  completed_at: string | null;
  duty_id: string;
}

export function DutyDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [duty, setDuty] = useState<Duty | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) return;
      try {
        const userId = await requireUserId();

        const [dutyRes, ordersRes, restaurantsRes] = await Promise.all([
          supabase
            .from('duties')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .maybeSingle(),
          supabase
            .from('orders')
            .select('*')
            .eq('duty_id', id)
            .eq('user_id', userId)
            .order('created_at', { ascending: true }),
          supabase
            .from('restaurants')
            .select('id, name')
            .eq('user_id', userId),
        ]);

        if (dutyRes.error) throw dutyRes.error;
        if (ordersRes.error) throw ordersRes.error;
        if (restaurantsRes.error) throw restaurantsRes.error;

        if (!mounted) return;

        if (!dutyRes.data) {
          setError('Duty not found.');
          setLoading(false);
          return;
        }

        const d = dutyRes.data as DbDuty;
        setDuty({
          id: d.id,
          userId: d.user_id,
          date: d.date,
          status: d.status,
          openedAt: d.opened_at,
          closedAt: d.closed_at,
          closingReportGenerated: d.closing_report_generated,
        });

        const restaurantNames = new Map(
          (restaurantsRes.data as { id: string; name: string }[]).map((r) => [
            r.id,
            r.name,
          ]),
        );

        const mapped = (ordersRes.data as DbOrder[]).map((row) => ({
          id: row.id,
          orderNumber: row.order_number,
          restaurantId: row.restaurant_id,
          restaurantName: restaurantNames.get(row.restaurant_id) ?? 'Unknown Restaurant',
          customerReference: row.customer_reference,
          paidToRestaurant: Number(row.paid_to_restaurant),
          collectedFromCustomer:
            row.collected_from_customer == null ? null : Number(row.collected_from_customer),
          status: row.status,
          createdAt: row.created_at,
          completedAt: row.completed_at,
          dutyId: row.duty_id,
        }));

        setOrders(mapped);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Could not load duty.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const completed = orders.filter((o) => o.status === 'COMPLETED');
  const paid = completed.reduce((s, o) => s + o.paidToRestaurant, 0);
  const collected = completed.reduce((s, o) => s + (o.collectedFromCustomer ?? 0), 0);
  const margin = collected - paid;

  return (
    <AppShell showNav={false}>
      <PageHeader title="Duty Details" onBack={() => navigate('/history/duty')} />

      <div className="page-pad pt-2 pb-6 space-y-5">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-ink-100 bg-white p-4 text-center">
            <p className="text-sm text-danger-600">{error}</p>
          </div>
        ) : duty ? (
          <>
            <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
              <p className="text-base font-bold text-ink-900">
                {new Date(duty.openedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
              <p className="mt-0.5 text-xs text-ink-400">
                Status: {duty.status}
                {duty.closedAt &&
                  ` · Closed at ${new Date(duty.closedAt).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <StatCard label="Paid" value={formatRsPlain(paid)} />
              <StatCard label="Collected" value={formatRsPlain(collected)} />
              <StatCard
                label="Margin"
                value={formatRsPlain(margin)}
                tone={margin >= 0 ? 'success' : undefined}
                emphasis
              />
            </div>

            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Orders ({orders.length})
              </h2>
              {orders.length === 0 ? (
                <EmptyState
                  icon={<ClipboardList size={28} />}
                  title="No orders"
                  description="This duty has no orders."
                />
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      variant={o.status === 'COMPLETED' ? 'completed' : 'active'}
                      onClick={() => navigate(`/orders/${o.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

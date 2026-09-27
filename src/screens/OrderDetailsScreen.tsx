import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { marginOf, formatRsPlain } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CheckCircle, Clock, User } from 'lucide-react';

export function OrderDetailsScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders } = useAppData();
  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <AppShell>
        <PageHeader title="Order" onBack={() => navigate(-1)} />
        <div className="page-pad pt-6 text-center text-sm text-ink-500">Order not found.</div>
      </AppShell>
    );
  }

  const margin = marginOf(order);
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      month: 'short',
      day: 'numeric',
    });

  return (
    <AppShell>
      <PageHeader title={`Order ${order.orderNumber}`} onBack={() => navigate(-1)} />

      <div className="page-pad pt-2 pb-6 space-y-4">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-ink-900">{order.orderNumber}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm font-semibold text-ink-700">{order.restaurantName}</p>

          {order.customerReference && (
            <div className="mt-3 flex items-center gap-2 text-sm text-ink-500">
              <User size={15} />
              <span>{order.customerReference}</span>
            </div>
          )}

          <div className="mt-3 space-y-2 border-t border-ink-100 pt-3">
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Clock size={15} />
              <span>Picked up: {fmtTime(order.createdAt)}</span>
            </div>
            {order.completedAt && (
              <div className="flex items-center gap-2 text-sm text-ink-500">
                <CheckCircle size={15} />
                <span>Completed: {fmtTime(order.completedAt)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400">Financial Details</h3>

          <div className="mt-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-500">Paid to restaurant</span>
              <span className="text-base font-bold text-ink-900">{formatRsPlain(order.paidToRestaurant)}</span>
            </div>

            {order.status === 'COMPLETED' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-ink-500">Collected from customer</span>
                  <span className="text-base font-bold text-ink-900">{formatRsPlain(order.collectedFromCustomer ?? 0)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-ink-100 pt-3">
                  <span className="text-sm font-semibold text-ink-700">Margin</span>
                  <span className={`text-lg font-bold ${margin >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                    {margin >= 0 ? '+' : '-'}Rs. {Math.abs(margin).toLocaleString('en-IN')}
                  </span>
                </div>
              </>
            )}

            {order.status === 'WAITING' && (
              <div className="rounded-xl bg-warning-50 px-3 py-2.5 text-sm text-warning-700">
                Waiting for delivery — collect from customer to complete.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

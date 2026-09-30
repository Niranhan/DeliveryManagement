import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import type { Order } from '@/types';
import { formatRsPlain } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { OrderCard } from '@/components/OrderCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PackageOpen, Plus, AlertTriangle } from 'lucide-react';

export function ActiveOrdersScreen() {
  const navigate = useNavigate();
  const { currentDutyOrders, deleteOrder } = useAppData();
  const active = currentDutyOrders.filter((o) => o.status === 'WAITING');

  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const askDelete = (order: Order) => {
    setErrorBanner(null);
    setPendingDelete(order);
  };

  const cancelDelete = () => {
    if (deletingId) return; // don't allow closing mid-request
    setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setDeletingId(target.id);
    try {
      await deleteOrder(target.id);
      setPendingDelete(null);
    } catch (e) {
      const msg =
        e instanceof Error && e.message
          ? e.message
          : 'Could not delete this order. Please try again.';
      setErrorBanner(msg);
      setPendingDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Active Orders"
        subtitle={`${active.length} ${active.length === 1 ? 'order' : 'orders'} waiting`}
      />

      <div className="page-pad pt-2 pb-6">
        {errorBanner && (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-danger-200 bg-danger-50 px-3 py-2.5 text-sm text-danger-700"
          >
            {errorBanner}
          </div>
        )}

        {active.length === 0 ? (
          <EmptyState
            icon={<PackageOpen size={28} />}
            title="No active deliveries"
            description="All your deliveries are completed."
            action={
              <PrimaryButton onClick={() => navigate('/orders/new')}>
                <Plus size={20} />
                Pick Up Order
              </PrimaryButton>
            }
          />
        ) : (
          <div className="space-y-3">
            {active.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                variant="active"
                onDelete={() => askDelete(o)}
                deleting={deletingId === o.id}
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

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this order?"
        description={
          pendingDelete
            ? `${pendingDelete.orderNumber} · ${pendingDelete.restaurantName} · Paid Rs. ${formatRsPlain(
                pendingDelete.paidToRestaurant,
              ).replace(/^Rs\.?\s*/i, '')}\n\nOnly delete if the restaurant refunded you. If you paid and the customer refused delivery, do NOT delete — that money is a real loss and needs to stay in your report.`
            : ''
        }
        confirmLabel={deletingId ? 'Deleting...' : 'Delete order'}
        variant="danger"
        icon={<AlertTriangle size={24} className="text-danger-600" />}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </AppShell>
  );
}
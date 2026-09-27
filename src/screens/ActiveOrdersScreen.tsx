import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { OrderCard } from '@/components/OrderCard';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { PackageOpen, Plus } from 'lucide-react';

export function ActiveOrdersScreen() {
  const navigate = useNavigate();
  const { orders } = useAppData();
  const active = orders.filter((o) => o.status === 'WAITING');

  return (
    <AppShell>
      <PageHeader title="Active Orders" subtitle={`${active.length} ${active.length === 1 ? 'order' : 'orders'} waiting`} />

      <div className="page-pad pt-2 pb-6">
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
                action={
                  <PrimaryButton size="md" fullWidth onClick={() => navigate(`/orders/${o.id}/complete`)}>
                    Collect from customer
                  </PrimaryButton>
                }
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

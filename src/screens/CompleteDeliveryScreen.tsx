import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { formatRsPlain } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { AmountInput } from '@/components/ui/AmountInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Check } from 'lucide-react';

export function CompleteDeliveryScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, completeOrder } = useAppData();
  const order = orders.find((o) => o.id === id);

  const [collected, setCollected] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!order) {
    return (
      <AppShell showNav={false}>
        <PageHeader title="Complete Delivery" onBack={() => navigate(-1)} />
        <div className="page-pad pt-6 text-center text-sm text-ink-500">Order not found.</div>
      </AppShell>
    );
  }

  const collectedNum = Number(collected);
  const hasInput = collected.trim() !== '' && !isNaN(collectedNum);
  const margin = hasInput ? collectedNum - order.paidToRestaurant : 0;

  const handleComplete = () => {
    const amt = Number(collected);
    if (!collected.trim()) {
      setError('Enter the amount collected from the customer.');
      return;
    }
    if (isNaN(amt) || amt < 0) {
      setError('Enter a valid amount.');
      return;
    }
    setError('');
    setSaving(true);
    setTimeout(() => {
      completeOrder(order.id, amt);
      setSaving(false);
      setDone(true);
    }, 400);
  };

  if (done) {
    return (
      <AppShell showNav={false}>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
            <Check size={32} className="text-success-600" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-ink-900">Delivery Completed</h2>
          <p className="mt-1 text-sm text-ink-500">{order.orderNumber} · {order.restaurantName}</p>
          <div className="mt-4 rounded-2xl border border-ink-100 bg-white px-6 py-4 shadow-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Margin</p>
            <p className={`mt-1 text-2xl font-bold ${margin >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {margin >= 0 ? '+' : '-'}Rs. {Math.abs(margin).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="mt-6 w-full max-w-xs">
            <PrimaryButton variant="secondary" onClick={() => navigate('/active', { replace: true })}>
              Back to Active Orders
            </PrimaryButton>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell showNav={false}>
      <PageHeader title="Complete Delivery" onBack={() => navigate(-1)} />

      <div className="page-pad pt-2 pb-6 space-y-5">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-ink-900">{order.orderNumber}</span>
          </div>
          <p className="mt-0.5 text-sm font-semibold text-ink-700">{order.restaurantName}</p>
          {order.customerReference && <p className="mt-0.5 text-xs text-ink-400">Customer: {order.customerReference}</p>}
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-500">Paid to restaurant</span>
            <span className="text-base font-bold text-ink-900">{formatRsPlain(order.paidToRestaurant)}</span>
          </div>
        </div>

        <div>
          <AmountInput
            label="Amount Collected from Customer"
            value={collected}
            onChange={(e) => {
              setCollected(e.target.value);
              setError('');
            }}
            autoFocus
          />
          {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
        </div>

        {hasInput && (
          <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-700">Your margin</span>
              <span className={`text-2xl font-bold ${margin >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {margin >= 0 ? '+' : '-'}Rs. {Math.abs(margin).toLocaleString('en-IN')}
              </span>
            </div>
            {margin < 0 && (
              <p className="mt-1 text-xs text-danger-600">This is a loss on this order.</p>
            )}
          </div>
        )}

        <PrimaryButton onClick={handleComplete} loading={saving}>
          {saving ? 'Completing...' : 'Complete Delivery'}
        </PrimaryButton>
      </div>
    </AppShell>
  );
}

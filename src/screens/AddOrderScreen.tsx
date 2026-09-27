import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import type { Restaurant } from '@/types';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { RestaurantSelector } from '@/components/RestaurantSelector';
import { AmountInput } from '@/components/ui/AmountInput';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Check } from 'lucide-react';

export function AddOrderScreen() {
  const navigate = useNavigate();
  const { restaurants, orders, createOrder } = useAppData();

  const recentIds = useMemo(() => {
    const seen = new Set<string>();
    const ids: string[] = [];
    for (const o of orders) {
      if (!seen.has(o.restaurantId)) {
        seen.add(o.restaurantId);
        ids.push(o.restaurantId);
      }
    }
    return ids.slice(0, 5);
  }, [orders]);

  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; restaurant?: string }>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = () => {
    const errs: { amount?: string; restaurant?: string } = {};
    if (!selected) errs.restaurant = 'Please select a restaurant.';
    const amt = Number(amount);
    if (!amount.trim()) errs.amount = 'Enter the amount paid to the restaurant.';
    else if (isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setTimeout(() => {
      createOrder({
        restaurantId: selected!.id,
        restaurantName: selected!.name,
        paidToRestaurant: amt,
        customerReference: reference,
      });
      setSaving(false);
      setSuccess(true);
      setTimeout(() => navigate('/active', { replace: true }), 700);
    }, 400);
  };

  if (success) {
    return (
      <AppShell showNav={false}>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
            <Check size={32} className="text-success-600" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-ink-900">Order Saved</h2>
          <p className="mt-1 text-sm text-ink-500">Redirecting to active orders...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell showNav={false}>
      <PageHeader title="Pick Up Order" onBack={() => navigate(-1)} />

      <div className="page-pad pt-2 pb-6 space-y-6">
        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Select Restaurant</h2>
          <RestaurantSelector
            restaurants={restaurants}
            recentIds={recentIds}
            selectedId={selected?.id}
            onSelect={setSelected}
          />
          {errors.restaurant && <p className="mt-1.5 text-xs text-danger-600">{errors.restaurant}</p>}
        </section>

        <section>
          <AmountInput
            label="Amount Paid to Restaurant"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />
          {errors.amount && <p className="mt-1.5 text-xs text-danger-600">{errors.amount}</p>}
        </section>

        <section>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">
            Customer / Order Reference (optional)
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Customer name or order number"
            className="h-12 w-full rounded-2xl border border-ink-200 bg-white px-4 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </section>

        <PrimaryButton onClick={handleSave} loading={saving}>
          {saving ? 'Saving...' : 'Save Order'}
        </PrimaryButton>
      </div>
    </AppShell>
  );
}

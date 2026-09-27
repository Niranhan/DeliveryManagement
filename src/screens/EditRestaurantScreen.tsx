import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export function EditRestaurantScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { restaurants, updateRestaurant } = useAppData();
  const restaurant = restaurants.find((r) => r.id === id);

  const [name, setName] = useState(restaurant?.name ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!restaurant) {
    return (
      <AppShell showNav={false}>
        <PageHeader title="Edit Restaurant" onBack={() => navigate(-1)} />
        <div className="page-pad pt-6 text-center text-sm text-ink-500">Restaurant not found.</div>
      </AppShell>
    );
  }

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Restaurant name cannot be empty.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      updateRestaurant(restaurant.id, trimmed);
      setSaving(false);
      navigate('/restaurants', { replace: true });
    }, 300);
  };

  return (
    <AppShell showNav={false}>
      <PageHeader title="Edit Restaurant" onBack={() => navigate(-1)} />

      <div className="page-pad pt-2 pb-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Restaurant Name</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            autoFocus
            className="h-12 w-full rounded-2xl border border-ink-200 bg-white px-4 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          {error && <p className="mt-1.5 text-xs text-danger-600">{error}</p>}
        </div>

        <PrimaryButton onClick={handleSave} loading={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </PrimaryButton>
      </div>
    </AppShell>
  );
}

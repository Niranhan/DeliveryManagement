import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/context/AppDataContext';
import { orderCountByRestaurant } from '@/utils/stats';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { RestaurantCard } from '@/components/RestaurantCard';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { UtensilsCrossed, Plus } from 'lucide-react';

export function RestaurantsScreen() {
  const navigate = useNavigate();
  const { restaurants, currentDutyOrders } = useAppData();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) => r.name.toLowerCase().includes(q));
  }, [restaurants, query]);

  return (
    <AppShell>
      <PageHeader
        title="Restaurants"
        right={
          <button
            onClick={() => navigate('/restaurants/new')}
            aria-label="Add restaurant"
            className="no-tap flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white active:bg-brand-600"
          >
            <Plus size={20} />
          </button>
        }
      />

      <div className="page-pad pt-2">
        <SearchInput value={query} onChange={setQuery} placeholder="Search restaurants..." />
      </div>

      <div className="page-pad mt-4 pb-6">
        {restaurants.length === 0 ? (
          <EmptyState
            icon={<UtensilsCrossed size={28} />}
            title="No restaurants added"
            description="Add your first restaurant to get started."
            action={
              <PrimaryButton onClick={() => navigate('/restaurants/new')}>
                <Plus size={20} />
                Add Restaurant
              </PrimaryButton>
            }
          />
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-400">No restaurants found.</p>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                orderCount={orderCountByRestaurant(currentDutyOrders, r.id)}
                onClick={() => navigate(`/restaurants/${r.id}/edit`)}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

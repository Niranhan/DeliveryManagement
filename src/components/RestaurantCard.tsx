import type { Restaurant } from '@/types';
import { ChevronRight } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  orderCount?: number;
  onClick?: () => void;
}

export function RestaurantCard({ restaurant, orderCount, onClick }: RestaurantCardProps) {
  return (
    <button onClick={onClick} className="no-tap w-full text-left">
      <div className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card active:shadow-card-hover">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink-900">{restaurant.name}</p>
          {orderCount !== undefined && <p className="mt-0.5 text-xs text-ink-400">{orderCount} orders today</p>}
        </div>
        <ChevronRight size={18} className="shrink-0 text-ink-300" />
      </div>
    </button>
  );
}

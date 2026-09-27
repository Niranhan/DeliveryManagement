import { useMemo, useState } from 'react';
import type { Restaurant } from '@/types';
import { SearchInput } from './ui/SearchInput';
import { Check, Clock } from 'lucide-react';

interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  recentIds?: string[];
  selectedId?: string;
  onSelect: (r: Restaurant) => void;
}

export function RestaurantSelector({ restaurants, recentIds = [], selectedId, onSelect }: RestaurantSelectorProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter((r) => r.name.toLowerCase().includes(q));
  }, [restaurants, query]);

  const recent = useMemo(() => {
    if (query.trim()) return [];
    return recentIds
      .map((id) => restaurants.find((r) => r.id === id))
      .filter((r): r is Restaurant => Boolean(r));
  }, [restaurants, recentIds, query]);

  const allFiltered = useMemo(() => {
    if (query.trim()) return filtered;
    return filtered.filter((r) => !recentIds.includes(r.id));
  }, [filtered, recentIds, query]);

  return (
    <div>
      <SearchInput value={query} onChange={setQuery} placeholder="Search restaurants..." />

      {!query.trim() && recent.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Recent</p>
          <div className="space-y-2">
            {recent.map((r) => (
              <Row key={r.id} r={r} selected={r.id === selectedId} onSelect={onSelect} recent />
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        {!query.trim() && recent.length > 0 && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">All restaurants</p>
        )}
        {allFiltered.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-400">No restaurants found.</p>
        ) : (
          <div className="space-y-2">
            {allFiltered.map((r) => (
              <Row key={r.id} r={r} selected={r.id === selectedId} onSelect={onSelect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  r,
  selected,
  onSelect,
  recent,
}: {
  r: Restaurant;
  selected: boolean;
  onSelect: (r: Restaurant) => void;
  recent?: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(r)}
      className={`no-tap flex w-full items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
        selected ? 'border-brand-400 bg-brand-50' : 'border-ink-100 bg-white active:bg-ink-50'
      }`}
    >
      {recent && <Clock size={16} className="shrink-0 text-ink-400" />}
      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-ink-900">{r.name}</span>
      {selected && <Check size={20} className="shrink-0 text-brand-600" />}
    </button>
  );
}

import type { ReactNode } from 'react';
import type { Order } from '@/types';
import { formatRs, formatRsPlain, marginOf } from '@/types';
import { StatusBadge } from './ui/StatusBadge';
import { ChevronRight, Trash2 } from 'lucide-react';

// + AFTER
interface OrderCardProps {
  order: Order;
  variant?: 'active' | 'completed' | 'compact';
  onClick?: () => void;
  action?: ReactNode;
  /**
   * Only rendered on the 'active' variant. When provided, a small trash
   * button appears in the card header. The parent owns confirmation
   * and the actual delete call — this card only reports the tap.
   */
  onDelete?: () => void;
  deleting?: boolean;
}

export function OrderCard({
  order,
  variant = 'active',
  onClick,
  action,
  onDelete,
  deleting = false,
}: OrderCardProps) {
  const margin = marginOf(order);

  if (variant === 'completed') {
    return (
      <button onClick={onClick} className="no-tap w-full text-left">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card transition-shadow active:shadow-card-hover">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-ink-900">{order.orderNumber}</span>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-0.5 truncate text-sm font-medium text-ink-700">{order.restaurantName}</p>
              {order.customerReference && <p className="truncate text-xs text-ink-400">Customer: {order.customerReference}</p>}
            </div>
            <ChevronRight size={18} className="mt-1 shrink-0 text-ink-300" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-ink-100 pt-3">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-400">Paid</p>
              <p className="text-sm font-semibold text-ink-700">{formatRsPlain(order.paidToRestaurant)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-400">Collected</p>
              <p className="text-sm font-semibold text-ink-700">{formatRsPlain(order.collectedFromCustomer ?? 0)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-400">Margin</p>
              <p className={`text-sm font-bold ${margin >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                {margin >= 0 ? '+' : '-'}Rs. {Math.abs(margin).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button onClick={onClick} className="no-tap w-full text-left">
        <div className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-card active:shadow-card-hover">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-sm font-bold text-ink-900">{order.orderNumber}</span>
              <p className="truncate text-sm text-ink-500">{order.restaurantName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-ink-400">Paid</p>
              <p className="text-sm font-bold text-ink-900">{formatRsPlain(order.paidToRestaurant)}</p>
            </div>
          </div>
        </div>
      </button>
    );
  }

  // active
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-ink-900">{order.orderNumber}</span>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-0.5 truncate text-sm font-semibold text-ink-700">{order.restaurantName}</p>
          {order.customerReference && <p className="truncate text-xs text-ink-400">Customer: {order.customerReference}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] uppercase tracking-wide text-ink-400">Paid to restaurant</p>
          <p className="text-lg font-bold text-ink-900">{formatRs(order.paidToRestaurant)}</p>
        </div>
      </div>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}



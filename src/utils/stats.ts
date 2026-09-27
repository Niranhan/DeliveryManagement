import type { Order } from '@/types';
import { marginOf } from '@/types';

export interface DayStats {
  totalOrders: number;
  totalPaid: number;
  totalCollected: number;
  totalMargin: number;
  activeCount: number;
  completedCount: number;
}

export function computeStats(orders: Order[]): DayStats {
  let totalPaid = 0;
  let totalCollected = 0;
  let activeCount = 0;
  let completedCount = 0;

  for (const o of orders) {
    if (o.status === 'WAITING') {
      activeCount++;
      totalPaid += o.paidToRestaurant;
    } else if (o.status === 'COMPLETED') {
      completedCount++;
      totalPaid += o.paidToRestaurant;
      totalCollected += o.collectedFromCustomer ?? 0;
    }
  }

  return {
    totalOrders: activeCount + completedCount,
    totalPaid,
    totalCollected,
    totalMargin: totalCollected - totalPaid,
    activeCount,
    completedCount,
  };
}

export interface RestaurantBreakdownRow {
  restaurantId: string;
  restaurantName: string;
  orderCount: number;
  paid: number;
  collected: number;
  margin: number;
}

export function computeRestaurantBreakdown(orders: Order[]): RestaurantBreakdownRow[] {
  const map = new Map<string, RestaurantBreakdownRow>();
  for (const o of orders) {
    if (o.status !== 'COMPLETED') continue;
    let row = map.get(o.restaurantId);
    if (!row) {
      row = {
        restaurantId: o.restaurantId,
        restaurantName: o.restaurantName,
        orderCount: 0,
        paid: 0,
        collected: 0,
        margin: 0,
      };
      map.set(o.restaurantId, row);
    }
    row.orderCount++;
    row.paid += o.paidToRestaurant;
    row.collected += o.collectedFromCustomer ?? 0;
    row.margin += marginOf(o);
  }
  return Array.from(map.values()).sort((a, b) => b.margin - a.margin);
}

export function orderCountByRestaurant(orders: Order[], restaurantId: string): number {
  return orders.filter((o) => o.restaurantId === restaurantId && o.status === 'COMPLETED').length;
}

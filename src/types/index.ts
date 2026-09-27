export type OrderStatus = 'WAITING' | 'COMPLETED' | 'CANCELLED';

export interface Restaurant {
  id: string;
  name: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  customerReference: string;
  paidToRestaurant: number;
  collectedFromCustomer: number | null;
  status: OrderStatus;
  createdAt: string;
  completedAt: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

export const marginOf = (order: Pick<Order, 'collectedFromCustomer' | 'paidToRestaurant'>): number => {
  if (order.collectedFromCustomer == null) return 0;
  return order.collectedFromCustomer - order.paidToRestaurant;
};

export const formatRs = (amount: number): string => {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${sign}Rs. ${abs.toLocaleString('en-IN')}`;
};

export const formatRsPlain = (amount: number): string => `Rs. ${amount.toLocaleString('en-IN')}`;

export const formatMargin = (amount: number): string => {
  const sign = amount < 0 ? '-' : '+';
  const abs = Math.abs(amount);
  return `${sign}Rs. ${abs.toLocaleString('en-IN')}`;
};

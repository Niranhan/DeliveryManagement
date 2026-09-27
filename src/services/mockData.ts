import type { Order, Restaurant } from '@/types';

const DEFAULT_DUTY_ID = 'duty-init';

const now = () => new Date();
const iso = (d: Date) => d.toISOString();
const hoursAgo = (h: number) => {
  const d = now();
  d.setHours(d.getHours() - h);
  return iso(d);
};
const minutesAgo = (m: number) => {
  const d = now();
  d.setMinutes(d.getMinutes() - m);
  return iso(d);
};

export const mockRestaurants: Restaurant[] = [
  { id: 'r1', name: 'ABC Restaurant', createdAt: hoursAgo(8) },
  { id: 'r2', name: 'Newari Kitchen', createdAt: hoursAgo(8) },
  { id: 'r3', name: 'Pizza House', createdAt: hoursAgo(8) },
  { id: 'r4', name: 'Momo Station', createdAt: hoursAgo(8) },
  { id: 'r5', name: 'Biryani Corner', createdAt: hoursAgo(8) },
  { id: 'r6', name: 'Burger House', createdAt: hoursAgo(8) },
  { id: 'r7', name: 'Thakali Kitchen', createdAt: hoursAgo(8) },
  { id: 'r8', name: 'Cafe Central', createdAt: hoursAgo(8) },
];

export const mockOrders: Order[] = ([
  // Active orders
  {
    id: 'o31',
    orderNumber: '#031',
    restaurantId: 'r1',
    restaurantName: 'ABC Restaurant',
    customerReference: 'Order 5482',
    paidToRestaurant: 450,
    collectedFromCustomer: null,
    status: 'WAITING',
    createdAt: minutesAgo(25),
    completedAt: null,
  },
  {
    id: 'o32',
    orderNumber: '#032',
    restaurantId: 'r1',
    restaurantName: 'ABC Restaurant',
    customerReference: '',
    paidToRestaurant: 300,
    collectedFromCustomer: null,
    status: 'WAITING',
    createdAt: minutesAgo(20),
    completedAt: null,
  },
  {
    id: 'o33',
    orderNumber: '#033',
    restaurantId: 'r3',
    restaurantName: 'Pizza House',
    customerReference: 'Rahul',
    paidToRestaurant: 520,
    collectedFromCustomer: null,
    status: 'WAITING',
    createdAt: minutesAgo(15),
    completedAt: null,
  },
  {
    id: 'o34',
    orderNumber: '#034',
    restaurantId: 'r4',
    restaurantName: 'Momo Station',
    customerReference: '',
    paidToRestaurant: 280,
    collectedFromCustomer: null,
    status: 'WAITING',
    createdAt: minutesAgo(10),
    completedAt: null,
  },
  {
    id: 'o35',
    orderNumber: '#035',
    restaurantId: 'r2',
    restaurantName: 'Newari Kitchen',
    customerReference: 'Order 9912',
    paidToRestaurant: 650,
    collectedFromCustomer: null,
    status: 'WAITING',
    createdAt: minutesAgo(5),
    completedAt: null,
  },

  // Completed orders
  {
    id: 'o30',
    orderNumber: '#030',
    restaurantId: 'r4',
    restaurantName: 'Momo Station',
    customerReference: '',
    paidToRestaurant: 250,
    collectedFromCustomer: 300,
    status: 'COMPLETED',
    createdAt: hoursAgo(2),
    completedAt: hoursAgo(1),
  },
  {
    id: 'o29',
    orderNumber: '#029',
    restaurantId: 'r5',
    restaurantName: 'Biryani Corner',
    customerReference: 'Order 3321',
    paidToRestaurant: 600,
    collectedFromCustomer: 700,
    status: 'COMPLETED',
    createdAt: hoursAgo(3),
    completedAt: hoursAgo(2),
  },
  {
    id: 'o28',
    orderNumber: '#028',
    restaurantId: 'r3',
    restaurantName: 'Pizza House',
    customerReference: 'Sita',
    paidToRestaurant: 400,
    collectedFromCustomer: 380,
    status: 'COMPLETED',
    createdAt: hoursAgo(4),
    completedAt: hoursAgo(3),
  },
  {
    id: 'o27',
    orderNumber: '#027',
    restaurantId: 'r1',
    restaurantName: 'ABC Restaurant',
    customerReference: '',
    paidToRestaurant: 550,
    collectedFromCustomer: 620,
    status: 'COMPLETED',
    createdAt: hoursAgo(5),
    completedAt: hoursAgo(4),
  },
  {
    id: 'o26',
    orderNumber: '#026',
    restaurantId: 'r7',
    restaurantName: 'Thakali Kitchen',
    customerReference: 'Order 7741',
    paidToRestaurant: 700,
    collectedFromCustomer: 780,
    status: 'COMPLETED',
    createdAt: hoursAgo(6),
    completedAt: hoursAgo(5),
  },
  {
    id: 'o25',
    orderNumber: '#025',
    restaurantId: 'r6',
    restaurantName: 'Burger House',
    customerReference: '',
    paidToRestaurant: 320,
    collectedFromCustomer: 350,
    status: 'COMPLETED',
    createdAt: hoursAgo(7),
    completedAt: hoursAgo(6),
  },
  {
    id: 'o24',
    orderNumber: '#024',
    restaurantId: 'r2',
    restaurantName: 'Newari Kitchen',
    customerReference: 'Hari',
    paidToRestaurant: 480,
    collectedFromCustomer: 520,
    status: 'COMPLETED',
    createdAt: hoursAgo(8),
    completedAt: hoursAgo(7),
  },
] as Order[]).map((o) => ({ ...o, dutyId: DEFAULT_DUTY_ID }));

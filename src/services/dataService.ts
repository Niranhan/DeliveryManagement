import type { Order, Restaurant } from '@/types';
import { mockOrders, mockRestaurants } from './mockData';
import { dutyService } from './dutyService';

const STORAGE_KEY = 'delivery-manager-orders-v1';
const RESTAURANT_KEY = 'delivery-manager-restaurants-v1';
const ORDER_SEQ_KEY = 'delivery-manager-order-seq-v1';

function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Order[];
  } catch {
    // ignore
  }
  return [...mockOrders];
}

function loadRestaurants(): Restaurant[] {
  try {
    const raw = localStorage.getItem(RESTAURANT_KEY);
    if (raw) return JSON.parse(raw) as Restaurant[];
  } catch {
    // ignore
  }
  return [...mockRestaurants];
}

function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function saveRestaurants(restaurants: Restaurant[]): void {
  localStorage.setItem(RESTAURANT_KEY, JSON.stringify(restaurants));
}

function nextOrderNumber(): string {
  const current = Number(localStorage.getItem(ORDER_SEQ_KEY) || '35');
  const next = current + 1;
  localStorage.setItem(ORDER_SEQ_KEY, String(next));
  return `#${String(next).padStart(3, '0')}`;
}

export const orderService = {
  getAll(): Order[] {
    return loadOrders();
  },

  getActive(): Order[] {
    return loadOrders().filter((o) => o.status === 'WAITING');
  },

  getCompleted(): Order[] {
    return loadOrders().filter((o) => o.status === 'COMPLETED');
  },

  getById(id: string): Order | undefined {
    return loadOrders().find((o) => o.id === id);
  },

  createOrder(input: {
    restaurantId: string;
    restaurantName: string;
    paidToRestaurant: number;
    customerReference: string;
  }): Order {
    const orders = loadOrders();
    const order: Order = {
      id: `o${Date.now()}`,
      orderNumber: nextOrderNumber(),
      restaurantId: input.restaurantId,
      restaurantName: input.restaurantName,
      customerReference: input.customerReference.trim(),
      paidToRestaurant: input.paidToRestaurant,
      collectedFromCustomer: null,
      status: 'WAITING',
      createdAt: new Date().toISOString(),
      completedAt: null,
      dutyId: dutyService.getCurrentDutyId(),
    };
    orders.unshift(order);
    saveOrders(orders);
    return order;
  },

  completeOrder(id: string, collectedFromCustomer: number): Order | undefined {
    const orders = loadOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    orders[idx] = {
      ...orders[idx],
      collectedFromCustomer,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    };
    saveOrders(orders);
    return orders[idx];
  },

  resetToMock(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ORDER_SEQ_KEY);
  },
};

export const restaurantService = {
  getAll(): Restaurant[] {
    return loadRestaurants();
  },

  getById(id: string): Restaurant | undefined {
    return loadRestaurants().find((r) => r.id === id);
  },

  createRestaurant(name: string): Restaurant {
    const restaurants = loadRestaurants();
    const restaurant: Restaurant = {
      id: `r${Date.now()}`,
      name: name.trim(),
      createdAt: new Date().toISOString(),
    };
    restaurants.push(restaurant);
    saveRestaurants(restaurants);
    return restaurant;
  },

  updateRestaurant(id: string, name: string): Restaurant | undefined {
    const restaurants = loadRestaurants();
    const idx = restaurants.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    restaurants[idx] = { ...restaurants[idx], name: name.trim() };
    saveRestaurants(restaurants);
    return restaurants[idx];
  },

  nameExists(name: string): boolean {
    const target = name.trim().toLowerCase();
    return loadRestaurants().some((r) => r.name.toLowerCase() === target);
  },
};

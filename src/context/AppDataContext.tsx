import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Order, Restaurant } from '@/types';
import { orderService, restaurantService } from '@/services/dataService';

interface AppDataContextValue {
  orders: Order[];
  restaurants: Restaurant[];
  createOrder: (input: {
    restaurantId: string;
    restaurantName: string;
    paidToRestaurant: number;
    customerReference: string;
  }) => Order;
  completeOrder: (id: string, collected: number) => void;
  addRestaurant: (name: string) => Restaurant | null;
  updateRestaurant: (id: string, name: string) => void;
  refresh: () => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => orderService.getAll());
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => restaurantService.getAll());

  const refresh = useCallback(() => {
    setOrders(orderService.getAll());
    setRestaurants(restaurantService.getAll());
  }, []);

  const createOrder = useCallback<AppDataContextValue['createOrder']>((input) => {
    const order = orderService.createOrder(input);
    setOrders(orderService.getAll());
    return order;
  }, []);

  const completeOrder = useCallback((id: string, collected: number) => {
    orderService.completeOrder(id, collected);
    setOrders(orderService.getAll());
  }, []);

  const addRestaurant = useCallback((name: string): Restaurant | null => {
    if (restaurantService.nameExists(name)) return null;
    const r = restaurantService.createRestaurant(name);
    setRestaurants(restaurantService.getAll());
    return r;
  }, []);

  const updateRestaurant = useCallback((id: string, name: string) => {
    restaurantService.updateRestaurant(id, name);
    setRestaurants(restaurantService.getAll());
    setOrders(orderService.getAll());
  }, []);

  const value = useMemo(
    () => ({
      orders,
      restaurants,
      createOrder,
      completeOrder,
      addRestaurant,
      updateRestaurant,
      refresh,
    }),
    [orders, restaurants, createOrder, completeOrder, addRestaurant, updateRestaurant, refresh],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

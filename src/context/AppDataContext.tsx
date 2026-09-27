import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Duty, Order, Restaurant } from '@/types';
import { orderService, restaurantService } from '@/services/dataService';
import { dutyService } from '@/services/dutyService';

interface AppDataContextValue {
  orders: Order[];
  restaurants: Restaurant[];
  currentDuty: Duty;
  currentDutyOrders: Order[];
  createOrder: (input: {
    restaurantId: string;
    restaurantName: string;
    paidToRestaurant: number;
    customerReference: string;
  }) => Order;
  completeOrder: (id: string, collected: number) => void;
  addRestaurant: (name: string) => Restaurant | null;
  updateRestaurant: (id: string, name: string) => void;
  closeDuty: () => Duty;
  refresh: () => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => orderService.getAll());
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => restaurantService.getAll());
  const [currentDuty, setCurrentDuty] = useState<Duty>(() => dutyService.getCurrentDuty());

  const refresh = useCallback(() => {
    setOrders(orderService.getAll());
    setRestaurants(restaurantService.getAll());
    setCurrentDuty(dutyService.getCurrentDuty());
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

  const closeDuty = useCallback((): Duty => {
    const newDuty = dutyService.closeCurrentDuty();
    setCurrentDuty(newDuty);
    return newDuty;
  }, []);

  const currentDutyOrders = useMemo(
    () => orders.filter((o) => o.dutyId === currentDuty.id),
    [orders, currentDuty.id],
  );

  const value = useMemo(
    () => ({
      orders,
      restaurants,
      currentDuty,
      currentDutyOrders,
      createOrder,
      completeOrder,
      addRestaurant,
      updateRestaurant,
      closeDuty,
      refresh,
    }),
    [orders, restaurants, currentDuty, currentDutyOrders, createOrder, completeOrder, addRestaurant, updateRestaurant, closeDuty, refresh],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}

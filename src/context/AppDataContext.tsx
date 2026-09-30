import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Duty, Order, Restaurant } from '@/types';
import { orderService, restaurantService } from '@/services/dataService';
import { dutyService } from '@/services/dutyService';

interface AppDataContextValue {
  orders: Order[];
  restaurants: Restaurant[];
  currentDuty: Duty | null;
  currentDutyOrders: Order[];
  loading: boolean;
  createOrder: (input: {
    restaurantId: string;
    restaurantName: string;
    paidToRestaurant: number;
    customerReference: string;
  }) => Promise<Order>;
  completeOrder: (id: string, collected: number) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  addRestaurant: (name: string) => Promise<Restaurant | null>;
  updateRestaurant: (id: string, name: string) => Promise<void>;
  closeDuty: () => Promise<Duty>;
  refresh: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(
  undefined,
);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getAll(),
  });

  const restaurantsQuery = useQuery({
    queryKey: ['restaurants'],
    queryFn: () => restaurantService.getAll(),
  });

  const currentDutyQuery = useQuery({
    queryKey: ['currentDuty'],
    queryFn: () => dutyService.getCurrentDuty(),
  });

  const loading =
    ordersQuery.isLoading ||
    restaurantsQuery.isLoading ||
    currentDutyQuery.isLoading;

  const loadError =
    ordersQuery.isError || restaurantsQuery.isError || currentDutyQuery.isError
      ? 'Could not load your data. Please try again.'
      : '';

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['orders'] }),
      queryClient.invalidateQueries({ queryKey: ['restaurants'] }),
      queryClient.invalidateQueries({ queryKey: ['currentDuty'] }),
    ]);
  };

  const createOrder: AppDataContextValue['createOrder'] = async (input) => {
    const duty = await dutyService.ensureOpenDuty();

    const order = await orderService.createOrder({
      ...input,
      dutyId: duty.id,
    });

    queryClient.setQueryData<Order[]>(['orders'], (prev) =>
      prev ? [order, ...prev] : [order],
    );

    if (currentDutyQuery.data?.id !== duty.id) {
      queryClient.setQueryData<Duty>(['currentDuty'], duty);
    }

    return order;
  };

  const completeOrder: AppDataContextValue['completeOrder'] = async (
    id,
    collected,
  ) => {
    const cachedOrders = queryClient.getQueryData<Order[]>(['orders']) ?? [];
    const existing = cachedOrders.find((o) => o.id === id);
    const restaurantName = existing?.restaurantName ?? 'Unknown Restaurant';

    const updated = await orderService.completeOrder(id, collected, restaurantName);
    if (updated) {
      queryClient.setQueryData<Order[]>(['orders'], (prev) =>
        prev ? prev.map((o) => (o.id === id ? updated : o)) : prev,
      );
    }
  };

  /**
   * Optimistically removes the order from the cache, then commits to DB.
   * On failure (guard rejection or network error), rolls the cache back
   * to its previous state and re-throws so the caller can surface an
   * error. On guard rejection (row was completed in another tab), also
   * invalidates so the true server state is refetched.
   */
  const deleteOrder: AppDataContextValue['deleteOrder'] = async (id) => {
    const previous = queryClient.getQueryData<Order[]>(['orders']);

    queryClient.setQueryData<Order[]>(['orders'], (prev) =>
      prev ? prev.filter((o) => o.id !== id) : prev,
    );

    try {
      const deleted = await orderService.deleteOrder(id);
      if (!deleted) {
        // Guard rejected — the order was completed or removed elsewhere
        // between UI display and this call. Roll back the optimistic
        // removal and refresh from the server so the user sees truth.
        if (previous) queryClient.setQueryData<Order[]>(['orders'], previous);
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
        throw new Error(
          'This order was completed just now and can no longer be deleted.',
        );
      }
    } catch (e) {
      if (previous) queryClient.setQueryData<Order[]>(['orders'], previous);
      throw e;
    }
  };

  const addRestaurant: AppDataContextValue['addRestaurant'] = async (name) => {
    const restaurant = await restaurantService.createRestaurant(name);
    if (!restaurant) return null;

    queryClient.setQueryData<Restaurant[]>(['restaurants'], (prev) => {
      const next = prev ? [...prev, restaurant] : [restaurant];
      return next.sort((a, b) => a.name.localeCompare(b.name));
    });

    return restaurant;
  };

  const updateRestaurant: AppDataContextValue['updateRestaurant'] = async (
    id,
    name,
  ) => {
    const updated = await restaurantService.updateRestaurant(id, name);
    if (!updated) return;

    queryClient.setQueryData<Restaurant[]>(['restaurants'], (prev) => {
      const next = prev ? prev.map((r) => (r.id === id ? updated : r)) : prev;
      return next ? [...next].sort((a, b) => a.name.localeCompare(b.name)) : next;
    });

    queryClient.setQueryData<Order[]>(['orders'], (prev) =>
      prev
        ? prev.map((o) =>
            o.restaurantId === id ? { ...o, restaurantName: updated.name } : o,
          )
        : prev,
    );
  };

  const closeDuty: AppDataContextValue['closeDuty'] = async () => {
    const closed = await dutyService.closeCurrentDuty();
    queryClient.setQueryData<Duty | null>(['currentDuty'], null);
    return closed;
  };

  const currentDuty = currentDutyQuery.data ?? null;
  const orders = ordersQuery.data ?? [];
  const restaurants = restaurantsQuery.data ?? [];

  const currentDutyOrders = useMemo(() => {
    if (!currentDuty) return [];
    return orders.filter((order) => order.dutyId === currentDuty.id);
  }, [orders, currentDuty]);

  const value: AppDataContextValue = {
    orders,
    restaurants,
    currentDuty,
    currentDutyOrders,
    loading,
    createOrder,
    completeOrder,
    deleteOrder,
    addRestaurant,
    updateRestaurant,
    closeDuty,
    refresh,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        {loadError ? (
          <div className="px-6 text-center">
            <p className="text-sm text-danger-600">{loadError}</p>
            <button
              type="button"
              onClick={refresh}
              className="mt-4 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        )}
      </div>
    );
  }

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);

  if (!ctx) {
    throw new Error('useAppData must be used within AppDataProvider');
  }

  return ctx;
}
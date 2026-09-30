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
    queryFn: () => dutyService.getCurrentDuty(), // may resolve to null
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

  /**
   * Resolves the target duty lazily via `ensureOpenDuty` instead of
   * trusting the cached `currentDutyQuery.data` (which may be null
   * after a close, or stale if another tab created a duty first).
   * This is the only path in the app that implicitly opens a new duty.
   */
  const createOrder: AppDataContextValue['createOrder'] = async (input) => {
    const duty = await dutyService.ensureOpenDuty();

    const order = await orderService.createOrder({
      ...input,
      dutyId: duty.id,
    });

    queryClient.setQueryData<Order[]>(['orders'], (prev) =>
      prev ? [order, ...prev] : [order],
    );

    // If ensureOpenDuty just created a duty, the cache is stale.
    // Cheap invalidation is safer than a conditional setQueryData here.
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

  /**
   * Closes the current duty. Does NOT eagerly create the next one —
   * that happens lazily inside `createOrder` when work actually resumes.
   * The cache is set to null so screens can render the "no active duty"
   * state immediately.
   */
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
    addRestaurant,
    updateRestaurant,
    closeDuty,
    refresh,
  };

  // Gate on data readiness only — a NULL currentDuty is a valid
  // steady state now (user has closed and not yet added new work),
  // not a loading condition.
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
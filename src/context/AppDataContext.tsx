import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { Duty, Order, Restaurant } from '@/types';
import { orderService, restaurantService } from '@/services/dataService';
import { dutyService } from '@/services/dutyService';

interface AppDataContextValue {
  orders: Order[];
  restaurants: Restaurant[];
  currentDuty: Duty;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentDuty, setCurrentDuty] = useState<Duty | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setLoadError('');

      const [loadedOrders, loadedRestaurants, loadedDuty] =
        await Promise.all([
          orderService.getAll(),
          restaurantService.getAll(),
          dutyService.getCurrentDuty(),
        ]);

      setOrders(loadedOrders);
      setRestaurants(loadedRestaurants);
      setCurrentDuty(loadedDuty);
    } catch (error) {
      console.error('Failed to refresh app data:', error);
      setLoadError('Could not load your data. Please try again.');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoadError('');

        const [loadedOrders, loadedRestaurants, loadedDuty] =
          await Promise.all([
            orderService.getAll(),
            restaurantService.getAll(),
            dutyService.getCurrentDuty(),
          ]);

        if (!mounted) return;

        setOrders(loadedOrders);
        setRestaurants(loadedRestaurants);
        setCurrentDuty(loadedDuty);
      } catch (error) {
        console.error('Failed to load app data:', error);

        if (mounted) {
          setLoadError(
            'Could not load your data. Please try again.',
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const createOrder = useCallback<
    AppDataContextValue['createOrder']
  >(async (input) => {
    const order = await orderService.createOrder(input);
    setOrders(await orderService.getAll());
    return order;
  }, []);

  const completeOrder = useCallback(
    async (id: string, collected: number) => {
      await orderService.completeOrder(id, collected);
      setOrders(await orderService.getAll());
    },
    [],
  );

  const addRestaurant = useCallback(
    async (name: string): Promise<Restaurant | null> => {
      if (await restaurantService.nameExists(name)) {
        return null;
      }

      const restaurant =
        await restaurantService.createRestaurant(name);

      setRestaurants(await restaurantService.getAll());

      return restaurant;
    },
    [],
  );

  const updateRestaurant = useCallback(
    async (id: string, name: string) => {
      await restaurantService.updateRestaurant(id, name);
      setRestaurants(await restaurantService.getAll());
      setOrders(await orderService.getAll());
    },
    [],
  );

  const closeDuty = useCallback(async (): Promise<Duty> => {
    const newDuty = await dutyService.closeCurrentDuty();

    setCurrentDuty(newDuty);

    // Orders are preserved in Supabase.
    // Loading them again keeps historical orders available.
    setOrders(await orderService.getAll());

    return newDuty;
  }, []);

  const currentDutyOrders = useMemo(() => {
    if (!currentDuty) {
      return [];
    }

    return orders.filter(
      (order) => order.dutyId === currentDuty.id,
    );
  }, [orders, currentDuty]);

  const value = useMemo(
    () => ({
      orders,
      restaurants,
      currentDuty: currentDuty as Duty,
      currentDutyOrders,
      loading,
      createOrder,
      completeOrder,
      addRestaurant,
      updateRestaurant,
      closeDuty,
      refresh,
    }),
    [
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
    ],
  );

  // Do not render the application screens until the initial
  // Supabase data and current Duty have both loaded.
  if (loading || !currentDuty) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        {loadError ? (
          <div className="px-6 text-center">
            <p className="text-sm text-danger-600">
              {loadError}
            </p>

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
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
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
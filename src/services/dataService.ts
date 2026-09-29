import type { Order, Restaurant } from '@/types';
import { supabase } from '@/lib/supabase';
import { requireUserId } from '@/lib/auth';

interface DbRestaurant {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface DbOrder {
  id: string;
  user_id: string;
  order_number: string;
  restaurant_id: string;
  customer_reference: string;
  paid_to_restaurant: number;
  collected_from_customer: number | null;
  status: 'WAITING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  completed_at: string | null;
  duty_id: string;
}

function mapRestaurant(row: DbRestaurant): Restaurant {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
  };
}

function mapOrder(row: DbOrder, restaurantName: string): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    restaurantId: row.restaurant_id,
    restaurantName,
    customerReference: row.customer_reference,
    paidToRestaurant: Number(row.paid_to_restaurant),
    collectedFromCustomer:
      row.collected_from_customer == null
        ? null
        : Number(row.collected_from_customer),
    status: row.status,
    createdAt: row.created_at,
    completedAt: row.completed_at,
    dutyId: row.duty_id,
  };
}

async function fetchRestaurants(): Promise<Restaurant[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;

  return (data as DbRestaurant[]).map(mapRestaurant);
}

async function fetchOrders(): Promise<Order[]> {
  const userId = await requireUserId();
  const [restaurantResult, orderResult] = await Promise.all([
    supabase
      .from('restaurants')
      .select('id, name')
      .eq('user_id', userId),

    supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  if (restaurantResult.error) throw restaurantResult.error;
  if (orderResult.error) throw orderResult.error;

  const restaurantNames = new Map(
    (restaurantResult.data as { id: string; name: string }[]).map((r) => [
      r.id,
      r.name,
    ]),
  );

  return (orderResult.data as DbOrder[]).map((row) =>
    mapOrder(row, restaurantNames.get(row.restaurant_id) ?? 'Unknown Restaurant'),
  );
}

// Fetches only the single most recent order — stays fast permanently,
// unlike scanning the full order history.
async function nextOrderNumber(): Promise<string> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('orders')
    .select('order_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;

  const highest =
    data && data.length > 0
      ? Number.parseInt(String(data[0].order_number).replace('#', ''), 10)
      : 0;

  return `#${String((Number.isFinite(highest) ? highest : 0) + 1).padStart(3, '0')}`;
}

export const orderService = {
  async getAll(): Promise<Order[]> {
    return fetchOrders();
  },

  async getActive(): Promise<Order[]> {
    const orders = await fetchOrders();
    return orders.filter((order) => order.status === 'WAITING');
  },

  async getCompleted(): Promise<Order[]> {
    const orders = await fetchOrders();
    return orders.filter((order) => order.status === 'COMPLETED');
  },

  async getById(id: string): Promise<Order | undefined> {
    const orders = await fetchOrders();
    return orders.find((order) => order.id === id);
  },

  // dutyId is now passed in by the caller (already known from cached
  // currentDuty) instead of being fetched again here.
  async createOrder(input: {
    restaurantId: string;
    restaurantName: string;
    paidToRestaurant: number;
    customerReference: string;
    dutyId: string;
  }): Promise<Order> {
    const userId = await requireUserId();
    const orderNumber = await nextOrderNumber();

    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        restaurant_id: input.restaurantId,
        customer_reference: input.customerReference.trim(),
        paid_to_restaurant: input.paidToRestaurant,
        collected_from_customer: null,
        status: 'WAITING',
        duty_id: input.dutyId,
      })
      .select()
      .single();

    if (error && error.code === '23505') {
      const retryNumber = await nextOrderNumber();
      const { data: retryData, error: retryError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          order_number: retryNumber,
          restaurant_id: input.restaurantId,
          customer_reference: input.customerReference.trim(),
          paid_to_restaurant: input.paidToRestaurant,
          collected_from_customer: null,
          status: 'WAITING',
          duty_id: input.dutyId,
        })
        .select()
        .single();

      if (retryError) throw retryError;

      return mapOrder(retryData as DbOrder, input.restaurantName);
    }

    if (error) throw error;

    return mapOrder(data as DbOrder, input.restaurantName);
  },

  // restaurantName is now passed in by the caller (already known from the
  // cached orders list) instead of re-fetching all restaurants here.
  async completeOrder(
    id: string,
    collectedFromCustomer: number,
    restaurantName: string,
  ): Promise<Order | undefined> {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString(),
        collected_from_customer: collectedFromCustomer,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'WAITING')
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('Order not found, not yours, or already completed.');

    return mapOrder(data as DbOrder, restaurantName);
  },
};

export const restaurantService = {
  async getAll(): Promise<Restaurant[]> {
    return fetchRestaurants();
  },

  async getById(id: string): Promise<Restaurant | undefined> {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return undefined;

    return mapRestaurant(data as DbRestaurant);
  },

  // Relies on the restaurants_user_name_uk unique index instead of a
  // separate nameExists() pre-check — one round trip instead of two.
  // Returns null on a duplicate name, same contract callers already expect.
  async createRestaurant(name: string): Promise<Restaurant | null> {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        user_id: userId,
        name: name.trim(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return null;
      }
      throw error;
    }

    return mapRestaurant(data as DbRestaurant);
  },

  async updateRestaurant(
    id: string,
    name: string,
  ): Promise<Restaurant | undefined> {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('restaurants')
      .update({
        name: name.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!data) return undefined;

    return mapRestaurant(data as DbRestaurant);
  },

  // Kept for any live "this name is taken" typing feedback elsewhere in
  // the UI — no longer used by the create/write path above.
  async nameExists(name: string): Promise<boolean> {
    const target = name.trim();
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('restaurants')
      .select('id')
      .eq('user_id', userId)
      .ilike('name', target)
      .limit(1);

    if (error) throw error;

    return (data?.length ?? 0) > 0;
  },
};
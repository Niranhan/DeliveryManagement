import type { Order, Restaurant } from '@/types';
import { supabase } from '@/lib/supabase';
import { requireUserId } from '@/lib/auth';
import { dutyService } from './dutyService';

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

async function nextOrderNumber(): Promise<string> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('orders')
    .select('order_number')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  let highest = 0;

  for (const row of data ?? []) {
    const number = Number.parseInt(
      String(row.order_number).replace('#', ''),
      10,
    );

    if (Number.isFinite(number) && number > highest) {
      highest = number;
    }
  }

  return `#${String(highest + 1).padStart(3, '0')}`;
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

  async createOrder(input: {
    restaurantId: string;
    restaurantName: string;
    paidToRestaurant: number;
    customerReference: string;
  }): Promise<Order> {
    const userId = await requireUserId();
    const dutyId = await dutyService.getCurrentDutyId();
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
        duty_id: dutyId,
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
          duty_id: dutyId,
        })
        .select()
        .single();

      if (retryError) throw retryError;

      return mapOrder(retryData as DbOrder, input.restaurantName);
    }

    if (error) throw error;

    return mapOrder(data as DbOrder, input.restaurantName);
  },

  async completeOrder(
    id: string,
    collectedFromCustomer: number,
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

    const restaurants = await fetchRestaurants();
    const restaurant = restaurants.find(
      (item) => item.id === data.restaurant_id,
    );

    return mapOrder(
      data as DbOrder,
      restaurant?.name ?? 'Unknown Restaurant',
    );
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

  async createRestaurant(name: string): Promise<Restaurant> {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('restaurants')
      .insert({
        user_id: userId,
        name: name.trim(),
      })
      .select()
      .single();

    if (error) throw error;

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

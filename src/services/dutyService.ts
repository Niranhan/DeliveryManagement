import type { Duty, Order } from '@/types';
import { supabase } from '@/lib/supabase';
import { requireUserId } from '@/lib/auth';

interface DbDuty {
  id: string;
  user_id: string;
  date: string;
  status: 'OPEN' | 'CLOSED';
  opened_at: string;
  closed_at: string | null;
  closing_report_generated: boolean;
}

function mapDuty(row: DbDuty): Duty {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    status: row.status,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    closingReportGenerated: row.closing_report_generated,
  };
}

async function getUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('You must be signed in.');

  return user.id;
}

async function findOpenDuty(): Promise<Duty | null> {
  const { data, error } = await supabase
    .from('duties')
    .select('*')
    .eq('user_id', await requireUserId())
    .eq('status', 'OPEN')
    .order('opened_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  return data ? mapDuty(data as DbDuty) : null;
}

async function createOpenDuty(userId: string): Promise<Duty> {
  const { data, error } = await supabase
    .from('duties')
    .insert({
      user_id: userId,
      date: new Date().toISOString().slice(0, 10),
      status: 'OPEN',
      opened_at: new Date().toISOString(),
      closed_at: null,
      closing_report_generated: false,
    })
    .select()
    .single();

  if (error) throw error;

  return mapDuty(data as DbDuty);
}

export const dutyService = {
  findOpenDuty,

  async getCurrentDuty(): Promise<Duty> {
    const userId = await getUserId();

    const existing = await findOpenDuty();

    if (existing) return existing;

    return createOpenDuty(userId);
  },

  async getCurrentDutyId(): Promise<string> {
    const duty = await this.getCurrentDuty();
    return duty.id;
  },

  async isCurrentDutyClosed(): Promise<boolean> {
    const duty = await this.getCurrentDuty();
    return duty.status === 'CLOSED';
  },

  async closeCurrentDuty(): Promise<Duty> {
    const current = await this.getCurrentDuty();

    const closedAt = new Date().toISOString();

    const { count, error: waitingCheckError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('duty_id', current.id)
      .eq('status', 'WAITING');
    if (waitingCheckError) throw waitingCheckError;
    if (count && count > 0) {
      throw new Error('Complete all waiting orders before closing the duty.');
    }

    // closing_report_generated currently has no accounting meaning
    const { error: closeError } = await supabase
      .from('duties')
      .update({
        status: 'CLOSED',
        closed_at: closedAt,
        closing_report_generated: true,
      })
      .eq('id', current.id);

    if (closeError) throw closeError;

    return createOpenDuty(current.userId);
  },

  getOrdersForCurrentDuty(
    orders: Order[],
    currentDutyId: string,
  ): Order[] {
    return orders.filter((order) => order.dutyId === currentDutyId);
  },

  getOrdersForDuty(
    orders: Order[],
    dutyId: string,
  ): Order[] {
    return orders.filter((order) => order.dutyId === dutyId);
  },

  async getClosedDuties(): Promise<Duty[]> {
    const { data, error } = await supabase
      .from('duties')
      .select('*')
      .eq('user_id', await requireUserId())
      .eq('status', 'CLOSED')
      .order('closed_at', { ascending: false });

    if (error) throw error;

    return (data as DbDuty[]).map(mapDuty);
  },
};
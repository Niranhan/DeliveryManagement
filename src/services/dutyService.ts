import type { Duty, Order } from '@/types';
import { supabase } from '@/lib/supabase';
import { requireUserId } from '@/lib/auth';
import { todayIsoDate } from '@/utils/month';

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

/**
 * Returns the user's currently OPEN duty, or null if none exists.
 * Pure read — never creates. Safe to call from any code path, including reads.
 */
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

export const dutyService = {
  findOpenDuty,

  /**
   * Returns the current OPEN duty, or null if the user has none.
   * Does NOT auto-create. Use `ensureOpenDuty()` from write paths that
   * need a duty to attach work to.
   */
  async getCurrentDuty(): Promise<Duty | null> {
    return findOpenDuty();
  },

  /**
   * Returns the current OPEN duty, creating one lazily if none exists.
   * Race-safe: relies on the partial unique index
   *   `duties_one_open_per_user (user_id) WHERE status = 'OPEN'`
   * so two concurrent callers can never both win — the loser reads
   * the winner's row after a 23505 unique_violation.
   *
   * This is the ONLY function that creates a duty. All write paths
   * (createOrder, etc.) must go through here so the duty's opened_at
   * timestamp reflects real work, not an arbitrary UI event.
   */
  async ensureOpenDuty(): Promise<Duty> {
    const existing = await findOpenDuty();
    if (existing) return existing;

    const userId = await requireUserId();
    const nowIso = new Date().toISOString();

    const { data, error } = await supabase
      .from('duties')
      .insert({
        user_id: userId,
        date: todayIsoDate(), // Nepal-time date, not raw UTC
        status: 'OPEN',
        opened_at: nowIso,
        closed_at: null,
        closing_report_generated: false,
      })
      .select()
      .single();

    if (error) {
      // 23505 = unique_violation. Another tab / concurrent request
      // beat us to it — re-read and return the winner.
      const code = (error as { code?: string }).code;
      if (code === '23505') {
        const winner = await findOpenDuty();
        if (winner) return winner;
      }
      throw error;
    }

    return mapDuty(data as DbDuty);
  },

  async getCurrentDutyId(): Promise<string | null> {
    const duty = await findOpenDuty();
    return duty ? duty.id : null;
  },

  /**
   * True when the user has no OPEN duty (i.e. cannot currently add work).
   * Semantically: "closed or never opened" — both are indistinguishable
   * from the caller's perspective.
   */
  async hasNoOpenDuty(): Promise<boolean> {
    const duty = await findOpenDuty();
    return duty === null;
  },

  /**
   * Closes the current OPEN duty. Does NOT create a replacement — the
   * next duty is created lazily by `ensureOpenDuty()` on the next real
   * write (e.g. adding an order), so its opened_at reflects real work.
   *
   * Returns the CLOSED duty. Guarded against double-close races via
   * `.eq('status', 'OPEN')` on the update.
   */
  async closeCurrentDuty(): Promise<Duty> {
    const current = await findOpenDuty();
    if (!current) {
      throw new Error('No open duty to close.');
    }

    const { count, error: waitingCheckError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('duty_id', current.id)
      .eq('status', 'WAITING');
    if (waitingCheckError) throw waitingCheckError;
    if (count && count > 0) {
      throw new Error('Complete all waiting orders before closing the duty.');
    }

    const { data, error: closeError } = await supabase
      .from('duties')
      .update({
        status: 'CLOSED',
        closed_at: new Date().toISOString(),
        closing_report_generated: true,
      })
      .eq('id', current.id)
      .eq('status', 'OPEN') // guard: don't clobber a duty already closed by another tab
      .select()
      .single();

    if (closeError) throw closeError;
    if (!data) {
      // Row existed but wasn't OPEN when the UPDATE ran — someone else
      // closed it first. Return the current DB state instead of throwing.
      const refreshed = await supabase
        .from('duties')
        .select('*')
        .eq('id', current.id)
        .single();
      if (refreshed.error) throw refreshed.error;
      return mapDuty(refreshed.data as DbDuty);
    }

    return mapDuty(data as DbDuty);
  },

  getOrdersForCurrentDuty(orders: Order[], currentDutyId: string): Order[] {
    return orders.filter((order) => order.dutyId === currentDutyId);
  },

  getOrdersForDuty(orders: Order[], dutyId: string): Order[] {
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
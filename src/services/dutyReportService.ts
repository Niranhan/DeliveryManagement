import type { DutyReport } from '@/types';
import { supabase } from '@/lib/supabase';

function mapRow(row: Record<string, unknown>): DutyReport {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    dutyId: row.duty_id as string,
    reportDate: row.report_date as string,
    orderCount: Number(row.order_count),
    completedOrderCount: Number(row.completed_order_count),
    totalPaidToRestaurants: Number(row.total_paid_to_restaurants),
    totalCollectedFromCustomers: Number(row.total_collected_from_customers),
    totalMargin: Number(row.total_margin),
    companyMoneyUsed: Number(row.company_money_used),
    closedAt: row.closed_at as string,
    createdAt: row.created_at as string,
  };
}

export const dutyReportService = {
  async getHistory(): Promise<DutyReport[]> {
    const { data, error } = await supabase
      .from('duty_reports')
      .select('*')
      .order('closed_at', { ascending: false });

    if (error) throw error;

    return (data as Record<string, unknown>[]).map(mapRow);
  },

  async getById(id: string): Promise<DutyReport | null> {
    const { data, error } = await supabase
      .from('duty_reports')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapRow(data as Record<string, unknown>);
  },

  async getByDutyId(dutyId: string): Promise<DutyReport | null> {
    const { data, error } = await supabase
      .from('duty_reports')
      .select('*')
      .eq('duty_id', dutyId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return mapRow(data as Record<string, unknown>);
  },

  async create(input: {
    dutyId: string;
    reportDate: string;
    orderCount: number;
    completedOrderCount: number;
    totalPaidToRestaurants: number;
    totalCollectedFromCustomers: number;
    totalMargin: number;
    companyMoneyUsed: number;
    closedAt: string;
  }): Promise<DutyReport> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error('You must be signed in.');

    const { data, error } = await supabase
      .from('duty_reports')
      .insert({
        user_id: user.id,
        duty_id: input.dutyId,
        report_date: input.reportDate,
        order_count: input.orderCount,
        completed_order_count: input.completedOrderCount,
        total_paid_to_restaurants: input.totalPaidToRestaurants,
        total_collected_from_customers: input.totalCollectedFromCustomers,
        total_margin: input.totalMargin,
        company_money_used: input.companyMoneyUsed,
        closed_at: input.closedAt,
      })
      .select()
      .single();

    if (error) throw error;

    return mapRow(data as Record<string, unknown>);
  },
};

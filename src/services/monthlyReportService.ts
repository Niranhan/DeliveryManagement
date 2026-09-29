import type { MonthlyReport } from '@/types';
import { supabase } from '@/lib/supabase';
import { requireUserId } from '@/lib/auth';

export const monthlyReportService = {
  async getForMonth(month: string): Promise<MonthlyReport> {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('monthly_summary')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .maybeSingle();
    if (error) throw error;

    return {
      month,
      totalOrders: (data?.completed_orders ?? 0) + (data?.waiting_orders ?? 0),
      completedOrders: data?.completed_orders ?? 0,
      waitingOrders: data?.waiting_orders ?? 0,
      totalPaid: data?.total_paid ?? 0,
      totalCollected: data?.total_collected ?? 0,
      deliveryMargin: data?.delivery_margin ?? 0,
      salary: data?.salary ?? null,
      totalAdvances: data?.total_advances ?? 0,
      totalLiabilities: data?.total_liabilities ?? 0,
      amountToReceive: data?.final_settlement ?? null,
    };
  },
};

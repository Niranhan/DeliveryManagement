import type { MonthlyReport } from '@/types';
import { supabase } from '@/lib/supabase';
import { salaryService } from './salaryService';
import { salaryAdvanceService } from './salaryAdvanceService';
import { liabilityService } from './liabilityService';

function monthRange(month: string): { start: string; end: string } {
  const start = `${month}-01T00:00:00.000Z`;
  const [year, mon] = month.split('-').map(Number);
  const endMonth = mon === 12 ? 1 : mon + 1;
  const endYear = mon === 12 ? year + 1 : year;
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01T00:00:00.000Z`;
  return { start, end };
}

export const monthlyReportService = {
  async getForMonth(month: string): Promise<MonthlyReport> {
    const { start, end } = monthRange(month);

    const [ordersResult, salaryResult, advancesResult, liabilitiesResult] = await Promise.all([
      supabase
        .from('orders')
        .select('paid_to_restaurant, collected_from_customer, status, created_at')
        .gte('created_at', start)
        .lt('created_at', end),
      salaryService.getForMonth(month),
      salaryAdvanceService.getForMonth(month),
      liabilityService.getForMonth(month),
    ]);

    if (ordersResult.error) throw ordersResult.error;

    const orders = ordersResult.data ?? [];
    let totalPaid = 0;
    let totalCollected = 0;
    let totalOrders = orders.length;
    let completedOrders = 0;

    for (const o of orders) {
      if (o.status === 'COMPLETED') {
        completedOrders++;
        totalPaid += Number(o.paid_to_restaurant);
        totalCollected += Number(o.collected_from_customer ?? 0);
      } else if (o.status === 'WAITING') {
        totalPaid += Number(o.paid_to_restaurant);
      }
    }

    const deliveryMargin = totalCollected - totalPaid;
    const salary = salaryResult?.salaryAmount ?? null;
    const totalAdvances = advancesResult.reduce((sum, a) => sum + a.amount, 0);
    const totalLiabilities = liabilitiesResult.reduce((sum, l) => sum + l.amount, 0);

    const amountToReceive = salary != null ? salary - totalAdvances - totalLiabilities : 0;

    return {
      month,
      totalOrders,
      completedOrders,
      totalPaid,
      totalCollected,
      deliveryMargin,
      salary,
      totalAdvances,
      totalLiabilities,
      amountToReceive,
    };
  },
};

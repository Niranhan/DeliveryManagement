import type { MonthlySalary } from '@/types';
import { supabase } from '@/lib/supabase';
import { requireUserId } from '@/lib/auth';

export const salaryService = {
  async getForMonth(month: string): Promise<MonthlySalary | null> {
    const userId = await requireUserId();
    const { data, error } = await supabase
      .from('monthly_salaries')
      .select('*')
      .eq('user_id', userId)
      .eq('month', month)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    return {
      id: data.id,
      userId: data.user_id,
      month: data.month,
      salaryAmount: Number(data.salary_amount),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },

  async setForMonth(month: string, amount: number): Promise<MonthlySalary> {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('monthly_salaries')
      .upsert(
        {
          user_id: userId,
          month,
          salary_amount: amount,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,month' },
      )
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      month: data.month,
      salaryAmount: Number(data.salary_amount),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  },
};

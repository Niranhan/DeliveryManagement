import type { MonthlySalary } from '@/types';
import { supabase } from '@/lib/supabase';

export const salaryService = {
  async getForMonth(month: string): Promise<MonthlySalary | null> {
    const { data, error } = await supabase
      .from('monthly_salaries')
      .select('*')
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
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error('You must be signed in.');

    const { data, error } = await supabase
      .from('monthly_salaries')
      .upsert(
        {
          user_id: user.id,
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

import type { CompanyLiability } from '@/types';
import { supabase } from '@/lib/supabase';
import { requireUserId } from '@/lib/auth';

function mapRow(row: Record<string, unknown>): CompanyLiability {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    amount: Number(row.amount),
    usageDate: row.usage_date as string,
    note: (row.note as string) ?? '',
    createdAt: row.created_at as string,
  };
}

function monthRange(month: string): { start: string; end: string } {
  const [year, mon] = month.split('-').map(Number);
  const start = `${month}-01`;
  const endMonth = mon === 12 ? 1 : mon + 1;
  const endYear = mon === 12 ? year + 1 : year;
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;
  return { start, end };
}

export const liabilityService = {
  async getForMonth(month: string): Promise<CompanyLiability[]> {
    const userId = await requireUserId();
    const { start, end } = monthRange(month);
    const { data, error } = await supabase
      .from('company_liabilities')
      .select('*')
      .eq('user_id', userId)
      .gte('usage_date', start)
      .lt('usage_date', end)
      .order('usage_date', { ascending: false });

    if (error) throw error;

    return (data as Record<string, unknown>[]).map(mapRow);
  },

  async create(input: { amount: number; usageDate: string; note: string }): Promise<CompanyLiability> {
    const userId = await requireUserId();

    const { data, error } = await supabase
      .from('company_liabilities')
      .insert({
        user_id: userId,
        amount: input.amount,
        usage_date: input.usageDate,
        note: input.note.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    return mapRow(data as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    const userId = await requireUserId();
    const { error } = await supabase
      .from('company_liabilities')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  },
};

import type { SalaryAdvance } from '@/types';
import { supabase } from '@/lib/supabase';

function mapRow(row: Record<string, unknown>): SalaryAdvance {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    amount: Number(row.amount),
    advanceDate: row.advance_date as string,
    note: (row.note as string) ?? '',
    createdAt: row.created_at as string,
  };
}

function monthRange(month: string): { start: string; end: string } {
  const start = `${month}-01T00:00:00.000Z`;
  const [year, mon] = month.split('-').map(Number);
  const endMonth = mon === 12 ? 1 : mon + 1;
  const endYear = mon === 12 ? year + 1 : year;
  const end = `${endYear}-${String(endMonth).padStart(2, '0')}-01T00:00:00.000Z`;
  return { start, end };
}

export const salaryAdvanceService = {
  async getForMonth(month: string): Promise<SalaryAdvance[]> {
    const { start, end } = monthRange(month);
    const { data, error } = await supabase
      .from('salary_advances')
      .select('*')
      .gte('advance_date', start)
      .lt('advance_date', end)
      .order('advance_date', { ascending: false });

    if (error) throw error;

    return (data as Record<string, unknown>[]).map(mapRow);
  },

  async create(input: { amount: number; advanceDate: string; note: string }): Promise<SalaryAdvance> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) throw userError;
    if (!user) throw new Error('You must be signed in.');

    const { data, error } = await supabase
      .from('salary_advances')
      .insert({
        user_id: user.id,
        amount: input.amount,
        advance_date: input.advanceDate,
        note: input.note.trim(),
      })
      .select()
      .single();

    if (error) throw error;

    return mapRow(data as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('salary_advances').delete().eq('id', id);
    if (error) throw error;
  },
};

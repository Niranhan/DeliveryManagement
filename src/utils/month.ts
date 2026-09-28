export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function formatMonthLabel(month: string): string {
  const [year, mon] = month.split('-').map(Number);
  return new Date(year, mon - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function previousMonth(month: string): string {
  const [year, mon] = month.split('-').map(Number);
  const prevMon = mon === 1 ? 12 : mon - 1;
  const prevYear = mon === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMon).padStart(2, '0')}`;
}

export function nextMonth(month: string): string {
  const [year, mon] = month.split('-').map(Number);
  const nextMon = mon === 12 ? 1 : mon + 1;
  const nextYear = mon === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMon).padStart(2, '0')}`;
}

export function isCurrentMonth(month: string): boolean {
  return month === currentMonth();
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthLabel, previousMonth, nextMonth, isCurrentMonth } from '@/utils/month';

interface MonthSelectorProps {
  month: string;
  onChange: (month: string) => void;
}

export function MonthSelector({ month, onChange }: MonthSelectorProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-3 shadow-card">
      <button
        onClick={() => onChange(previousMonth(month))}
        className="no-tap flex h-9 w-9 items-center justify-center rounded-full text-ink-500 active:bg-ink-100"
        aria-label="Previous month"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-sm font-bold text-ink-900">{formatMonthLabel(month)}</span>
      <button
        onClick={() => onChange(nextMonth(month))}
        disabled={isCurrentMonth(month)}
        className={`no-tap flex h-9 w-9 items-center justify-center rounded-full text-ink-500 active:bg-ink-100 ${
          isCurrentMonth(month) ? 'opacity-30' : ''
        }`}
        aria-label="Next month"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

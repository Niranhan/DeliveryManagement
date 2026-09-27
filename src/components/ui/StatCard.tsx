interface StatCardProps {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  emphasis?: boolean;
}

const toneCls = {
  default: 'text-ink-900',
  success: 'text-success-600',
  warning: 'text-warning-600',
  danger: 'text-danger-600',
};

export function StatCard({ label, value, tone = 'default', emphasis = false }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-3.5 shadow-card">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">{label}</p>
      <p className={`mt-1 font-bold ${emphasis ? 'text-xl' : 'text-lg'} ${toneCls[tone]}`}>{value}</p>
    </div>
  );
}

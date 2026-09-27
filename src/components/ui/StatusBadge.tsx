interface StatusBadgeProps {
  status: 'WAITING' | 'COMPLETED' | 'CANCELLED';
  size?: 'sm' | 'md';
}

const config = {
  WAITING: { label: 'Waiting for delivery', cls: 'bg-warning-100 text-warning-700' },
  COMPLETED: { label: 'Completed', cls: 'bg-success-100 text-success-700' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-ink-100 text-ink-500' },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const c = config[status];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold ${c.cls} ${pad}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {c.label}
    </span>
  );
}

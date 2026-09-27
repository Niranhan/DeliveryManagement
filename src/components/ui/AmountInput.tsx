import type { InputHTMLAttributes } from 'react';

interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  prefix?: string;
}

export function AmountInput({ label, prefix = 'Rs.', className = '', ...rest }: AmountInputProps) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</label>}
      <div className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white px-4 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
        <span className="text-lg font-semibold text-ink-400">{prefix}</span>
        <input
          {...rest}
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="0"
          className={`h-16 w-full bg-transparent text-2xl font-bold text-ink-900 outline-none placeholder:text-ink-300 ${className}`}
        />
      </div>
    </div>
  );
}

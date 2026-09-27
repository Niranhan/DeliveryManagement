import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white active:bg-brand-600 shadow-sm',
  secondary: 'bg-white text-ink-900 border border-ink-200 active:bg-ink-50',
  ghost: 'bg-transparent text-brand-600 active:bg-brand-50',
  danger: 'bg-danger-500 text-white active:bg-danger-600',
};

const sizes: Record<Size, string> = {
  md: 'h-11 px-4 text-sm',
  lg: 'h-14 px-5 text-base',
};

export function PrimaryButton({
  variant = 'primary',
  size = 'lg',
  loading = false,
  fullWidth = true,
  disabled,
  children,
  className = '',
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`no-tap inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors disabled:opacity-50 disabled:active:bg-inherit ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

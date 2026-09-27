import type { ReactNode } from 'react';
import { PrimaryButton } from './PrimaryButton';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  icon?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'default',
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative mx-auto w-full max-w-[480px] rounded-t-3xl bg-white p-5 pb-6 shadow-xl sm:rounded-3xl">
        {icon && (
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-warning-100">
            {icon ?? <AlertTriangle size={24} className="text-warning-600" />}
          </div>
        )}
        <h2 className="text-lg font-bold text-ink-900">{title}</h2>
        <div className="mt-1.5 text-sm text-ink-500">{description}</div>
        <div className="mt-5 space-y-2.5">
          <PrimaryButton variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </PrimaryButton>
          <PrimaryButton variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onBack?: () => void;
}

import { ChevronLeft } from 'lucide-react';

export function PageHeader({ title, subtitle, right, onBack }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-ink-50/90 backdrop-blur-md">
      <div className="page-pad pt-3 pb-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="no-tap -ml-1 flex h-9 w-9 items-center justify-center rounded-full text-ink-700 active:bg-ink-100"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold text-ink-900">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}
          </div>
          {right}
        </div>
      </div>
    </header>
  );
}

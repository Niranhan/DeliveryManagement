import type { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';

interface AppShellProps {
  children: ReactNode;
  showNav?: boolean;
}

export function AppShell({ children, showNav = true }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className={showNav ? 'nav-safe min-h-screen' : 'min-h-screen'}>{children}</div>
      {showNav && <BottomNavigation />}
    </div>
  );
}

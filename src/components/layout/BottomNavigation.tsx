import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, UtensilsCrossed, MoreHorizontal } from 'lucide-react';

const items = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/active', label: 'Orders', icon: ClipboardList },
  { to: '/restaurants', label: 'Restaurants', icon: UtensilsCrossed },
  { to: '/more', label: 'More', icon: MoreHorizontal },
];

export function BottomNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px]">
      <div className="flex items-stretch justify-around border-t border-ink-100 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] pt-1.5 shadow-nav backdrop-blur-md">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `no-tap flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-brand-600' : 'text-ink-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { BarChart3, LogOut, ChevronRight } from 'lucide-react';

export function MoreScreen() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell>
      <PageHeader title="More" />

      <div className="page-pad pt-2 pb-6 space-y-5">
        <div className="rounded-2xl border border-ink-100 bg-white p-4 shadow-card">
          <div className="flex items-center gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-14 w-14 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-600">
                {user?.name?.charAt(0) ?? '?'}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-ink-900">{user?.name}</p>
              <p className="truncate text-sm text-ink-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => navigate('/summary')}
            className="no-tap flex w-full items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card active:shadow-card-hover"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <BarChart3 size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink-900">Daily Summary</p>
                <p className="text-xs text-ink-400">View today's breakdown</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-ink-300" />
          </button>
        </div>

        <div className="pt-2">
          <PrimaryButton variant="danger" onClick={handleSignOut}>
            <LogOut size={18} />
            Sign Out
          </PrimaryButton>
        </div>

        <p className="text-center text-xs text-ink-400">Delivery Manager v1.0</p>
      </div>
    </AppShell>
  );
}

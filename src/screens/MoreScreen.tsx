import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { generateClosingReport } from '@/utils/pdfReport';
import { BarChart3, LogOut, ChevronRight, Power, CheckCircle2, AlertTriangle } from 'lucide-react';

type DialogState = 'none' | 'confirm' | 'active-remaining' | 'success';

export function MoreScreen() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentDuty, currentDutyOrders, closeDuty } = useAppData();
  const [dialog, setDialog] = useState<DialogState>('none');
  const [closing, setClosing] = useState(false);

  const dutyClosed = currentDuty.status === 'CLOSED';
  const activeCount = currentDutyOrders.filter((o) => o.status === 'WAITING').length;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleCloseDuty = () => {
    if (dutyClosed) return;
    setDialog('confirm');
  };

  const confirmCloseDuty = async () => {
    if (activeCount > 0) {
      setDialog('active-remaining');
      return;
    }
    setClosing(true);
    const closedDuty = currentDuty;
    const ordersForReport = [...currentDutyOrders];
    closeDuty();
    try {
      await generateClosingReport({ duty: closedDuty, orders: ordersForReport, user });
    } catch {
      // PDF generation failed — duty still closed
    }
    setClosing(false);
    setDialog('success');
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

          <button
            onClick={handleCloseDuty}
            disabled={dutyClosed}
            className={`no-tap flex w-full items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card active:shadow-card-hover ${
              dutyClosed ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                  dutyClosed ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'
                }`}
              >
                {dutyClosed ? <CheckCircle2 size={20} /> : <Power size={20} />}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink-900">
                  {dutyClosed ? "Today's Duty Closed" : 'Close Duty'}
                </p>
                <p className="text-xs text-ink-400">
                  {dutyClosed
                    ? 'Start a new duty to continue'
                    : 'End today\'s duty and generate report'}
                </p>
              </div>
            </div>
            {!dutyClosed && <ChevronRight size={18} className="text-ink-300" />}
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

      <ConfirmDialog
        open={dialog === 'confirm'}
        title="Close Today's Duty?"
        description="Your completed orders and today's financial summary will be recorded in the daily closing report. You can start a new duty afterward."
        confirmLabel="Close Duty"
        variant="danger"
        icon={<Power size={24} className="text-warning-600" />}
        onConfirm={confirmCloseDuty}
        onCancel={() => setDialog('none')}
      />

      {closing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <p className="text-sm font-medium text-ink-700">Generating report...</p>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={dialog === 'active-remaining'}
        title="Active Orders Remaining"
        description={`You still have ${activeCount} active order${activeCount === 1 ? '' : 's'}. Complete them before closing your duty.`}
        confirmLabel="Go to Active Orders"
        icon={<AlertTriangle size={24} className="text-warning-600" />}
        onConfirm={() => {
          setDialog('none');
          navigate('/active');
        }}
        onCancel={() => setDialog('none')}
      />

      <ConfirmDialog
        open={dialog === 'success'}
        title="Duty Closed Successfully"
        description="Your daily closing report has been downloaded. A new duty has been started for today."
        confirmLabel="Done"
        icon={<CheckCircle2 size={24} className="text-success-600" />}
        onConfirm={() => setDialog('none')}
        onCancel={() => setDialog('none')}
      />
    </AppShell>
  );
}

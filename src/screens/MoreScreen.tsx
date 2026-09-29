import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAppData } from '@/context/AppDataContext';
import { liabilityService } from '@/services/liabilityService';
import { dutyService } from '@/services/dutyService';
import { supabase } from '@/lib/supabase';
import { todayIsoDate } from '@/utils/month';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { AmountInput } from '@/components/ui/AmountInput';
import {
  BarChart3,
  LogOut,
  ChevronRight,
  Power,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  ArrowDownCircle,
  AlertCircle,
} from 'lucide-react';

type DialogState = 'none' | 'confirm' | 'company-money' | 'active-remaining' | 'success';

export function MoreScreen() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { currentDuty, currentDutyOrders, closeDuty } = useAppData();
  const [dialog, setDialog] = useState<DialogState>('none');
  const [closing, setClosing] = useState(false);

  const [liabilityAmount, setLiabilityAmount] = useState('');
  const [liabilityNote, setLiabilityNote] = useState('');
  const [liabilityError, setLiabilityError] = useState('');

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

  const confirmCloseDuty = () => {
    if (activeCount > 0) {
      setDialog('active-remaining');
      return;
    }
    setDialog('company-money');
  };

  const handleNoCompanyMoney = async () => {
    setClosing(true);
    try {
      await closeDuty();
      setDialog('success');
    } catch {
      setDialog('none');
    } finally {
      setClosing(false);
    }
  };

  const handleAddLiabilityAndClose = async () => {
    const amt = Number(liabilityAmount);
    if (!liabilityAmount.trim() || isNaN(amt) || amt <= 0) {
      setLiabilityError('Enter a valid amount or skip.');
      return;
    }
    setLiabilityError('');
    setClosing(true);
    try {
      const openDuty = await dutyService.findOpenDuty();
      if (openDuty) {
        const { count } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('duty_id', openDuty.id)
          .eq('status', 'WAITING');
        if (count && count > 0) {
          setLiabilityError('Complete all waiting orders before closing the duty.');
          setClosing(false);
          return;
        }
      }
      await liabilityService.create({
        amount: amt,
        usageDate: todayIsoDate(),
        note: liabilityNote.trim(),
      });
      await closeDuty();
      setLiabilityAmount('');
      setLiabilityNote('');
      setDialog('success');
    } catch {
      setLiabilityError('Could not save. Please try again.');
    } finally {
      setClosing(false);
    }
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
            onClick={() => navigate('/monthly')}
            className="no-tap flex w-full items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card active:shadow-card-hover"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <BarChart3 size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink-900">Monthly Overview</p>
                <p className="text-xs text-ink-400">Monthly report and settlement</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-ink-300" />
          </button>

          <button
            onClick={() => navigate('/salary')}
            className="no-tap flex w-full items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card active:shadow-card-hover"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Wallet size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink-900">Salary</p>
                <p className="text-xs text-ink-400">Set your monthly salary</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-ink-300" />
          </button>

          <button
            onClick={() => navigate('/advances')}
            className="no-tap flex w-full items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card active:shadow-card-hover"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-100 text-warning-600">
                <ArrowDownCircle size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink-900">Salary Advances</p>
                <p className="text-xs text-ink-400">Track advances taken</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-ink-300" />
          </button>

          <button
            onClick={() => navigate('/liabilities')}
            className="no-tap flex w-full items-center justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-card active:shadow-card-hover"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger-100 text-danger-600">
                <AlertCircle size={20} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-ink-900">Company Money</p>
                <p className="text-xs text-ink-400">Personal usage liability</p>
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
                  {dutyClosed ? 'Start a new duty to continue' : "End today's work session"}
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

        <p className="text-center text-xs text-ink-400">Delivery Manager v2.0</p>
      </div>

      {/* Confirm Close Duty */}
      <ConfirmDialog
        open={dialog === 'confirm'}
        title="Close Today's Duty?"
        description="This will end your current work session. Your orders will be preserved in history. You can start a new duty afterward."
        confirmLabel="Continue"
        variant="danger"
        icon={<Power size={24} className="text-warning-600" />}
        onConfirm={confirmCloseDuty}
        onCancel={() => setDialog('none')}
      />

      {/* Company Money prompt */}
      {dialog === 'company-money' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => !closing && setDialog('none')} />
          <div className="relative mx-auto w-full max-w-[480px] rounded-t-3xl bg-white p-5 pb-6 shadow-xl sm:rounded-3xl">
            <h2 className="text-lg font-bold text-ink-900">Company Money Used?</h2>
            <p className="mt-1.5 text-sm text-ink-500">Did you use any company money for personal use today?</p>

            <div className="mt-4 space-y-3">
              <AmountInput
                label="Amount (optional)"
                prefix="Rs."
                value={liabilityAmount}
                onChange={(e) => {
                  setLiabilityAmount(e.target.value);
                  setLiabilityError('');
                }}
              />
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-400">Note (optional)</label>
                <input
                  value={liabilityNote}
                  onChange={(e) => setLiabilityNote(e.target.value)}
                  placeholder="Personal expense"
                  className="h-12 w-full rounded-2xl border border-ink-200 bg-white px-4 text-sm text-ink-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
              {liabilityError && <p className="text-xs text-danger-600">{liabilityError}</p>}
            </div>

            <div className="mt-5 space-y-2.5">
              <PrimaryButton onClick={handleAddLiabilityAndClose} loading={closing}>
                Add Liability & Close Duty
              </PrimaryButton>
              <PrimaryButton variant="secondary" onClick={handleNoCompanyMoney} disabled={closing}>
                No, I didn't
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Active orders remaining */}
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

      {/* Success */}
      <ConfirmDialog
        open={dialog === 'success'}
        title="Duty Closed Successfully"
        description="Your duty has been closed and a new duty has been started. View your duty history to download reports."
        confirmLabel="Done"
        icon={<CheckCircle2 size={24} className="text-success-600" />}
        onConfirm={() => setDialog('none')}
        onCancel={() => setDialog('none')}
      />
    </AppShell>
  );
}

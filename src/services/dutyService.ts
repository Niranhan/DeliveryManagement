import type { Duty, Order } from '@/types';

const DUTY_KEY = 'delivery-manager-duties-v1';
const CURRENT_DUTY_KEY = 'delivery-manager-current-duty-v1';
const DEFAULT_DUTY_ID = 'duty-init';

function loadDuties(): Duty[] {
  try {
    const raw = localStorage.getItem(DUTY_KEY);
    if (raw) return JSON.parse(raw) as Duty[];
  } catch {
    // ignore
  }
  const initial: Duty = {
    id: DEFAULT_DUTY_ID,
    userId: 'u1',
    date: new Date().toISOString().slice(0, 10),
    status: 'OPEN',
    openedAt: new Date().toISOString(),
    closedAt: null,
    closingReportGenerated: false,
  };
  localStorage.setItem(DUTY_KEY, JSON.stringify([initial]));
  return [initial];
}

function saveDuties(duties: Duty[]): void {
  localStorage.setItem(DUTY_KEY, JSON.stringify(duties));
}

function loadCurrentDutyId(): string {
  const id = localStorage.getItem(CURRENT_DUTY_KEY);
  if (id) return id;
  const duties = loadDuties();
  const open = duties.find((d) => d.status === 'OPEN');
  const currentId = open?.id ?? DEFAULT_DUTY_ID;
  localStorage.setItem(CURRENT_DUTY_KEY, currentId);
  return currentId;
}

function saveCurrentDutyId(id: string): void {
  localStorage.setItem(CURRENT_DUTY_KEY, id);
}

export const dutyService = {
  getCurrentDuty(): Duty {
    const duties = loadDuties();
    const currentId = loadCurrentDutyId();
    return duties.find((d) => d.id === currentId) ?? duties[0];
  },

  getCurrentDutyId(): string {
    return loadCurrentDutyId();
  },

  isCurrentDutyClosed(): boolean {
    return this.getCurrentDuty().status === 'CLOSED';
  },

  closeCurrentDuty(): Duty {
    const duties = loadDuties();
    const currentId = loadCurrentDutyId();
    const idx = duties.findIndex((d) => d.id === currentId);
    if (idx === -1) throw new Error('Current duty not found');
    duties[idx] = {
      ...duties[idx],
      status: 'CLOSED',
      closedAt: new Date().toISOString(),
      closingReportGenerated: true,
    };
    saveDuties(duties);

    const newDuty: Duty = {
      id: `duty-${Date.now()}`,
      userId: duties[idx].userId,
      date: new Date().toISOString().slice(0, 10),
      status: 'OPEN',
      openedAt: new Date().toISOString(),
      closedAt: null,
      closingReportGenerated: false,
    };
    duties.push(newDuty);
    saveDuties(duties);
    saveCurrentDutyId(newDuty.id);
    return newDuty;
  },

  getOrdersForCurrentDuty(orders: Order[]): Order[] {
    const currentId = loadCurrentDutyId();
    return orders.filter((o) => o.dutyId === currentId);
  },

  getOrdersForDuty(orders: Order[], dutyId: string): Order[] {
    return orders.filter((o) => o.dutyId === dutyId);
  },

  getClosedDuties(): Duty[] {
    return loadDuties().filter((d) => d.status === 'CLOSED');
  },
};

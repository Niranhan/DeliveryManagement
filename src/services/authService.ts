import type { User } from '@/types';

const STORAGE_KEY = 'delivery-manager-auth-v1';

const mockUser: User = {
  id: 'u1',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@gmail.com',
  avatarUrl: 'https://i.pravatar.cc/150?img=12',
};

interface StoredAuth {
  user: User;
  token: string;
}

function readStored(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredAuth;
  } catch {
    // ignore
  }
  return null;
}

function writeStored(auth: StoredAuth | null): void {
  if (auth) localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  else localStorage.removeItem(STORAGE_KEY);
}

export const authService = {
  getCurrentUser(): User | null {
    const stored = readStored();
    return stored?.user ?? null;
  },

  async signInWithGoogle(): Promise<User> {
    await new Promise((r) => setTimeout(r, 900));
    const auth: StoredAuth = {
      user: mockUser,
      token: 'mock-google-token',
    };
    writeStored(auth);
    return mockUser;
  },

  async signOut(): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    writeStored(null);
  },
};

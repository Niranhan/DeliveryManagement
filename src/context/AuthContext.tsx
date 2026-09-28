import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { User } from '@/types';
import { authService } from '@/services/authService';
import { supabase } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function mapSupabaseUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): User {
  const metadata = user.user_metadata ?? {};

  return {
    id: user.id,
    name:
      (metadata.full_name as string | undefined) ??
      (metadata.name as string | undefined) ??
      user.email ??
      '',
    email: user.email ?? '',
    avatarUrl:
      (metadata.avatar_url as string | undefined) ??
      (metadata.picture as string | undefined) ??
      '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setLoading(false);
    });

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setUser(session?.user ? mapSupabaseUser(session.user) : null);
      } catch (error) {
        console.error('Auth initialization failed:', error);

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await authService.signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signInWithGoogle,
      signOut,
    }),
    [user, loading, signInWithGoogle, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return ctx;
}
import type { User } from '@/types';
import { supabase } from '@/lib/supabase';

function mapSupabaseUser(
  supabaseUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  }
): User {
  const metadata = supabaseUser.user_metadata ?? {};

  return {
    id: supabaseUser.id,
    name:
      (metadata.full_name as string | undefined) ??
      (metadata.name as string | undefined) ??
      supabaseUser.email ??
      '',
    email: supabaseUser.email ?? '',
    avatarUrl:
      (metadata.avatar_url as string | undefined) ??
      (metadata.picture as string | undefined) ??
      '',
  };
}

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return mapSupabaseUser(user);
  },

  async signInWithGoogle(): Promise<User> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      throw error;
    }

    // Google OAuth redirects the browser away from this page,
    // so this normally won't be reached.
    throw new Error('Google sign-in did not redirect.');
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
  },
};
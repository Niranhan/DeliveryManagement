import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Package } from 'lucide-react';

export function LoginScreen() {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/home', { replace: true });
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell flex flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-500 shadow-lg shadow-brand-500/30">
          <Package size={40} className="text-white" strokeWidth={2.2} />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-ink-900">Delivery Manager</h1>
        <p className="mt-2 text-center text-sm text-ink-500">Track your deliveries, payments and daily margins.</p>

        <div className="mt-12 w-full max-w-sm">
          <PrimaryButton onClick={handleSignIn} loading={loading} size="lg">
            {loading ? (
              'Signing in...'
            ) : (
              <>
                <GoogleIcon />
                Continue with Google
              </>
            )}
          </PrimaryButton>
        </div>
      </div>

      <p className="pb-8 text-center text-xs text-ink-400">By continuing you agree to our Terms & Privacy Policy</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.33z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

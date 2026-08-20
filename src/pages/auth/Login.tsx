import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store';
import * as AuthService from '@/services/auth';

export default function Login() {
  const navigate = useNavigate();
  const setSession = useAppStore((s) => s.setSession);
  const loginDemo = useAppStore((s) => s.loginDemo);

  const [uid, setUid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!uid.trim() || !password) {
      setError('Please enter both your UID and password.');
      return;
    }

    setLoading(true);
    const result = await AuthService.login(uid.trim().toUpperCase(), password);

    if (!result.success) {
      setError(result.error ?? 'Login failed. Please try again.');
      setLoading(false);
      return;
    }

    // Persist the resolved session into the store so the whole app can read it
    setSession({
      userId: result.userId!,
      uid: result.uid!,
      sessionStart: new Date().toISOString(),
      isDemo: false,
    });

    navigate('/', { replace: true });
  };

  const onDemo = () => {
    setDemoLoading(true);
    setError(null);
    loginDemo();
    setTimeout(() => navigate('/', { replace: true }), 450);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="font-display text-2xl font-bold text-text-primary">
          Welcome back
        </h2>
        <p className="text-sm text-text-secondary">
          Enter your anonymous credentials
        </p>
      </div>

      <form onSubmit={onLogin} className="space-y-4">
        <Input
          label="UID"
          placeholder="WB-XXXXXX"
          value={uid}
          onChange={(e) => setUid(e.target.value.toUpperCase())}
          leftIcon={<User className="w-4.5 h-4.5" />}
          autoComplete="username"
          autoCapitalize="characters"
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4.5 h-4.5" />}
          autoComplete="current-password"
        />

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-accent-rose/30 bg-accent-rose/5 p-3">
            <AlertCircle className="w-4.5 h-4.5 text-accent-rose flex-shrink-0 mt-0.5" />
            <p className="text-sm text-accent-rose leading-relaxed">{error}</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Forgot your UID?
          </button>
        </div>

        <Button variant="primary" size="lg" className="w-full" loading={loading} type="submit">
          Log in
        </Button>
      </form>

      <div className="relative flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-surface-border" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Or
        </span>
        <div className="h-px flex-1 bg-surface-border" />
      </div>

      <div className="space-y-3">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onClick={onDemo}
          loading={demoLoading}
          type="button"
        >
          {demoLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Entering demo mode...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Try without logging in
            </>
          )}
        </Button>
        <p className="text-center text-[11px] text-text-muted leading-relaxed px-2">
          Explore the app instantly with a guest session.
          No account required and your actions won't be saved permanently.
        </p>
      </div>

      <div className="pt-2 text-center text-sm">
        <span className="text-text-secondary">No account yet? </span>
        <Link
          to="/auth/create"
          className="font-medium text-accent-lavender hover:text-accent-cyan transition-colors"
        >
          Create anonymous account
        </Link>
      </div>
    </div>
  );
}

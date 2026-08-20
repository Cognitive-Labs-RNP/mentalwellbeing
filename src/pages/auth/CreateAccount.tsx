import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  User,
  Check,
  AlertCircle,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store';
import { generateUid, hashPasswordSync } from '@/services/auth';

const passwordRequirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'At least one uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'At least one number', test: (p: string) => /\d/.test(p) },
];

export default function CreateAccount() {
  const navigate = useNavigate();
  const createAccount = useAppStore((s) => s.createAccount);
  const loginDemo = useAppStore((s) => s.loginDemo);

  const [uid] = useState(() => generateUid());
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uidRevealed = true;

  const passwordValid = useMemo(
    () => passwordRequirements.every((req) => req.test(password)),
    [password]
  );
  const passwordsMatch = password.length > 0 && confirm.length > 0 && password === confirm;
  const canSubmit = passwordValid && passwordsMatch && agreed;

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Could not copy UID. Please write it down manually.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      if (!passwordValid) setError('Password must meet all requirements.');
      else if (!passwordsMatch) setError('Passwords do not match.');
      else if (!agreed) setError('Please agree to the privacy notice to continue.');
      return;
    }
    setLoading(true);
    const hash = hashPasswordSync(password);
    createAccount({
      uid,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    });
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 500);
  };

  const onDemo = () => {
    setDemoLoading(true);
    loginDemo();
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 450);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="font-display text-2xl font-bold text-text-primary">
          Create anonymous account
        </h2>
        <p className="text-sm text-text-secondary">
          Fully anonymous — no email, name or personal info
        </p>
      </div>

      <div className="rounded-2xl border border-accent-lavender/20 bg-accent-lavender/5 p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-accent-lavender/15 flex items-center justify-center flex-shrink-0">
            <User className="w-4.5 h-4.5 text-accent-lavender" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
              Your Anonymous UID
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="flex-1 min-w-[120px] font-mono text-lg font-bold tracking-wider text-text-primary select-all break-all">
                {uid}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={onCopy}
                type="button"
                className="flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>Copy UID</>
                )}
              </Button>
            </div>
          </div>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          Save this UID somewhere safe. You'll need it to log back in.{' '}
          <strong className="text-text-secondary">No recovery — if lost, account cannot be restored.</strong>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="Create a password"
            type={showPassword ? 'text' : 'password'}
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4.5 h-4.5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="p-1 rounded-md text-text-muted hover:text-text-secondary transition-colors -mr-1"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            }
            autoComplete="new-password"
          />
        </div>

        <div className="rounded-xl border border-surface-border bg-surface/40 p-3 space-y-1.5">
          {passwordRequirements.map((req) => {
            const ok = req.test(password);
            return (
              <div key={req.label} className="flex items-center gap-2">
                <span
                  className={[
                    'h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                    ok
                      ? 'bg-accent-green/15 text-accent-green'
                      : 'bg-surface-hover/60 text-text-muted',
                  ].join(' ')}
                >
                  {ok ? (
                    <Check className="w-3 h-3" strokeWidth={3} />
                  ) : (
                    <X className="w-2.5 h-2.5" strokeWidth={3} />
                  )}
                </span>
                <span
                  className={[
                    'text-xs leading-tight',
                    ok ? 'text-text-secondary' : 'text-text-muted',
                  ].join(' ')}
                >
                  {req.label}
                </span>
              </div>
            );
          })}
        </div>

        <Input
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          leftIcon={<Lock className="w-4.5 h-4.5" />}
          autoComplete="new-password"
        />

        {confirm.length > 0 && (
          <div className="flex items-center gap-2 -mt-2">
            {passwordsMatch ? (
              <>
                <Check className="w-4 h-4 text-accent-green" />
                <span className="text-xs text-accent-green">Passwords match</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-accent-rose" />
                <span className="text-xs text-accent-rose">Passwords do not match</span>
              </>
            )}
          </div>
        )}

        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="peer sr-only"
            aria-label="Agree to privacy notice"
          />
          <span
            className={[
              'mt-0.5 h-5 w-5 flex-shrink-0 rounded-md border transition-all flex items-center justify-center',
              agreed
                ? 'bg-accent-lavender border-accent-lavender text-white'
                : 'border-surface-border bg-surface/40 group-hover:border-accent-lavender/40',
            ].join(' ')}
            aria-hidden
          >
            {agreed && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
          </span>
          <span className="text-xs text-text-secondary leading-relaxed">
            I understand my data is stored{' '}
            <strong className="text-text-primary">only on this device</strong> and I must{' '}
            <strong className="text-text-primary">keep my UID safe</strong> to regain access.
          </span>
        </label>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-accent-rose/30 bg-accent-rose/5 p-3">
            <AlertCircle className="w-4.5 h-4.5 text-accent-rose flex-shrink-0 mt-0.5" />
            <p className="text-sm text-accent-rose leading-relaxed">{error}</p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          type="submit"
          disabled={!canSubmit}
        >
          <ShieldCheck className="w-5 h-5" />
          Create account
        </Button>
      </form>

      <div className="relative flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-surface-border" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
          Or
        </span>
        <div className="h-px flex-1 bg-surface-border" />
      </div>

      <div className="space-y-2">
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
          Just exploring? Use a guest session — no account setup needed.
        </p>
      </div>

      <div className="pt-2 text-center text-sm">
        <span className="text-text-secondary">Already have an account? </span>
        <Link
          to="/auth/login"
          className="font-medium text-accent-lavender hover:text-accent-cyan transition-colors"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}

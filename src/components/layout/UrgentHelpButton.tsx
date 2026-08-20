import { useState } from 'react';
import { X, Heart, Phone, Wind, UserPlus } from 'lucide-react';

interface UrgentHelpButtonProps {
  variant?: 'sidebar' | 'floating' | 'topbar';
}

export function UrgentHelpButton({ variant = 'floating' }: UrgentHelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-accent-rose/50 min-h-[44px] min-w-[44px]';

  const variantClasses = {
    floating:
      'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full border-2 border-accent-rose bg-surface/80 hover:bg-accent-rose/20 backdrop-blur-md shadow-glow',
    sidebar:
      'w-full border border-accent-rose/50 text-accent-rose hover:bg-accent-rose/10 px-4 py-3 gap-2',
    topbar:
      'h-10 w-10 rounded-full border border-accent-rose/50 text-accent-rose hover:bg-accent-rose/10',
  } as const;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Need urgent help?"
        className={`${baseClasses} ${variantClasses[variant]}`}
      >
        {variant === 'sidebar' ? (
          <>
            <Heart className="h-5 w-5 animate-pulse" aria-hidden="true" />
            <span className="text-sm font-medium">Need urgent help?</span>
          </>
        ) : (
          <Heart className={variant === 'topbar' ? 'h-5 w-5' : 'h-6 w-6'} aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="urgent-help-title"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md glass rounded-2xl p-6 shadow-glow animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2
                  id="urgent-help-title"
                  className="text-xl font-semibold text-text-primary font-display"
                >
                  Urgent Support
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  You&apos;re not alone. Choose the support that feels right for you.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close urgent help"
                className="min-h-[44px] min-w-[44px] rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors inline-flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                className="w-full min-h-[56px] flex items-center gap-4 px-4 py-3 rounded-xl border border-surface-border bg-surface/50 hover:bg-surface-hover transition-colors text-left group"
              >
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-accent-rose/15 flex items-center justify-center group-hover:bg-accent-rose/25 transition-colors">
                  <Phone className="h-5 w-5 text-accent-rose" />
                </div>
                <div>
                  <div className="font-medium text-text-primary">Crisis resources</div>
                  <div className="text-sm text-text-secondary">Hotlines &amp; immediate support lines</div>
                </div>
              </button>

              <button
                type="button"
                className="w-full min-h-[56px] flex items-center gap-4 px-4 py-3 rounded-xl border border-surface-border bg-surface/50 hover:bg-surface-hover transition-colors text-left group"
              >
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-accent-cyan/15 flex items-center justify-center group-hover:bg-accent-cyan/25 transition-colors">
                  <Wind className="h-5 w-5 text-accent-cyan" />
                </div>
                <div>
                  <div className="font-medium text-text-primary">Breathing exercise</div>
                  <div className="text-sm text-text-secondary">Guided 4-7-8 grounding technique</div>
                </div>
              </button>

              <button
                type="button"
                className="w-full min-h-[56px] flex items-center gap-4 px-4 py-3 rounded-xl border border-surface-border bg-surface/50 hover:bg-surface-hover transition-colors text-left group"
              >
                <div className="flex-shrink-0 h-12 w-12 rounded-xl bg-accent-lavender/15 flex items-center justify-center group-hover:bg-accent-lavender/25 transition-colors">
                  <UserPlus className="h-5 w-5 text-accent-lavender" />
                </div>
                <div>
                  <div className="font-medium text-text-primary">Find professional care</div>
                  <div className="text-sm text-text-secondary">Connect with licensed therapists</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

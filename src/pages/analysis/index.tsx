import { Outlet, useLocation, Link } from 'react-router-dom';
import { Check, Pencil, ShieldCheck, Loader2, Sparkles, Clock } from 'lucide-react';

const STEPS = [
  { key: 'input', label: 'Input', icon: Pencil, path: '/analysis/input' },
  { key: 'privacy-review', label: 'Privacy Review', icon: ShieldCheck, path: '/analysis/privacy-review' },
  { key: 'loading', label: 'Analysing', icon: Loader2, path: '/analysis/loading' },
  { key: 'result', label: 'Result', icon: Sparkles, path: '/analysis/result' },
  { key: 'history', label: 'History', icon: Clock, path: '/analysis/history' },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

const PATH_TO_STEP: Record<string, StepKey> = {
  '/analysis/input': 'input',
  '/analysis/privacy-review': 'privacy-review',
  '/analysis/loading': 'loading',
  '/analysis/result': 'result',
  '/analysis/history': 'history',
};

const STEP_ORDER: StepKey[] = ['input', 'privacy-review', 'loading', 'result', 'history'];

function getStepStatus(stepKey: StepKey, currentKey: StepKey) {
  const stepIdx = STEP_ORDER.indexOf(stepKey);
  const currentIdx = STEP_ORDER.indexOf(currentKey);
  if (stepIdx < currentIdx) return 'done' as const;
  if (stepIdx === currentIdx) return 'active' as const;
  return 'pending' as const;
}

export default function Analysis() {
  const location = useLocation();
  const currentStep: StepKey =
    PATH_TO_STEP[location.pathname] ?? 'input';

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary">
          Wellbeing analysis
        </h1>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          A private, step-by-step check-in to understand what you're feeling — and why.
        </p>
      </div>

      <div
        className="bg-surface/60 backdrop-blur-xl border border-surface-border rounded-3xl p-4 md:p-6 shadow-glass"
        aria-label="Analysis progress steps"
      >
        <ol className="flex items-start justify-between gap-2 md:gap-4">
          {STEPS.map((step, idx) => {
            const status = getStepStatus(step.key, currentStep);
            const Icon = step.icon;
            const isLast = idx === STEPS.length - 1;

            return (
              <li key={step.key} className="flex-1 min-w-0 relative">
                <div className="flex flex-col items-center gap-2 relative z-10">
                  <Link
                    to={step.path}
                    className={[
                      'w-11 h-11 md:w-12 md:h-12 rounded-full border flex items-center justify-center transition-all duration-300 flex-shrink-0',
                      status === 'active'
                        ? 'bg-gradient-to-br from-accent-lavender/30 to-purple-500/20 border-accent-lavender/50 text-accent-lavender shadow-[0_0_20px_rgba(167,139,250,0.25)] scale-105'
                        : status === 'done'
                        ? 'bg-accent-lavender/20 border-accent-lavender/40 text-accent-lavender hover:bg-accent-lavender/28'
                        : 'bg-surface-hover/40 border-surface-border/60 text-text-muted hover:bg-surface-hover/60 hover:text-text-secondary',
                    ].join(' ')}
                    aria-current={status === 'active' ? 'step' : undefined}
                  >
                    {status === 'done' ? (
                      <Check className="w-5 h-5 md:w-5.5 md:h-5.5" strokeWidth={2.5} />
                    ) : (
                      <Icon
                        className={`w-4.5 h-4.5 md:w-5 md:h-5 ${status === 'active' ? 'animate-pulse-slow' : ''}`}
                        strokeWidth={step.key === 'loading' ? 2 : 1.9}
                      />
                    )}
                  </Link>

                  <div className="text-center min-w-0 px-0.5">
                    <p
                      className={[
                        'text-[11px] md:text-xs font-semibold leading-tight truncate transition-colors duration-300',
                        status === 'active'
                          ? 'text-accent-lavender'
                          : status === 'done'
                          ? 'text-text-secondary'
                          : 'text-text-muted',
                      ].join(' ')}
                    >
                      {step.label}
                    </p>
                    <p
                      className={[
                        'text-[10px] md:text-[11px] font-medium mt-0.5 leading-tight transition-colors duration-300',
                        status === 'done' ? 'text-accent-lavender/80' : 'text-text-muted/60',
                      ].join(' ')}
                    >
                      {status === 'done' ? 'Complete' : status === 'active' ? 'In progress' : ''}
                    </p>
                  </div>
                </div>

                {!isLast && (
                  <div
                    aria-hidden="true"
                    className="hidden sm:block absolute top-[22px] md:top-6 left-[calc(100%-8px)] md:left-[calc(100%-12px)] -translate-x-1/2 w-full h-0.5 rounded-full overflow-hidden"
                  >
                    <div
                      className={[
                        'absolute inset-0 transition-all duration-500',
                        status === 'done'
                          ? 'bg-gradient-to-r from-accent-lavender/70 via-accent-cyan/60 to-accent-lavender/70'
                          : 'bg-surface-border/70',
                      ].join(' ')}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="min-h-[480px] animate-fade-in">
        <Outlet />
      </div>
    </div>
  );
}

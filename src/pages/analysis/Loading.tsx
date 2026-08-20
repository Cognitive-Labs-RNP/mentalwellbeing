import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Loader2, Sparkles, Waves } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

const LOADING_MESSAGES = [
  'Reading your summary...',
  'Matching patterns...',
  'Finding the right support steps...',
  'Almost ready...',
];

export default function AnalysisLoading() {
  const navigate = useNavigate();
  const [messageIdx, setMessageIdx] = useState(0);
  const [progress, setProgress] = useState(10);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const msgInterval = setInterval(() => {
      setMessageIdx((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 12 + 3;
        return Math.min(next, 97);
      });
    }, 280);

    const navigateTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => navigate('/analysis/result'), 350);
    }, 3500);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  const currentMessage = LOADING_MESSAGES[messageIdx];

  return (
    <div className="min-h-[520px] flex items-center justify-center py-6 animate-fade-in">
      <Card className="w-full max-w-md mx-auto shadow-[0_0_60px_rgba(167,139,250,0.12)]">
        <div className="p-8 md:p-10 space-y-8 text-center relative overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute -top-32 -left-16 w-64 h-64 rounded-full bg-gradient-to-br from-accent-lavender/20 to-transparent blur-3xl pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-32 -right-16 w-72 h-72 rounded-full bg-gradient-to-tr from-accent-cyan/15 to-transparent blur-3xl pointer-events-none"
          />

          <div className="relative z-10 space-y-6">
            <div className="relative mx-auto w-28 h-28 md:w-32 md:h-32 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-lavender/30 via-purple-500/20 to-accent-cyan/20 animate-pulse" />
              <div className="absolute inset-2 rounded-full border border-accent-lavender/30 border-dashed animate-[spin_8s_linear_infinite]" />
              <div className="absolute inset-5 rounded-full bg-surface/80 backdrop-blur-xl border border-surface-border/70 flex items-center justify-center shadow-glass">
                <Brain
                  className="w-10 h-10 md:w-12 md:h-12 text-accent-lavender"
                  strokeWidth={1.6}
                />
                <Loader2 className="absolute top-1.5 right-1.5 w-5 h-5 md:w-6 md:h-6 text-accent-cyan animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-xl md:text-2xl font-bold text-text-primary">
                Analysing your check-in
              </h3>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                Running pattern detection locally where possible. Your data remains private.
              </p>
            </div>

            <div className="space-y-5 pt-2">
              <div className="space-y-3">
                <ProgressBar value={progress} showPercentage />
              </div>

              <div
                className="min-h-[52px] flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-surface-hover/40 border border-surface-border/60 backdrop-blur-sm"
                aria-live="polite"
              >
                <Waves className="w-5 h-5 md:w-5.5 md:h-5.5 text-accent-lavender flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-medium text-text-primary text-left truncate transition-all duration-300">
                    {currentMessage}
                  </p>
                </div>
                <div className="flex items-end gap-1 h-5 flex-shrink-0">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1 bg-gradient-to-t from-accent-lavender to-accent-cyan rounded-full animate-[pulse_1.1s_ease-in-out_infinite]"
                      style={{
                        height: `${12 + i * 6}px`,
                        animationDelay: `${i * 160}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-lavender/10 text-accent-lavender text-xs font-semibold border border-accent-lavender/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  Pattern engine
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-cyan/10 text-accent-cyan text-xs font-semibold border border-accent-cyan/20">
                  Privacy-first
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

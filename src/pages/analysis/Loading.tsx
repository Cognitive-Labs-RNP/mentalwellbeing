import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Loader2, Sparkles, Waves, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store';

const LOADING_MESSAGES = [
  'Applying privacy filter & sanitising text...',
  'Extracting mental health signals...',
  'Connecting to AI Engine...',
  'Matching behavioral patterns...',
  'Preparing your custom workspace...',
];

export default function AnalysisLoading() {
  const navigate = useNavigate();
  const currentAnalysisInput = useAppStore((s) => s.currentAnalysisInput);
  const isAnalysing = useAppStore((s) => s.isAnalysing);
  const analysisError = useAppStore((s) => s.analysisError);
  const currentAnalysisResult = useAppStore((s) => s.currentAnalysisResult);
  const runAnalysisPipeline = useAppStore((s) => s.runAnalysisPipeline);

  const [messageIdx, setMessageIdx] = useState(0);
  const [progress, setProgress] = useState(15);
  const executedRef = useRef(false);

  // Execute real AI analysis pipeline when component mounts
  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    if (!currentAnalysisInput.trim()) {
      navigate('/analysis/input');
      return;
    }

    const run = async () => {
      const success = await runAnalysisPipeline();
      if (success) {
        setProgress(100);
        setTimeout(() => navigate('/analysis/result'), 400);
      }
    };

    run();
  }, [currentAnalysisInput, runAnalysisPipeline, navigate]);

  // Loading message animation ticks
  useEffect(() => {
    if (!isAnalysing) return;
    const msgInterval = setInterval(() => {
      setMessageIdx((prev) => Math.min(prev + 1, LOADING_MESSAGES.length - 1));
    }, 1800);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 10 + 4, 95));
    }, 350);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, [isAnalysing]);

  const handleRetry = async () => {
    executedRef.current = false;
    setProgress(15);
    setMessageIdx(0);
    const success = await runAnalysisPipeline();
    if (success) {
      setProgress(100);
      setTimeout(() => navigate('/analysis/result'), 400);
    }
  };

  // ERROR STATE: Show error message if API or analysis fails (never leave spinner spinning)
  if (analysisError && !isAnalysing) {
    return (
      <div className="min-h-[480px] flex items-center justify-center py-6 animate-fade-in">
        <Card className="w-full max-w-lg border-accent-amber/30 bg-surface/90 shadow-glass">
          <CardContent className="p-8 space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent-rose/15 border border-accent-rose/30 flex items-center justify-center mx-auto text-accent-rose">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-text-primary">Analysis Request Failed</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {analysisError.message || 'An error occurred while contacting the AI service.'}
              </p>
              <div className="inline-block mt-2 px-3 py-1 rounded-lg bg-surface-hover border border-surface-border text-xs font-mono text-text-muted">
                Error Code: {analysisError.code}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="ghost" size="md" onClick={() => navigate('/analysis/input')}>
                <ArrowLeft className="w-4 h-4" />
                Edit Check-in Text
              </Button>

              <Button variant="primary" size="md" onClick={handleRetry}>
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // LOADING STATE
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
                Processing sanitized extraction with real AI model...
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
                    {LOADING_MESSAGES[messageIdx]}
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
                  Real AI Model
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-cyan/10 text-accent-cyan text-xs font-semibold border border-accent-cyan/20">
                  Privacy-filtered
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

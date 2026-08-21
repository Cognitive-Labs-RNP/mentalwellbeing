import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  History,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store';

const RECENT_HISTORY = [
  { text: 'Low energy · work stress', tag: '3 days ago', variant: 'cyan' as const },
  { text: 'Tense sleep · focus trouble', tag: '1 week ago', variant: 'lavender' as const },
  { text: 'Restless · anxious thoughts', tag: '2 weeks ago', variant: 'amber' as const },
];

export default function AnalysisInput() {
  const navigate = useNavigate();
  const currentAnalysisInput = useAppStore((s) => s.currentAnalysisInput);
  const setAnalysisInput = useAppStore((s) => s.setAnalysisInput);
  const clearAnalysisSession = useAppStore((s) => s.clearAnalysisSession);

  const [content, setContent] = useState(currentAnalysisInput);
  const [isRecording, setIsRecording] = useState(false);

  // Keep store in sync when content changes
  useEffect(() => {
    setContent(currentAnalysisInput);
  }, [currentAnalysisInput]);

  const handleChange = (val: string) => {
    setContent(val);
    setAnalysisInput(val);
  };

  const handleClear = () => {
    setContent('');
    clearAnalysisSession();
  };

  const handleNext = () => {
    if (!content.trim()) return;
    setAnalysisInput(content.trim());
    navigate('/analysis/privacy-review');
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="space-y-2">
        <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-accent-lavender" strokeWidth={1.9} />
          Share how you're feeling
        </h2>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          Write freely. A few sentences is plenty — there's no test, score, or "correct" way.
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-text-primary">
                Today's check-in
              </h3>
              <p className="text-sm text-text-secondary mt-0.5">
                Describe your mood, thoughts, energy, and what's been on your mind.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {content.trim() && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-text-muted hover:text-red-400 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg bg-surface-hover/50"
                  title="Clear input and reset analysis"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
              <div className="flex items-center gap-1.5 text-xs font-medium text-text-muted">
                <History className="w-3.5 h-3.5" />
                Private by default
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => handleChange(e.target.value)}
              rows={8}
              placeholder='Example: "I have been feeling anxious for the last few days, worrying constantly about upcoming presentations. My stomach feels restless and I struggle to relax..."'
              className="w-full px-4 py-4 text-sm md:text-base leading-relaxed rounded-2xl bg-bg-primary/60 border border-surface-border/70 text-text-primary placeholder:text-text-muted/70 resize-vertical min-h-[180px] focus:outline-none focus:border-accent-lavender/60 focus:ring-2 focus:ring-accent-lavender/20 transition-all duration-200 pr-16"
              aria-label="Share how you're feeling"
            />

            <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsRecording((v) => !v)}
                aria-label={isRecording ? 'Stop voice input' : 'Start voice input'}
                className={[
                  'w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 border backdrop-blur-sm',
                  isRecording
                    ? 'bg-accent-rose/20 border-accent-rose/40 text-accent-rose shadow-[0_0_18px_rgba(248,113,113,0.25)] animate-pulse'
                    : 'bg-surface-hover/60 border-surface-border/70 text-text-secondary hover:bg-surface-hover hover:text-accent-lavender hover:border-accent-lavender/40',
                ].join(' ')}
              >
                <Mic className="w-5 h-5" strokeWidth={isRecording ? 2.3 : 1.9} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-text-muted font-medium">
              <span className="tabular-nums text-text-secondary">{wordCount}</span>
              <span>words</span>
              <span className="text-surface-border/80 mx-1">·</span>
              <span className="tabular-nums">{content.length}</span>
              <span>characters</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <span
                className={[
                  'w-1.5 h-1.5 rounded-full',
                  content.trim() ? 'bg-accent-green' : 'bg-surface-border',
                ].join(' ')}
              />
              Saved locally
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-accent-cyan/10 via-accent-lavender/10 to-accent-cyan/10 border border-accent-lavender/20 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent-lavender/20 border border-accent-lavender/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-accent-lavender" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <p className="text-sm font-semibold text-text-primary">
                  Everything you write stays on your device.
                </p>
                <p className="text-xs leading-relaxed text-text-secondary">
                  A privacy filter removes personal details (names, places, identifiers) before
                  anything leaves your app. Only the sanitised summary is sent.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-text-muted" strokeWidth={1.8} />
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Recent check-ins
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {RECENT_HISTORY.map((item) => (
                <Tag key={item.text} variant={item.variant} size="md" className="gap-2">
                  <span>{item.text}</span>
                  <span className="opacity-70 font-mono text-[10px] uppercase tracking-wide">
                    {item.tag}
                  </span>
                </Tag>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 flex-wrap">
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
              disabled={!content.trim()}
              className="min-w-[220px]"
            >
              Review what will be sent
              <ChevronRight className="w-5 h-5" strokeWidth={2.1} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

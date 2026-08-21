import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ShieldCheck, Eye, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PrivacyReviewPanel, StructuredSummary } from '@/components/ui/PrivacyReviewPanel';
import { useAppStore } from '@/store';
import { filterPii } from '@/services/privacyFilter';
import { extractStructuredData } from '@/services/localExtractor';

export default function AnalysisPrivacyReview() {
  const navigate = useNavigate();
  const currentAnalysisInput = useAppStore((s) => s.currentAnalysisInput);

  // Compute real privacy filter & extraction from the active user input
  const privacyResult = useMemo(() => {
    if (!currentAnalysisInput.trim()) return null;
    const filter = filterPii(currentAnalysisInput);
    const extraction = extractStructuredData(filter.sanitisedText, filter.detectedCategories);

    // Derive numerical scores from severity and symptoms for the PrivacyReviewPanel display
    const moodScore = extraction.severity === 'severe' ? 2 : extraction.severity === 'high' ? 3 : extraction.severity === 'moderate' ? 5 : 7;
    const stressScore = extraction.severity === 'severe' ? 9 : extraction.severity === 'high' ? 8 : extraction.severity === 'moderate' ? 6 : 4;
    const energyScore = (extraction.symptoms.includes('fatigue') || extraction.symptoms.includes('low energy')) ? 3 : 6;

    const contextTags = Array.from(new Set([...extraction.trigger, ...extraction.impact]));

    const summary: StructuredSummary = {
      mood: moodScore,
      stress: stressScore,
      energy: energyScore,
      contextTags,
      sanitisedDescription: filter.sanitisedText,
    };

    return { filter, extraction, summary };
  }, [currentAnalysisInput]);

  if (!currentAnalysisInput.trim() || !privacyResult) {
    return (
      <div className="p-8 text-center space-y-4 bg-surface/80 rounded-2xl border border-surface-border">
        <AlertCircle className="w-10 h-10 text-accent-amber mx-auto" />
        <h3 className="text-lg font-bold text-text-primary">No Check-in Text Provided</h3>
        <p className="text-sm text-text-secondary">Please enter your check-in text first before reviewing privacy settings.</p>
        <Button variant="primary" size="md" onClick={() => navigate('/analysis/input')}>
          <ArrowLeft className="w-4 h-4" />
          Go to Input
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-lavender/30 to-purple-500/20 border border-accent-lavender/30 flex items-center justify-center">
            <ShieldCheck className="w-5.5 h-5.5 text-accent-lavender" strokeWidth={2} />
          </div>
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary">
              Privacy review
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Here's what will be sent to the AI. All personal details have been removed.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 pl-0.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-cyan/12 text-accent-cyan text-xs font-semibold border border-accent-cyan/25">
            <Eye className="w-3.5 h-3.5" />
            Transparent
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-green/12 text-accent-green text-xs font-semibold border border-accent-green/25">
            No personal data
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-lavender/12 text-accent-lavender text-xs font-semibold border border-accent-lavender/25">
            <ShieldCheck className="w-3.5 h-3.5" />
            Privacy filter applied
          </span>
        </div>
      </div>

      <PrivacyReviewPanel
        structuredSummary={privacyResult.summary}
        onCancel={() => navigate('/analysis/input')}
        onConfirm={() => navigate('/analysis/loading')}
      />

      <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
        <Button
          variant="ghost"
          size="md"
          onClick={() => navigate('/analysis/input')}
          className="min-w-[140px]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to edit
        </Button>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/analysis/loading')}
          className="min-w-[200px]"
        >
          <Send className="w-4.5 h-4.5" />
          Send for analysis
        </Button>
      </div>
    </div>
  );
}

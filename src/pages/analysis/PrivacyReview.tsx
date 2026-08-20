import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ShieldCheck, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PrivacyReviewPanel, StructuredSummary } from '@/components/ui/PrivacyReviewPanel';

const MOCK_SUMMARY: StructuredSummary = {
  mood: 5,
  stress: 6,
  energy: 4,
  contextTags: ['work', 'sleep', 'relationships'],
  sanitisedDescription:
    "Feeling somewhat tense and moderately low energy today. Experiencing difficulty with focus at [REDACTED] and restless [REDACTED].",
};

export default function AnalysisPrivacyReview() {
  const navigate = useNavigate();

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
        structuredSummary={MOCK_SUMMARY}
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
          <ArrowLeft className="w-4.5 h-4.5" />
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

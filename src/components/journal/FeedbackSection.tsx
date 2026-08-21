import { useState, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  Clock,
  ChevronRight,
  Smile,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import { MoodSlider } from '../ui/MoodSlider';
import { saveJournalFeedback, computeBeforeAfterClusters } from '../../services/journalService';
import type { JournalActivityEvent, FeedbackSubmission, FeedbackStatus } from '../../types/journal';

interface FeedbackSectionProps {
  userId: string;
  events: JournalActivityEvent[];
  onFeedbackSaved: (newEvent: JournalActivityEvent) => void;
}

const EMOJI_OPTIONS = [
  { emoji: '😞', label: 'Much Worse' },
  { emoji: '😕', label: 'Worse' },
  { emoji: '😐', label: 'Same' },
  { emoji: '🙂', label: 'Better' },
  { emoji: '😄', label: 'Much Better' },
];

export function FeedbackSection({ userId, events, onFeedbackSaved }: FeedbackSectionProps) {
  const [beforeIntensity, setBeforeIntensity] = useState<number>(8);
  const [afterIntensity, setAfterIntensity] = useState<number>(5);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('🙂');
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<boolean>(false);

  // Deterministic calculation
  const improvement = beforeIntensity - afterIntensity;
  const status: FeedbackStatus =
    improvement > 0 ? 'Improved' : improvement === 0 ? 'No significant change' : 'Worsened';

  // Compute preceding activity clusters for historical feedback entries
  const clusters = useMemo(() => computeBeforeAfterClusters(events), [events]);

  const handleApplyEmoji = (emojiObj: { emoji: string; label: string }, idx: number) => {
    setSelectedEmoji(emojiObj.emoji);
    // Quick preset after intensity based on emoji selection
    if (idx === 0) setAfterIntensity(Math.min(10, beforeIntensity + 2)); // Much worse
    else if (idx === 1) setAfterIntensity(Math.min(10, beforeIntensity + 1)); // Worse
    else if (idx === 2) setAfterIntensity(beforeIntensity); // Same
    else if (idx === 3) setAfterIntensity(Math.max(1, beforeIntensity - 2)); // Better
    else if (idx === 4) setAfterIntensity(Math.max(1, Math.floor(beforeIntensity / 2))); // Much better
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload: FeedbackSubmission = {
      beforeIntensity,
      afterIntensity,
      currentFeeling: selectedEmoji,
      comment: comment.trim() || undefined,
    };

    const newEvt = await saveJournalFeedback(userId, payload);
    setSubmitting(false);

    if (newEvt) {
      setSuccessMessage(true);
      onFeedbackSaved(newEvt);
      setComment('');
      setTimeout(() => setSuccessMessage(false), 4000);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION HEADER */}
      <div className="space-y-1">
        <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
          <MessageSquare className="w-6 h-6 text-accent-cyan" />
          Feedback &amp; Relief Assessment
        </h2>
        <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
          Record how you feel before and after using relief activities or global tools.
        </p>
      </div>

      {/* NEW FEEDBACK FORM CARD */}
      <Card className="overflow-hidden border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/10 via-surface/80 to-accent-lavender/10 shadow-glass">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-accent-cyan" />
                Record Activity Feedback
              </CardTitle>
              <CardDescription className="text-xs">
                Deterministic before/after intensity comparison. No AI estimation used.
              </CardDescription>
            </div>
            <Tag variant="cyan" size="sm">
              Live Calculation
            </Tag>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Quick Emoji Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary">
                How do you feel right now?
              </label>
              <div className="grid grid-cols-5 gap-2 p-2 rounded-2xl bg-surface-hover/30 border border-surface-border">
                {EMOJI_OPTIONS.map((opt, idx) => {
                  const isSelected = selectedEmoji === opt.emoji;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleApplyEmoji(opt, idx)}
                      className={[
                        'flex flex-col items-center justify-center p-2.5 rounded-xl transition-all',
                        isSelected
                          ? 'bg-gradient-to-br from-accent-cyan/30 to-accent-lavender/20 border border-accent-cyan scale-105 shadow-glow'
                          : 'bg-surface/50 border border-transparent hover:bg-surface-hover hover:border-surface-border',
                      ].join(' ')}
                    >
                      <span className="text-2xl mb-1">{opt.emoji}</span>
                      <span className="text-[10px] font-medium text-text-secondary truncate max-w-full">
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sliders: Before & After Intensity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before Slider */}
              <div className="p-4 rounded-2xl bg-surface/60 border border-surface-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    1. Before Activity Intensity
                  </span>
                  <span className="font-mono text-sm font-bold text-accent-lavender">
                    {beforeIntensity}/10
                  </span>
                </div>
                <MoodSlider
                  label="Intensity Level"
                  value={beforeIntensity}
                  onChange={setBeforeIntensity}
                />
              </div>

              {/* After Slider */}
              <div className="p-4 rounded-2xl bg-surface/60 border border-surface-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    2. After Activity Intensity
                  </span>
                  <span className="font-mono text-sm font-bold text-accent-cyan">
                    {afterIntensity}/10
                  </span>
                </div>
                <MoodSlider
                  label="Intensity Level"
                  value={afterIntensity}
                  onChange={setAfterIntensity}
                />
              </div>
            </div>

            {/* Deterministic Outcome Summary Box */}
            <div className="p-4 rounded-2xl bg-bg-primary/60 border border-surface-border/80 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    status === 'Improved'
                      ? 'bg-accent-green/20 border-accent-green/40 text-accent-green'
                      : status === 'Worsened'
                      ? 'bg-accent-rose/20 border-accent-rose/40 text-accent-rose'
                      : 'bg-accent-amber/20 border-accent-amber/40 text-accent-amber'
                  }`}
                >
                  {status === 'Improved' ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : status === 'Worsened' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <Minus className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Calculated Result
                  </div>
                  <div className="font-display text-sm font-bold text-text-primary">
                    Before: {beforeIntensity}/10 → After: {afterIntensity}/10 (
                    <span
                      className={
                        status === 'Improved'
                          ? 'text-accent-green'
                          : status === 'Worsened'
                          ? 'text-accent-rose'
                          : 'text-accent-amber'
                      }
                    >
                      {status}
                    </span>
                    )
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-text-muted">
                Change:{' '}
                <span className="font-bold text-text-primary">
                  {improvement > 0 ? `-${improvement} pts` : improvement < 0 ? `+${Math.abs(improvement)} pts` : '0 pts'}
                </span>
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label
                htmlFor="feedback-comment"
                className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
              >
                Optional Reflections / Note
              </label>
              <textarea
                id="feedback-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="What activities helped most? Any observations on your current state..."
                className="w-full px-4 py-3 rounded-xl bg-bg-primary/50 border border-surface-border text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/60 focus:ring-2 focus:ring-accent-cyan/25 resize-y"
              />
            </div>

            {/* Submit Button & Toast */}
            <div className="flex items-center justify-between gap-4 pt-2">
              {successMessage ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-accent-green animate-pulse">
                  <CheckCircle2 className="w-4 h-4" />
                  Feedback record saved successfully to Supabase!
                </div>
              ) : (
                <span className="text-xs text-text-muted">
                  Preserved permanently in your private database account.
                </span>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={submitting}
                className="min-w-[160px] shadow-glow"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Saving...' : 'Submit Feedback'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* HISTORICAL FEEDBACK & CONNECTED ACTIVITIES CLUSTERS */}
      {clusters.length > 0 && (
        <Card className="border-surface-border/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-text-primary flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-accent-lavender" />
                Before/After Activity Relationships
              </CardTitle>
              <Tag variant="lavender" size="sm">
                {clusters.length} Record{clusters.length > 1 ? 's' : ''}
              </Tag>
            </div>
            <CardDescription className="text-xs">
              Activities completed prior to each feedback measurement.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {clusters.map((cluster) => (
              <div
                key={cluster.feedbackId}
                className="p-4 rounded-2xl bg-surface-hover/30 border border-surface-border space-y-3"
              >
                {/* Cluster Header */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{cluster.currentFeeling}</span>
                    <span className="font-display text-sm font-bold text-text-primary">
                      {cluster.relatedCondition ? `${cluster.relatedCondition} Session` : 'Wellbeing Session'}
                    </span>
                    <span className="text-xs font-mono text-text-muted">
                      {new Date(cluster.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <Tag
                    variant={
                      cluster.status === 'Improved'
                        ? 'green'
                        : cluster.status === 'Worsened'
                        ? 'amber'
                        : 'cyan'
                    }
                    size="sm"
                  >
                    Before: {cluster.beforeIntensity}/10 → After: {cluster.afterIntensity}/10 ({cluster.status})
                  </Tag>
                </div>

                {/* Flow Diagram of Preceding Activities */}
                {cluster.precedingActivities.length > 0 ? (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <span className="font-semibold text-text-muted flex-shrink-0">
                      Before ({cluster.beforeIntensity}/10)
                    </span>
                    {cluster.precedingActivities.map((act) => (
                      <div key={act.id} className="flex items-center gap-1.5 flex-shrink-0">
                        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                        <span className="px-2.5 py-1 rounded-xl bg-surface border border-surface-border text-text-secondary font-medium">
                          {act.subtitle || act.title}
                        </span>
                      </div>
                    ))}
                    <ChevronRight className="w-3.5 h-3.5 text-accent-green flex-shrink-0" />
                    <span className="font-bold text-accent-green flex-shrink-0">
                      After ({cluster.afterIntensity}/10)
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-text-muted">
                    No specific activities recorded immediately prior to this feedback.
                  </div>
                )}

                {/* Neutral Summary Statement */}
                <div className="p-3 rounded-xl bg-bg-primary/40 border border-surface-border/60 text-xs text-text-secondary leading-relaxed">
                  {cluster.summaryText}
                </div>

                {cluster.comment && (
                  <p className="text-xs text-text-muted italic">"{cluster.comment}"</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

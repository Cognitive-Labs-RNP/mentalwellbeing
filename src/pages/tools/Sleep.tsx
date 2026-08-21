import { useState, useEffect } from 'react';
import { Moon, Star, Clock, Send, History, Check, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store';
import { saveSleepRecord, fetchToolHistory, SavedToolRecord } from '@/services/toolService';
import type { MoodScore } from '@/types';

/**
 * Calculate duration in hours between bedtime (e.g. "23:00") and wake time (e.g. "07:30")
 */
function calculateSleepDuration(bedtime: string, wakeTime: string): number {
  if (!bedtime || !wakeTime) return 8.0;

  const [bHour, bMin] = bedtime.split(':').map(Number);
  const [wHour, wMin] = wakeTime.split(':').map(Number);

  let bMinutes = bHour * 60 + bMin;
  let wMinutes = wHour * 60 + wMin;

  if (wMinutes <= bMinutes) {
    wMinutes += 24 * 60; // Slept overnight past midnight
  }

  const diffMinutes = wMinutes - bMinutes;
  return Number((diffMinutes / 60).toFixed(1));
}

export default function Sleep() {
  const session = useAppStore((s) => s.session);
  const logSleepStore = useAppStore((s) => s.logSleep);

  const [bedtime, setBedtime] = useState<string>('23:00');
  const [wakeTime, setWakeTime] = useState<string>('07:30');
  const [qualityScore, setQualityScore] = useState<number>(4);
  const [awakeningsCount, setAwakeningsCount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<SavedToolRecord[]>([]);

  const userId = session?.userId ?? 'demo-user-id';

  const durationHours = calculateSleepDuration(bedtime, wakeTime);

  useEffect(() => {
    fetchToolHistory(userId, 'sleep').then(setHistory);
  }, [userId, saveSuccess]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);

    // Update Zustand store locally
    logSleepStore({
      id: `sleep-${Date.now()}`,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
      hoursSlept: durationHours,
      quality: Math.min(5, Math.max(1, qualityScore * 2)) as MoodScore,
      awakenings: awakeningsCount,
    });

    // Sync to Supabase
    await saveSleepRecord(userId, bedtime, wakeTime, durationHours, qualityScore, awakeningsCount, notes);

    setIsSubmitting(false);
    setSaveSuccess(true);
    setNotes('');

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
          <Moon className="w-6 h-6 text-accent-lavender" strokeWidth={2} />
          Sleep Tracker
        </h2>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          Record your sleep timing, calculate sleep duration, and monitor rest quality over time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Last Night's Sleep Entry</CardTitle>
          <CardDescription>Log bedtime, wake time, quality rating, and awakenings.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Bedtime & Wake Time Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-surface-hover/30 border border-surface-border space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-accent-lavender" />
                Bedtime
              </label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-semibold text-text-primary focus:outline-none focus:border-accent-lavender/60"
              />
            </div>

            <div className="p-4 rounded-2xl bg-surface-hover/30 border border-surface-border space-y-2">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-accent-cyan" />
                Wake Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-semibold text-text-primary focus:outline-none focus:border-accent-lavender/60"
              />
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-accent-lavender/10 via-surface-hover/30 to-accent-cyan/10 border border-accent-lavender/25 flex flex-col justify-center space-y-1">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Calculated Sleep Duration</span>
              <span className="font-display text-2xl font-bold text-accent-lavender tabular-nums">
                {durationHours} Hours
              </span>
            </div>
          </div>

          {/* Quality Rating (1–5 Stars) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Sleep Quality Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setQualityScore(star)}
                  className={[
                    'p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold',
                    qualityScore >= star
                      ? 'bg-accent-amber/20 border-accent-amber text-accent-amber shadow-sm'
                      : 'bg-surface-hover/30 border-surface-border text-text-muted hover:text-text-secondary',
                  ].join(' ')}
                >
                  <Star className="w-4 h-4 fill-current" />
                  {star}
                </button>
              ))}
            </div>
          </div>

          {/* Awakenings Count */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Night Awakenings
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAwakeningsCount((prev) => Math.max(0, prev - 1))}
                className="w-10 h-10 rounded-xl bg-surface-hover border border-surface-border font-bold text-text-primary text-base"
              >
                -
              </button>
              <span className="font-display text-lg font-bold text-text-primary w-8 text-center tabular-nums">
                {awakeningsCount}
              </span>
              <button
                type="button"
                onClick={() => setAwakeningsCount((prev) => prev + 1)}
                className="w-10 h-10 rounded-xl bg-surface-hover border border-surface-border font-bold text-text-primary text-base"
              >
                +
              </button>
              <span className="text-xs text-text-muted">times woken up during night</span>
            </div>
          </div>

          {/* Additional deterministic suggestion */}
          <div className="p-4 rounded-2xl bg-accent-lavender/10 border border-accent-lavender/25 flex items-start gap-3 text-xs text-text-secondary">
            <AlertCircle className="w-5 h-5 text-accent-lavender flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-text-primary mb-0.5">
                Sleep Suggestion
              </span>
              {durationHours < 7
                ? 'Your calculated sleep duration is below the general 7–9 hour adult reference range. Consider protecting a little more time for rest when possible.'
                : durationHours > 9
                ? 'Your calculated sleep duration is above the general 7–9 hour adult reference range. Notice how your energy feels and keep your sleep schedule consistent.'
                : qualityScore <= 2 || awakeningsCount >= 3
                ? 'Your duration is within the general reference range, but your quality or awakenings suggest tracking your evening routine and how rested you feel.'
                : 'Your duration is within the general 7–9 hour adult reference range. Keep noticing which routines help you rest well.'}
              <p className="text-[11px] text-text-muted pt-1">This is general sleep information, not a diagnosis or treatment recommendation.</p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Optional Sleep Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Drank tea before bed, woke up feeling refreshed..."
              className="w-full px-4 py-3 rounded-xl bg-bg-primary/60 border border-surface-border text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-lavender/60"
            />
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <ShieldCheck className="w-4 h-4 text-accent-green" />
              Saved to your private history
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[160px]"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-accent-green" />
                  Saved Sleep Record!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Save Sleep Record
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Log */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="w-4.5 h-4.5 text-accent-lavender" />
              <CardTitle className="text-base">Sleep History Log</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((rec) => {
              const meta = rec.metadata as {
                bedtime?: string;
                wake_time?: string;
                sleep_quality?: number;
                awakenings_count?: number;
                notes?: string;
              };
              return (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-surface-hover/30 border border-surface-border flex items-start justify-between gap-4 flex-wrap"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag variant="lavender" size="sm">
                        Duration: {rec.value} hrs
                      </Tag>
                      <Tag variant="amber" size="sm">
                        Quality: {meta.sleep_quality ?? 0} / 5 ★
                      </Tag>
                      {meta.bedtime && meta.wake_time && (
                        <span className="text-xs text-text-muted">
                          {meta.bedtime} → {meta.wake_time}
                        </span>
                      )}
                    </div>
                    {meta.awakenings_count !== undefined && (
                      <p className="text-xs text-text-secondary">
                        Night Awakenings: {meta.awakenings_count}
                      </p>
                    )}
                    {meta.notes && <p className="text-xs text-text-muted italic">"{meta.notes}"</p>}
                  </div>

                  <span className="text-[11px] font-mono text-text-muted">
                    {new Date(rec.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

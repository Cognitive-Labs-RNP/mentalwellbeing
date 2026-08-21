import { useState, useEffect } from 'react';
import { Heart, Sparkles, Send, History, Check, ShieldCheck, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store';
import { saveMoodRecord, fetchToolHistory, SavedToolRecord } from '@/services/toolService';
import type { MoodScore } from '@/types';

const EMOTION_OPTIONS = [
  'Anxious', 'Calm', 'Tired', 'Stressed', 'Happy',
  'Frustrated', 'Overwhelmed', 'Focused', 'Peaceful', 'Restless', 'Grateful'
];

export default function MoodCheck() {
  const session = useAppStore((s) => s.session);
  const logMoodCheckStore = useAppStore((s) => s.logMoodCheck);

  const [moodScore, setMoodScore] = useState<number>(6);
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>(['Calm']);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<SavedToolRecord[]>([]);

  const userId = session?.userId ?? 'demo-user-id';

  useEffect(() => {
    fetchToolHistory(userId, 'mood_check').then(setHistory);
  }, [userId, saveSuccess]);

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emotion) ? prev.filter((e) => e !== emotion) : [...prev, emotion]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);

    // Update Zustand store locally
    logMoodCheckStore({
      id: `mood-${Date.now()}`,
      timestamp: new Date().toISOString(),
      mood: moodScore as MoodScore,
      stress: moodScore as MoodScore,
      energy: moodScore as MoodScore,
      note: note.trim() || undefined,
    });

    // Sync to Supabase
    await saveMoodRecord(userId, moodScore, intensity, selectedEmotions, note);

    setIsSubmitting(false);
    setSaveSuccess(true);
    setNote('');

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
          <Heart className="w-6 h-6 text-accent-rose" strokeWidth={2} />
          Mood Check
        </h2>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          Record your current emotional state. Every entry is private, timestamped, and stored securely.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How are you feeling right now?</CardTitle>
          <CardDescription>Select a mood score from 1 (very low) to 10 (excellent).</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mood Slider & Score Display */}
          <div className="p-6 rounded-2xl bg-surface-hover/30 border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-secondary">Mood Score</span>
              <span className="font-display text-2xl font-bold text-accent-lavender tabular-nums">
                {moodScore} / 10
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={10}
              value={moodScore}
              onChange={(e) => setMoodScore(Number(e.target.value))}
              className="w-full h-2.5 bg-surface-border rounded-lg appearance-none cursor-pointer accent-accent-lavender"
            />

            <div className="flex justify-between text-xs text-text-muted font-medium">
              <span>1 - Very Low</span>
              <span>5 - Neutral</span>
              <span>10 - Excellent</span>
            </div>
          </div>

          {/* Intensity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Emotional Intensity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'moderate', 'high'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setIntensity(lvl)}
                  className={[
                    'py-2.5 px-3 rounded-xl text-xs font-semibold capitalize transition-all border',
                    intensity === lvl
                      ? 'bg-accent-lavender/20 border-accent-lavender text-accent-lavender shadow-sm'
                      : 'bg-surface-hover/40 border-surface-border text-text-secondary hover:text-text-primary',
                  ].join(' ')}
                >
                  {lvl} Intensity
                </button>
              ))}
            </div>
          </div>

          {/* Selectable Emotion Chips */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Select Emotions (Select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOTION_OPTIONS.map((emotion) => {
                const active = selectedEmotions.includes(emotion);
                return (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => toggleEmotion(emotion)}
                    className={[
                      'px-3 py-1.5 rounded-xl text-xs font-medium transition-all border flex items-center gap-1.5',
                      active
                        ? 'bg-accent-cyan/20 border-accent-cyan text-accent-cyan shadow-sm'
                        : 'bg-surface-hover/30 border-surface-border text-text-secondary hover:bg-surface-hover',
                    ].join(' ')}
                  >
                    {active && <Check className="w-3 h-3" />}
                    {emotion}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Short Note Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Optional Reflections or Notes
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What factors contributed to how you feel right now? (Optional)"
              className="w-full px-4 py-3 rounded-xl bg-bg-primary/60 border border-surface-border text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-accent-lavender/60"
            />
          </div>

          {/* Additional deterministic suggestion */}
          <div className="p-4 rounded-2xl bg-accent-rose/10 border border-accent-rose/25 flex items-start gap-3 text-xs text-text-secondary">
            <Info className="w-5 h-5 text-accent-rose flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-text-primary mb-0.5">
                Gentle Check-In Suggestion
              </span>
              {moodScore <= 3
                ? 'Consider taking one small calming step, such as slowing your breathing or reaching out to someone you trust.'
                : moodScore <= 6
                ? 'A short pause, some water, or a brief change of environment may help you check in with what you need next.'
                : 'Notice what is supporting your wellbeing today and consider carrying one helpful habit forward.'}
              <p className="text-[11px] text-text-muted pt-1">This is a general wellbeing suggestion, not medical advice.</p>
            </div>
          </div>

          {/* Privacy & Save Actions */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <ShieldCheck className="w-4 h-4 text-accent-green" />
              Saved to your private account
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[150px]"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-accent-green" />
                  Saved!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Save Mood Check
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
              <CardTitle className="text-base">Mood History Log</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((rec) => {
              const meta = rec.metadata as { intensity?: string; emotions?: string[]; note?: string };
              return (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-surface-hover/30 border border-surface-border flex items-start justify-between gap-4 flex-wrap"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Tag variant="lavender" size="sm">
                        Score: {rec.value} / 10
                      </Tag>
                      {meta.intensity && (
                        <span className="text-xs text-text-muted capitalize">
                          · {meta.intensity} intensity
                        </span>
                      )}
                    </div>
                    {meta.emotions && meta.emotions.length > 0 && (
                      <p className="text-xs text-text-secondary">
                        Emotions: {meta.emotions.join(', ')}
                      </p>
                    )}
                    {meta.note && <p className="text-xs text-text-muted italic">"{meta.note}"</p>}
                  </div>

                  <span className="text-[11px] font-mono text-text-muted">
                    {new Date(rec.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
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

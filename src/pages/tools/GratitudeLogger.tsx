import { useState, useEffect } from 'react';
import { Sparkles, Heart, Send, History, Check, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store';
import { saveGratitudeRecord, fetchToolHistory, SavedToolRecord } from '@/services/toolService';

const INTENTION_PRESETS = [
  'Focus on peace',
  'Be gentle with myself',
  'Pace my work and rest',
  'Celebrate small wins',
  'Stay grounded in the present',
];

export default function GratitudeLogger() {
  const session = useAppStore((s) => s.session);

  const [item1, setItem1] = useState('');
  const [item2, setItem2] = useState('');
  const [item3, setItem3] = useState('');
  const [intention, setIntention] = useState('Focus on peace');
  const [moodAfter, setMoodAfter] = useState(8);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<SavedToolRecord[]>([]);

  const userId = session?.userId ?? 'demo-user-id';

  useEffect(() => {
    fetchToolHistory(userId, 'gratitude_log').then(setHistory);
  }, [userId, saveSuccess]);

  const handleSubmit = async () => {
    const items = [item1, item2, item3].map((i) => i.trim()).filter(Boolean);
    if (items.length === 0) return;

    setIsSubmitting(true);
    setSaveSuccess(false);

    await saveGratitudeRecord(userId, items, intention, moodAfter);

    setIsSubmitting(false);
    setSaveSuccess(true);

    setItem1('');
    setItem2('');
    setItem3('');

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-accent-amber" strokeWidth={2} />
          Daily Gratitude & Intention Logger
        </h2>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          Reflect on 3 positive moments from your day and choose a grounding daily intention.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Gratitude & Reflection</CardTitle>
          <CardDescription>
            3 simple things you are grateful for today (no AI processing — stored privately).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 3 Gratitude Input Fields */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              3 Things You're Grateful For Today
            </label>

            <div className="space-y-2">
              <input
                type="text"
                value={item1}
                onChange={(e) => setItem1(e.target.value)}
                placeholder="1. A warm cup of tea, a kind message, a quiet walk..."
                className="w-full px-4 py-3 rounded-xl bg-bg-primary/60 border border-surface-border text-sm text-text-primary focus:outline-none focus:border-accent-amber/60"
              />
              <input
                type="text"
                value={item2}
                onChange={(e) => setItem2(e.target.value)}
                placeholder="2. Something that made you smile or brought comfort..."
                className="w-full px-4 py-3 rounded-xl bg-bg-primary/60 border border-surface-border text-sm text-text-primary focus:outline-none focus:border-accent-amber/60"
              />
              <input
                type="text"
                value={item3}
                onChange={(e) => setItem3(e.target.value)}
                placeholder="3. A small accomplishment or personal strength..."
                className="w-full px-4 py-3 rounded-xl bg-bg-primary/60 border border-surface-border text-sm text-text-primary focus:outline-none focus:border-accent-amber/60"
              />
            </div>
          </div>

          {/* Intention Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
              Daily Intention
            </label>
            <div className="flex flex-wrap gap-2">
              {INTENTION_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setIntention(preset)}
                  className={[
                    'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                    intention === preset
                      ? 'bg-accent-amber/20 border-accent-amber text-accent-amber shadow-sm'
                      : 'bg-surface-hover/40 border-surface-border text-text-secondary hover:text-text-primary',
                  ].join(' ')}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Mood After Reflection */}
          <div className="p-4 rounded-2xl bg-surface-hover/30 border border-surface-border space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span>Mood After Reflection</span>
              <span className="font-bold text-accent-amber tabular-nums">{moodAfter} / 10</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={moodAfter}
              onChange={(e) => setMoodAfter(Number(e.target.value))}
              className="w-full h-2 bg-surface-border rounded-lg appearance-none cursor-pointer accent-accent-amber"
            />
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <ShieldCheck className="w-4 h-4 text-accent-green" />
              Saved to your private account
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isSubmitting || (!item1.trim() && !item2.trim() && !item3.trim())}
              className="min-w-[170px]"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-accent-green" />
                  Saved Entry!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Save Gratitude Entry
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
              <History className="w-4.5 h-4.5 text-accent-amber" />
              <CardTitle className="text-base">Gratitude History Log</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((rec) => {
              const meta = rec.metadata as { items?: string[]; intention?: string; mood_after?: number };
              return (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-surface-hover/30 border border-surface-border flex items-start justify-between gap-4 flex-wrap"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Tag variant="amber" size="sm">
                        Intention: {meta.intention ?? 'Peace'}
                      </Tag>
                      <Tag variant="green" size="sm">
                        Mood After: {meta.mood_after ?? 8} / 10
                      </Tag>
                    </div>
                    {meta.items && meta.items.length > 0 && (
                      <ul className="text-xs text-text-secondary list-disc pl-4 space-y-0.5 pt-1">
                        {meta.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
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

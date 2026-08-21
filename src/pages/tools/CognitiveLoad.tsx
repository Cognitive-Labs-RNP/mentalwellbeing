import { useState, useEffect } from 'react';
import { Cpu, Coffee, Send, History, Check, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store';
import { saveCognitiveLoadRecord, fetchToolHistory, SavedToolRecord } from '@/services/toolService';
import type { MoodScore } from '@/types';

const CAFFEINE_PRESETS = [
  { label: 'Espresso (63mg)', mg: 63 },
  { label: 'Cup of Coffee (95mg)', mg: 95 },
  { label: 'Energy Drink (160mg)', mg: 160 },
  { label: 'Green/Black Tea (47mg)', mg: 47 },
];

export default function CognitiveLoad() {
  const session = useAppStore((s) => s.session);
  const logCognitiveLoadStore = useAppStore((s) => s.logCognitiveLoad);

  const [loadScore, setLoadScore] = useState<number>(5);
  const [caffeineMg, setCaffeineMg] = useState<number>(95);
  const [consumptionTime, setConsumptionTime] = useState<string>('09:00');
  const [weightKg, setWeightKg] = useState<number>(70);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<SavedToolRecord[]>([]);

  const userId = session?.userId ?? 'demo-user-id';

  useEffect(() => {
    fetchToolHistory(userId, 'cognitive_caffeine').then(setHistory);
  }, [userId, saveSuccess]);

  // Deterministic weight-based caffeine calculation (non-AI rule)
  // General healthy limit is ~3.5 mg per kg of body weight, capped at 400 mg max
  const maxRecommendedMg = Math.min(400, Math.round(weightKg * 3.5));
  const isOverLimit = caffeineMg > maxRecommendedMg;

  const guidanceText = isOverLimit
    ? `Your entered caffeine intake (${caffeineMg} mg) exceeds the estimated weight-based daily guideline of ~${maxRecommendedMg} mg for ${weightKg} kg body weight. Consider pacing consumption to prevent jitteriness or sleep disruption.`
    : `Your caffeine intake (${caffeineMg} mg) is within the estimated daily guideline of ~${maxRecommendedMg} mg. Ensure you stay hydrated and avoid caffeine 6 hours before bedtime.`;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);

    // Update Zustand store locally
    logCognitiveLoadStore({
      id: `cognitive-${Date.now()}`,
      timestamp: new Date().toISOString(),
      load: loadScore as MoodScore,
      context: `Caffeine: ${caffeineMg} mg`,
    });

    // Sync to Supabase
    await saveCognitiveLoadRecord(
      userId,
      loadScore,
      caffeineMg,
      consumptionTime,
      weightKg,
      maxRecommendedMg,
      guidanceText
    );

    setIsSubmitting(false);
    setSaveSuccess(true);

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-accent-cyan" strokeWidth={2} />
          Cognitive Load + Caffeine Tracker
        </h2>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          Track mental fatigue and caffeine intake with deterministic weight-based guidance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Load & Stimulant Intake</CardTitle>
          <CardDescription>
            Record mental intensity and coffee/tea/stimulant intake.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Cognitive Load Slider */}
          <div className="p-6 rounded-2xl bg-surface-hover/30 border border-surface-border space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text-secondary">Cognitive Load / Mental Intensity</span>
              <span className="font-display text-2xl font-bold text-accent-cyan tabular-nums">
                {loadScore} / 10
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={10}
              value={loadScore}
              onChange={(e) => setLoadScore(Number(e.target.value))}
              className="w-full h-2.5 bg-surface-border rounded-lg appearance-none cursor-pointer accent-accent-cyan"
            />

            <div className="flex justify-between text-xs text-text-muted font-medium">
              <span>1 - Light / Relaxed</span>
              <span>5 - Moderate</span>
              <span>10 - Overloaded</span>
            </div>
          </div>

          {/* Caffeine Intake Inputs & Presets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                Caffeine Intake (mg)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Coffee className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    value={caffeineMg}
                    onChange={(e) => setCaffeineMg(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-medium text-text-primary focus:outline-none focus:border-accent-cyan/60"
                  />
                </div>
                <span className="text-xs font-semibold text-text-muted">mg total</span>
              </div>

              {/* Quick Add Presets */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CAFFEINE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setCaffeineMg((prev) => prev + preset.mg)}
                    className="px-2.5 py-1 rounded-lg bg-surface-hover/60 border border-surface-border text-[11px] font-medium text-text-secondary hover:text-accent-cyan transition-colors"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                    Body Weight (kg)
                  </label>
                  <input
                    type="number"
                    min={30}
                    max={250}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-medium text-text-primary focus:outline-none focus:border-accent-cyan/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                    Time Taken
                  </label>
                  <input
                    type="time"
                    value={consumptionTime}
                    onChange={(e) => setConsumptionTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-medium text-text-primary focus:outline-none focus:border-accent-cyan/60"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-hover/30 border border-surface-border text-xs text-text-muted flex items-center justify-between">
                <span>Calculated Daily Guidance:</span>
                <span className="font-bold text-accent-cyan">~{maxRecommendedMg} mg max</span>
              </div>
            </div>
          </div>

          {/* Deterministic Informational Suggestion Banner */}
          <div
            className={[
              'p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3',
              isOverLimit
                ? 'bg-accent-amber/10 border-accent-amber/30 text-text-primary'
                : 'bg-accent-cyan/10 border-accent-cyan/30 text-text-primary',
            ].join(' ')}
          >
            {isOverLimit ? (
              <AlertCircle className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <span className="font-bold block uppercase tracking-wider">
                {isOverLimit ? 'Caffeine Notice' : 'Caffeine Guidance'}
              </span>
              <p>{guidanceText}</p>
              <p className="text-[11px] text-text-muted opacity-80 pt-1">
                *General informational calculation based on weight. This is not medical diagnosis or treatment advice.
              </p>
            </div>
          </div>

          {/* Additional deterministic suggestion */}
          <div className="p-4 rounded-2xl bg-accent-amber/10 border border-accent-amber/25 flex items-start gap-3 text-xs text-text-secondary">
            <Coffee className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-text-primary mb-0.5">
                Caffeine Pacing Suggestion
              </span>
              {isOverLimit
                ? `Your entered amount is above the estimated ${maxRecommendedMg} mg daily guideline for ${weightKg} kg. Consider spacing caffeine intake and choosing lower-caffeine options.`
                : `Your entered amount is within the estimated ${maxRecommendedMg} mg daily guideline for ${weightKg} kg. Consider avoiding caffeine close to bedtime to protect sleep.`}
              <p className="text-[11px] text-text-muted pt-1">This is general informational guidance, not medical diagnosis or treatment advice.</p>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <ShieldCheck className="w-4 h-4 text-accent-green" />
              Saved locally & in Supabase
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[170px]"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-accent-green" />
                  Saved Record!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Save Record
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
              <History className="w-4.5 h-4.5 text-accent-cyan" />
              <CardTitle className="text-base">Cognitive & Caffeine Log</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((rec) => {
              const meta = rec.metadata as {
                caffeine_mg?: number;
                consumption_time?: string;
                weight_kg?: number;
                max_recommended_mg?: number;
              };
              return (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-surface-hover/30 border border-surface-border flex items-start justify-between gap-4 flex-wrap"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Tag variant="cyan" size="sm">
                        Load: {rec.value} / 10
                      </Tag>
                      <Tag variant="amber" size="sm">
                        Caffeine: {meta.caffeine_mg ?? 0} mg
                      </Tag>
                      {meta.consumption_time && (
                        <span className="text-xs text-text-muted">at {meta.consumption_time}</span>
                      )}
                    </div>
                    {meta.max_recommended_mg && (
                      <p className="text-xs text-text-muted">
                        Guideline limit for {meta.weight_kg ?? 70}kg: ~{meta.max_recommended_mg} mg
                      </p>
                    )}
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

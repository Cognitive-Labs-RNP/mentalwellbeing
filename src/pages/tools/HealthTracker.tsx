import { useState, useEffect } from 'react';
import { Activity, Scale, Send, History, Check, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store';
import { saveHealthRecord, fetchToolHistory, SavedToolRecord } from '@/services/toolService';

export default function HealthTracker() {
  const session = useAppStore((s) => s.session);

  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(70);
  const [age, setAge] = useState<number>(28);
  const [activityLevel, setActivityLevel] = useState<string>('Moderate');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<SavedToolRecord[]>([]);

  const userId = session?.userId ?? 'demo-user-id';

  useEffect(() => {
    fetchToolHistory(userId, 'health').then(setHistory);
  }, [userId, saveSuccess]);

  // Deterministic BMI calculation
  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? Number((weightKg / (heightM * heightM)).toFixed(1)) : 0;

  const bmiCategory =
    bmi < 18.5
      ? 'Underweight'
      : bmi <= 24.9
      ? 'Healthy Weight'
      : bmi <= 29.9
      ? 'Overweight'
      : 'Obese';

  const minHealthyWeight = Number((18.5 * heightM * heightM).toFixed(1));
  const maxHealthyWeight = Number((24.9 * heightM * heightM).toFixed(1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);

    await saveHealthRecord(userId, heightCm, weightKg, age, activityLevel, bmi, bmiCategory);

    setIsSubmitting(false);
    setSaveSuccess(true);

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
          <Scale className="w-6 h-6 text-accent-cyan" strokeWidth={2} />
          General Health Tracker
        </h2>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          Record physical metrics, calculate Body Mass Index (BMI), and track weight range guidelines.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Physical Metrics & BMI Guidance</CardTitle>
          <CardDescription>Enter height, weight, age, and activity level for general health indicators.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                Height (cm)
              </label>
              <input
                type="number"
                min={100}
                max={250}
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-semibold text-text-primary focus:outline-none focus:border-accent-cyan/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                Weight (kg)
              </label>
              <input
                type="number"
                min={30}
                max={300}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-semibold text-text-primary focus:outline-none focus:border-accent-cyan/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                Age
              </label>
              <input
                type="number"
                min={10}
                max={120}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-semibold text-text-primary focus:outline-none focus:border-accent-cyan/60"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider block">
                Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-semibold text-text-primary focus:outline-none focus:border-accent-cyan/60"
              >
                <option value="Sedentary">Sedentary</option>
                <option value="Light">Light Exercise</option>
                <option value="Moderate">Moderate Exercise</option>
                <option value="Active">Active</option>
                <option value="Very Active">Very Active</option>
              </select>
            </div>
          </div>

          {/* Calculated Output Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-accent-cyan/10 via-surface-hover/40 to-accent-lavender/10 border border-accent-cyan/25 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">Calculated BMI</span>
                <span className="font-display text-3xl font-bold text-accent-cyan tabular-nums">
                  {bmi}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">BMI Category</span>
                <Tag variant={bmiCategory === 'Healthy Weight' ? 'green' : 'amber'} size="md">
                  {bmiCategory}
                </Tag>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface/60 border border-surface-border text-xs text-text-secondary flex items-center justify-between flex-wrap gap-2">
              <span>Estimated Healthy Weight Range for {heightCm}cm:</span>
              <span className="font-bold text-text-primary">
                {minHealthyWeight} kg – {maxHealthyWeight} kg
              </span>
            </div>
          </div>

          {/* Non-Clinical Disclaimer Banner */}
          <div className="p-4 rounded-2xl bg-surface-hover/40 border border-surface-border flex items-start gap-3 text-xs text-text-secondary">
            <Info className="w-5 h-5 text-accent-cyan flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-text-primary mb-0.5">
                General Health Information Disclaimer
              </span>
              This calculation is provided strictly as general health information and Body Mass Index reference. This is not a medical diagnosis, clinical assessment, or treatment recommendation.
            </div>
          </div>

          {/* Additional deterministic suggestion */}
          <div className="p-4 rounded-2xl bg-accent-green/10 border border-accent-green/25 flex items-start gap-3 text-xs text-text-secondary">
            <Activity className="w-5 h-5 text-accent-green flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-text-primary mb-0.5">
                Healthy Weight Suggestion
              </span>
              For {heightCm} cm, a general BMI-based healthy weight range is {minHealthyWeight} kg to {maxHealthyWeight} kg. Use this as an informational reference, since healthy weight can vary with body composition and other factors.
            </div>
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
              className="min-w-[170px]"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-accent-green" />
                  Saved Health Record!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Save Health Record
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
              <CardTitle className="text-base">Health History Log</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((rec) => {
              const meta = rec.metadata as {
                height_cm?: number;
                weight_kg?: number;
                age?: number;
                activity_level?: string;
                bmi_category?: string;
              };
              return (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-surface-hover/30 border border-surface-border flex items-start justify-between gap-4 flex-wrap"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag variant="cyan" size="sm">
                        BMI: {rec.value} ({meta.bmi_category ?? 'N/A'})
                      </Tag>
                      <span className="text-xs text-text-muted">
                        {meta.height_cm ?? 0}cm · {meta.weight_kg ?? 0}kg
                      </span>
                    </div>
                    {meta.activity_level && (
                      <p className="text-xs text-text-secondary">
                        Activity Level: {meta.activity_level}
                      </p>
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

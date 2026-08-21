import { useState, useEffect } from 'react';
import { Activity, Droplets, Sun, Users, Monitor, Sparkles, Send, History, Check, ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { useAppStore } from '@/store';
import { saveLifestyleRecord, fetchToolHistory, SavedToolRecord } from '@/services/toolService';

export default function Lifestyle() {
  const session = useAppStore((s) => s.session);
  const logLifestyleStore = useAppStore((s) => s.logLifestyle);

  const [activityMins, setActivityMins] = useState<number>(30);
  const [hydrationMl, setHydrationMl] = useState<number>(2000);
  const [mealsCount, setMealsCount] = useState<number>(3);
  const [outdoorMins, setOutdoorMins] = useState<number>(20);
  const [socialMins, setSocialMins] = useState<number>(45);
  const [screenTimeMins, setScreenTimeMins] = useState<number>(240);
  const [relaxationMins, setRelaxationMins] = useState<number>(30);
  const [routineCompleted, setRoutineCompleted] = useState<boolean>(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState<SavedToolRecord[]>([]);

  const userId = session?.userId ?? 'demo-user-id';

  useEffect(() => {
    fetchToolHistory(userId, 'lifestyle').then(setHistory);
  }, [userId, saveSuccess]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSaveSuccess(false);

    const payload = {
      physical_activity_mins: activityMins,
      hydration_ml: hydrationMl,
      meals_count: mealsCount,
      outdoor_mins: outdoorMins,
      social_mins: socialMins,
      screen_time_mins: screenTimeMins,
      relaxation_mins: relaxationMins,
      routine_completed: routineCompleted,
    };

    // Update Zustand store locally
    logLifestyleStore({
      id: `lifestyle-${Date.now()}`,
      timestamp: new Date().toISOString(),
      waterIntakeGlasses: Math.round(hydrationMl / 250),
      movementMinutes: activityMins,
      mealsEaten: mealsCount,
      outdoorsMinutes: outdoorMins,
      caffeineCups: undefined,
    });

    // Sync to Supabase
    await saveLifestyleRecord(userId, payload);

    setIsSubmitting(false);
    setSaveSuccess(true);

    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2.5">
          <Activity className="w-6 h-6 text-accent-green" strokeWidth={2} />
          Daily Lifestyle Tracker
        </h2>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          Record physical movement, hydration, sleep hygiene, and daily routine completion.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Habits & Routine</CardTitle>
          <CardDescription>Structure your daily wellness activities and monitor habit consistency.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Grid of Structured Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Physical Activity */}
            <div className="p-4 rounded-2xl bg-surface-hover/30 border border-surface-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                <Activity className="w-4 h-4 text-accent-green" />
                Physical Activity (mins)
              </div>
              <input
                type="number"
                min={0}
                max={600}
                value={activityMins}
                onChange={(e) => setActivityMins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-semibold text-text-primary"
              />
            </div>

            {/* Hydration */}
            <div className="p-4 rounded-2xl bg-surface-hover/30 border border-surface-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                <Droplets className="w-4 h-4 text-accent-cyan" />
                Hydration (ml water)
              </div>
              <input
                type="number"
                min={0}
                max={8000}
                step={250}
                value={hydrationMl}
                onChange={(e) => setHydrationMl(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-semibold text-text-primary"
              />
              <span className="text-[11px] text-text-muted">~ {Math.round(hydrationMl / 250)} glasses</span>
            </div>

            {/* Meals */}
            <div className="p-4 rounded-2xl bg-surface-hover/30 border border-surface-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                <Sparkles className="w-4 h-4 text-accent-amber" />
                Meals Count
              </div>
              <input
                type="number"
                min={1}
                max={10}
                value={mealsCount}
                onChange={(e) => setMealsCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-semibold text-text-primary"
              />
            </div>

            {/* Outdoor Time */}
            <div className="p-4 rounded-2xl bg-surface-hover/30 border border-surface-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                <Sun className="w-4 h-4 text-accent-amber" />
                Outdoor Time (mins)
              </div>
              <input
                type="number"
                min={0}
                max={600}
                value={outdoorMins}
                onChange={(e) => setOutdoorMins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-semibold text-text-primary"
              />
            </div>

            {/* Social Interaction */}
            <div className="p-4 rounded-2xl bg-surface-hover/30 border border-surface-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                <Users className="w-4 h-4 text-accent-lavender" />
                Social Interaction (mins)
              </div>
              <input
                type="number"
                min={0}
                max={600}
                value={socialMins}
                onChange={(e) => setSocialMins(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-semibold text-text-primary"
              />
            </div>

            {/* Screen Time */}
            <div className="p-4 rounded-2xl bg-surface-hover/30 border border-surface-border space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
                <Monitor className="w-4 h-4 text-accent-rose" />
                Screen Time (hours)
              </div>
              <input
                type="number"
                min={0}
                max={24}
                step={0.5}
                value={screenTimeMins / 60}
                onChange={(e) => setScreenTimeMins(Math.round(Number(e.target.value) * 60))}
                className="w-full px-3 py-2 rounded-xl bg-bg-primary/60 border border-surface-border text-sm font-semibold text-text-primary"
              />
            </div>
          </div>

          {/* Routine Completion Checkbox */}
          <div className="p-4 rounded-2xl bg-surface-hover/30 border border-surface-border flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-text-primary block">Routine Completed Today</span>
              <span className="text-xs text-text-muted">Did you complete your primary planned wellness routines today?</span>
            </div>

            <button
              type="button"
              onClick={() => setRoutineCompleted((prev) => !prev)}
              className={[
                'w-12 h-6 rounded-full transition-colors relative flex items-center px-1 border',
                routineCompleted ? 'bg-accent-green border-accent-green' : 'bg-surface-border border-surface-border',
              ].join(' ')}
            >
              <div
                className={[
                  'w-4 h-4 rounded-full bg-white transition-transform',
                  routineCompleted ? 'translate-x-6' : 'translate-x-0',
                ].join(' ')}
              />
            </button>
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
                  Saved Daily Record!
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Save Lifestyle Entry
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
              <History className="w-4.5 h-4.5 text-accent-green" />
              <CardTitle className="text-base">Lifestyle History Log</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {history.map((rec) => {
              const meta = rec.metadata as {
                physical_activity_mins?: number;
                hydration_ml?: number;
                meals_count?: number;
                outdoor_mins?: number;
                social_mins?: number;
                screen_time_mins?: number;
                routine_completed?: boolean;
              };
              return (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-surface-hover/30 border border-surface-border flex items-start justify-between gap-4 flex-wrap"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag variant="green" size="sm">
                        Activity: {meta.physical_activity_mins ?? 0}m
                      </Tag>
                      <Tag variant="cyan" size="sm">
                        Water: {meta.hydration_ml ?? 0}ml
                      </Tag>
                      <Tag variant="lavender" size="sm">
                        Screen: {meta.screen_time_mins ? Math.round(meta.screen_time_mins / 60) : 0}h
                      </Tag>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Outdoor: {meta.outdoor_mins ?? 0}m · Social: {meta.social_mins ?? 0}m · Routine: {meta.routine_completed ? 'Completed' : 'Partial'}
                    </p>
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

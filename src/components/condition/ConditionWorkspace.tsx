import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ActivityTimer } from '@/components/ui/ActivityTimer';
import { TaskBreaker } from '@/components/ui/TaskBreaker';
import { TaskPrioritization } from '@/components/ui/TaskPrioritization';
import { StrengthsChecklist } from '@/components/ui/StrengthsChecklist';
import { TinyStepChecklist } from '@/components/ui/TinyStepChecklist';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { AlertTriangle, CheckCircle2, Heart, Music2, Sparkles, ArrowRight, RefreshCw } from 'lucide-react';
import { getConditionConfig } from '@/conditions';
import { getSoundsForCondition } from '@/data/sounds';
import { useAppStore } from '@/store';
import { markConditionActivityComplete } from '@/services/conditionService';
import type { ConditionSolution } from '@/types';

interface ConditionWorkspaceProps {
  /** Optional override if conditionId is passed directly as prop instead of URL param */
  conditionIdProp?: string;
}

export function ConditionWorkspace({ conditionIdProp }: ConditionWorkspaceProps) {
  const { conditionId: urlConditionId } = useParams<{ conditionId: string }>();
  const activeConditionId = conditionIdProp ?? urlConditionId ?? 'anxiety';

  const session = useAppStore((s) => s.session);
  const patternMatches = useAppStore((s) => s.patternMatches);
  const activityRecords = useAppStore((s) => s.activityRecords);
  const completeActivityInStore = useAppStore((s) => s.completeActivity);
  const startActivityInStore = useAppStore((s) => s.startActivity);

  // Load config & recommended sounds
  const config = useMemo(() => getConditionConfig(activeConditionId), [activeConditionId]);
  const recommendedSounds = useMemo(() => getSoundsForCondition(activeConditionId), [activeConditionId]);

  // Find latest pattern match for similarity % display
  const latestMatch = useMemo(() => {
    return patternMatches
      .filter((p) => p.conditionId === activeConditionId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  }, [patternMatches, activeConditionId]);

  const similarityScore = latestMatch?.similarityPercent ?? 82;

  // Track completion state of solutions (by solution id)
  const [completedSolIds, setCompletedSolIds] = useState<Set<string>>(new Set());

  // Restore completed state from store & localStorage on mount
  useEffect(() => {
    const key = `completed_sols_${activeConditionId}`;
    try {
      const stored = localStorage.getItem(key);
      const initialSet = new Set<string>();
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) parsed.forEach((id) => initialSet.add(id));
      }
      // Also sync from activityRecords in store
      activityRecords.forEach((rec) => {
        if (rec.conditionId === activeConditionId && rec.completedAt) {
          initialSet.add(rec.activityId);
        }
      });
      setCompletedSolIds(initialSet);
    } catch {
      /* ignore */
    }
  }, [activeConditionId, activityRecords]);

  const handleSolutionComplete = (sol: ConditionSolution) => {
    setCompletedSolIds((prev) => {
      const next = new Set(prev).add(sol.id);
      try {
        localStorage.setItem(`completed_sols_${activeConditionId}`, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
      return next;
    });

    const now = new Date().toISOString();
    startActivityInStore({
      id: sol.id,
      conditionId: activeConditionId as any,
      activityId: sol.id,
      activityType: sol.type,
      title: sol.title,
      startedAt: now,
    });
    completeActivityInStore(sol.id, now, Math.round((sol.durationSeconds ?? 300) / 60));

    markConditionActivityComplete(session?.userId, activeConditionId, sol.id, sol.title, Math.round((sol.durationSeconds ?? 300) / 60));
  };

  const completedCount = completedSolIds.size;
  const totalSolutions = config.solutions.length; // Always 5
  const progressPercent = totalSolutions > 0 ? Math.round((completedCount / totalSolutions) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Condition Header & Pattern Result */}
      <Card className="overflow-hidden border-surface-border/80 bg-gradient-to-br from-surface/90 via-surface/70 to-bg-primary/90">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-accent-lavender/30 to-accent-cyan/20 border border-surface-border/60 flex-shrink-0">
                <Heart className="w-6 h-6 text-accent-lavender" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Condition Support Workspace
                </p>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-text-primary capitalize">
                  {config.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Tag variant="lavender" size="md">
                <Sparkles className="w-3.5 h-3.5" />
                Pattern Similarity: {similarityScore}%
              </Tag>
              <Tag variant="cyan" size="md">
                {completedCount} / {totalSolutions} Activities Completed
              </Tag>
            </div>
          </div>
        </CardHeader>

        {/* AI Immediate Response & Disclaimer Banner */}
        <div className="px-6 pb-6 space-y-4">
          {/* AI Immediate Response */}
          <div className="p-4 rounded-2xl bg-accent-lavender/10 border border-accent-lavender/25 text-sm text-text-primary leading-relaxed">
            <p className="font-semibold text-accent-lavender mb-1">AI Immediate Supportive Analysis</p>
            <p>
              Based on the information provided, your reported pattern shows similarities with {config.name.toLowerCase()}.
              Below are your five tailored, evidence-backed tools and recommended soundscapes to support you.
            </p>
          </div>

          {/* Mandatory Disclaimer */}
          <div className="p-4 rounded-2xl bg-accent-amber/10 border border-accent-amber/25 flex items-start gap-3 text-xs text-text-secondary">
            <AlertTriangle className="w-4 h-4 text-accent-amber flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-accent-amber uppercase tracking-wider block mb-0.5">Disclaimer</span>
              This is not a clinical diagnosis. This result is an informational pattern match based on the symptoms and behavior described.
            </div>
          </div>

          {/* Overall Workspace Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Overall Activity Progress</span>
              <span className="font-semibold text-text-primary">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-bg-primary/70 rounded-full overflow-hidden border border-surface-border/60">
              <div
                className="h-full bg-gradient-to-r from-accent-lavender via-purple-400 to-accent-cyan transition-all duration-500 shadow-glow"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* SECTION: YOUR CUSTOM ACTIVITIES (THE FIVE HARDCODED SOLUTIONS) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
              Your Custom Activities
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-surface-hover border border-surface-border text-text-muted">
                5 Predefined Solutions
              </span>
            </h2>
            <p className="text-xs text-text-secondary mt-1">
              Interactive tools specially configured for {config.name.toLowerCase()}.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {config.solutions.map((sol, idx) => {
            const isCompleted = completedSolIds.has(sol.id);

            return (
              <div key={sol.id} className="relative">
                {/* Solution Number Badge */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-lavender to-purple-500 text-white text-xs font-bold flex items-center justify-center shadow-glow">
                    {idx + 1}
                  </span>
                  <h3 className="font-display text-base font-semibold text-text-primary">{sol.title}</h3>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-accent-green/20 text-accent-green font-medium border border-accent-green/30 ml-auto">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>

                {/* Render interactive component based on solution type */}
                {sol.type === 'task-breaker' ? (
                  <TaskBreaker
                    conditionId={activeConditionId}
                    onComplete={() => handleSolutionComplete(sol)}
                  />
                ) : sol.type === 'task-prioritization' ? (
                  <TaskPrioritization
                    conditionId={activeConditionId}
                    onComplete={() => handleSolutionComplete(sol)}
                  />
                ) : sol.type === 'strengths-checklist' ? (
                  <StrengthsChecklist
                    conditionId={activeConditionId}
                    onComplete={() => handleSolutionComplete(sol)}
                  />
                ) : sol.type === 'tiny-step' || sol.type === 'confidence-building' || sol.type === 'support-seeking' ? (
                  <TinyStepChecklist
                    conditionId={activeConditionId}
                    onComplete={() => handleSolutionComplete(sol)}
                  />
                ) : (
                  /* Timed Solution Components (Breathing, Meditation, Grounding, Relaxation, Movement, etc.) */
                  <ActivityTimer
                    durationSeconds={sol.durationSeconds ?? 300}
                    title={sol.title}
                    instructions={sol.instructions}
                    recommendedSoundId={sol.recommendedSoundId}
                    isBreathing={sol.type === 'breathing'}
                    onComplete={() => handleSolutionComplete(sol)}
                    completed={isCompleted}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION: RECOMMENDED SOUNDS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-accent-cyan/30 to-accent-lavender/25 border border-surface-border/60">
              <Music2 className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-text-primary">Recommended Sounds</h2>
              <p className="text-xs text-text-secondary">Soundscapes curated specifically for {config.name}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedSounds.map((sound) => (
            <AudioPlayer key={sound.id} sound={sound} defaultDuration={10} />
          ))}
        </div>
      </section>
    </div>
  );
}

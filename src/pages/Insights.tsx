import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  BrainCircuit,
  MoonStar,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { useAppStore } from '../store';
import { getSession } from '../services/auth';
import {
  generateAIInsightsSummary,
  getInsightsForUser,
  type InsightsResult,
  type TimeRangeOption,
} from '../services/insightsService';

const rangeOptions: { key: TimeRangeOption; label: string }[] = [
  { key: '7d', label: 'Last 7 days' },
  { key: '30d', label: 'Last 30 days' },
  { key: 'all', label: 'All available history' },
];

function TrendPill({ status }: { status: InsightsResult['overallTrend'] }) {
  const tones: Record<InsightsResult['overallTrend'], string> = {
    IMPROVING: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    STABLE: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
    MIXED: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    WORSENING: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    INSUFFICIENT_DATA: 'bg-slate-500/15 text-slate-300 border-slate-400/30',
  };

  const labels: Record<InsightsResult['overallTrend'], string> = {
    IMPROVING: 'Improving',
    STABLE: 'Stable',
    MIXED: 'Mixed',
    WORSENING: 'Worsening',
    INSUFFICIENT_DATA: 'Need More Data',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function Insights() {
  const session = useAppStore((s) => s.session);
  const storeState = useAppStore();
  const [range, setRange] = useState<TimeRangeOption>('7d');
  const [insights, setInsights] = useState<InsightsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiNarrative, setAiNarrative] = useState<string | null>(null);

  const loadInsights = useCallback(async () => {
    setLoading(true);

    let currentSession = session;
    if (!currentSession) {
      const spSession = await getSession();
      if (spSession?.user) {
        currentSession = {
          userId: spSession.user.id,
          uid: spSession.user.id.slice(0, 8).toUpperCase(),
          sessionStart: new Date().toISOString(),
          isDemo: false,
        };
      }
    }

    const activeUserId = currentSession?.userId ?? 'demo-user-id';
    const nextInsights = await getInsightsForUser(activeUserId, range, storeState as unknown as Record<string, unknown>);
    setInsights(nextInsights);

    if (nextInsights.dataSufficiency !== 'insufficient') {
      const aiResult = await generateAIInsightsSummary(nextInsights);
      setAiNarrative(aiResult?.narrative ?? null);
    } else {
      setAiNarrative(null);
    }

    setLoading(false);
  }, [range, session, storeState]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  const topObservations = useMemo(() => {
    return insights?.observations.slice(0, 4) ?? [];
  }, [insights]);

  const toneMessage = useMemo(() => {
    if (!insights) return 'Keep recording your experiences to build a more useful trend.';
    if (insights.overallTrend === 'IMPROVING') {
      return 'Your recent entries show a generally improving trend.';
    }
    if (insights.overallTrend === 'STABLE') {
      return 'Your recent entries do not show a clear change in either direction.';
    }
    if (insights.overallTrend === 'WORSENING') {
      return 'Your recent entries show a worsening trend in the feelings and symptoms you have reported.';
    }
    if (insights.overallTrend === 'MIXED') {
      return 'Your recent entries show mixed signals across different areas.';
    }
    return 'Keep recording your experiences to build a more useful trend.';
  }, [insights]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">Private reflections</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-text-primary">Insights</h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {rangeOptions.map((option) => (
            <Button
              key={option.key}
              size="sm"
              variant={range === option.key ? 'primary' : 'ghost'}
              onClick={() => setRange(option.key)}
            >
              {option.label}
            </Button>
          ))}
          <Button size="sm" variant="secondary" onClick={() => void loadInsights()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="border-dashed border-surface-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="h-10 w-10 rounded-full border-2 border-accent-lavender/30 border-t-accent-lavender animate-spin" />
            <p className="text-sm text-text-secondary">Loading your trend analysis…</p>
          </CardContent>
        </Card>
      ) : !insights ? (
        <Card>
          <CardContent className="py-10 text-center text-text-secondary">No usable data was found for this view yet.</CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>Your recent trend</CardTitle>
                  <CardDescription>{toneMessage}</CardDescription>
                </div>
                <TrendPill status={insights.overallTrend} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.dataSufficiency === 'insufficient' ? (
                <div className="rounded-2xl border border-surface-border bg-surface/50 p-4 text-sm text-text-secondary">
                  Not enough data yet. Keep recording your experiences to build a more useful trend.
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {insights.moodTrend.available && (
                      <div className="rounded-2xl border border-surface-border bg-surface/50 p-4">
                        <div className="flex items-center justify-between text-text-muted text-xs uppercase tracking-wide">
                          <span>Mood</span>
                          {insights.moodTrend.direction === 'improving' ? (
                            <ArrowDown className="h-4 w-4 text-emerald-300" />
                          ) : insights.moodTrend.direction === 'worsening' ? (
                            <ArrowUp className="h-4 w-4 text-rose-300" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-sky-300" />
                          )}
                        </div>
                        <p className="mt-3 text-lg font-semibold text-text-primary">
                          {insights.moodTrend.earlierAvg ?? 0} → {insights.moodTrend.recentAvg ?? 0}
                        </p>
                        <p className="mt-2 text-sm text-text-secondary">{insights.moodTrend.summaryText}</p>
                      </div>
                    )}

                    {insights.sleepTrend.available && (
                      <div className="rounded-2xl border border-surface-border bg-surface/50 p-4">
                        <div className="flex items-center justify-between text-text-muted text-xs uppercase tracking-wide">
                          <span>Sleep</span>
                          <MoonStar className="h-4 w-4 text-violet-300" />
                        </div>
                        <p className="mt-3 text-lg font-semibold text-text-primary">
                          {insights.sleepTrend.earlierAvg ?? 0}h → {insights.sleepTrend.recentAvg ?? 0}h
                        </p>
                        <p className="mt-2 text-sm text-text-secondary">{insights.sleepTrend.summaryText}</p>
                      </div>
                    )}

                    {insights.cognitiveLoadTrend.available && (
                      <div className="rounded-2xl border border-surface-border bg-surface/50 p-4">
                        <div className="flex items-center justify-between text-text-muted text-xs uppercase tracking-wide">
                          <span>Cognitive Load</span>
                          <BrainCircuit className="h-4 w-4 text-amber-300" />
                        </div>
                        <p className="mt-3 text-lg font-semibold text-text-primary">
                          {insights.cognitiveLoadTrend.earlierAvg ?? 0} → {insights.cognitiveLoadTrend.recentAvg ?? 0}
                        </p>
                        <p className="mt-2 text-sm text-text-secondary">{insights.cognitiveLoadTrend.summaryText}</p>
                      </div>
                    )}

                    {insights.feedbackTrend.available && (
                      <div className="rounded-2xl border border-surface-border bg-surface/50 p-4">
                        <div className="flex items-center justify-between text-text-muted text-xs uppercase tracking-wide">
                          <span>Feedback</span>
                          <Activity className="h-4 w-4 text-emerald-300" />
                        </div>
                        <p className="mt-3 text-lg font-semibold text-text-primary">
                          {insights.feedbackTrend.improvedCount} improved
                        </p>
                        <p className="mt-2 text-sm text-text-secondary">{insights.feedbackTrend.summaryText}</p>
                      </div>
                    )}
                  </div>

                  {aiNarrative && (
                    <div className="rounded-2xl border border-accent-lavender/25 bg-accent-lavender/5 p-4 text-sm text-text-primary">
                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-lavender">
                        <Sparkles className="h-4 w-4" />
                        Summary
                      </div>
                      <p className="leading-relaxed">{aiNarrative}</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>What you’ve been doing</CardTitle>
                <CardDescription>Actual activity history from your check-ins and completed sessions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.activityUsage.length === 0 ? (
                  <p className="text-sm text-text-secondary">No recorded activity usage in this period yet.</p>
                ) : (
                  insights.activityUsage.map((item) => (
                    <div key={`${item.name}-${item.category}`} className="flex items-center justify-between rounded-xl border border-surface-border bg-surface/50 px-3 py-2">
                      <div>
                        <p className="font-medium text-text-primary">{item.name}</p>
                        <p className="text-xs text-text-muted">{item.category}</p>
                      </div>
                      <span className="rounded-full bg-accent-lavender/10 px-2 py-1 text-xs font-semibold text-accent-lavender">
                        {item.count} sessions
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What your entries show</CardTitle>
                <CardDescription>Structured observations based on the records available in this range.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {topObservations.length === 0 ? (
                  <p className="text-sm text-text-secondary">No observations are available yet.</p>
                ) : (
                  topObservations.map((observation, index) => (
                    <div key={`${observation}-${index}`} className="flex gap-3 rounded-xl border border-surface-border bg-surface/50 p-3">
                      <div className="mt-0.5 rounded-full bg-accent-cyan/10 p-1 text-accent-cyan">
                        <BarChart3 className="h-3.5 w-3.5" />
                      </div>
                      <p className="text-sm text-text-secondary leading-relaxed">{observation}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Next step</CardTitle>
              <CardDescription>Suggested next action based on the trend in your recent entries.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-surface-border bg-surface/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                  {insights.nextStep.type === 'professional_support' ? (
                    <ShieldAlert className="h-4 w-4 text-rose-300" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-accent-lavender" />
                  )}
                  {insights.nextStep.title}
                </div>
                <p className="text-sm leading-relaxed text-text-secondary">{insights.nextStep.text}</p>
              </div>

              {insights.nextStep.suggestedActions.length > 0 && (
                <ul className="space-y-2 text-sm text-text-secondary">
                  {insights.nextStep.suggestedActions.map((action) => (
                    <li key={action} className="flex gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-accent-lavender" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-5">
              <p className="text-sm text-text-secondary leading-relaxed">{insights.disclaimer}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

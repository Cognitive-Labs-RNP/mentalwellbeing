import { fetchUserJournalData, getLocalJournalEvents } from './journalService';
import type { JournalActivityEvent } from '../types/journal';
import { supabase } from '../lib/supabase';

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

export type TimeRangeOption = '7d' | '30d' | 'all';
export type OverallTrendStatus = 'IMPROVING' | 'STABLE' | 'WORSENING' | 'MIXED' | 'INSUFFICIENT_DATA';

export interface SingleMetricTrend {
  available: boolean;
  earlierAvg?: number;
  recentAvg?: number;
  direction?: 'improving' | 'stable' | 'worsening';
  summaryText: string;
}

export interface ActivityUsageItem {
  name: string;
  count: number;
  totalMinutes: number;
  category: string;
}

export interface FeedbackTrendSummary {
  available: boolean;
  totalCount: number;
  improvedCount: number;
  unchangedCount: number;
  worsenedCount: number;
  avgImprovementPoints: number;
  summaryText: string;
  topPositiveActivities: string[];
}

export interface ConditionPatternTrend {
  conditionId: string;
  conditionName: string;
  count: number;
  highestSimilarity: number;
  recentTimestamp: string;
}

export interface NextStepRecommendation {
  type: 'reinforcement' | 'encouragement' | 'guidance' | 'professional_support';
  title: string;
  text: string;
  suggestedActions: string[];
  isProfessionalSupportRecommended: boolean;
}

export interface InsightsResult {
  period: TimeRangeOption;
  dataSufficiency: 'sufficient' | 'sparse' | 'insufficient';
  totalEventsAnalyzed: number;
  overallTrend: OverallTrendStatus;
  overallTrendLabel: string;
  moodTrend: SingleMetricTrend;
  sleepTrend: SingleMetricTrend;
  cognitiveLoadTrend: SingleMetricTrend;
  lifestyleTrend: SingleMetricTrend;
  feedbackTrend: FeedbackTrendSummary;
  conditionPatterns: ConditionPatternTrend[];
  activityUsage: ActivityUsageItem[];
  observations: string[];
  nextStep: NextStepRecommendation;
  disclaimer: string;
  aiSummary?: {
    narrative: string;
    keyPoints: string[];
    suggestedFocus: string;
  };
}

// ---------------------------------------------------------------------------
// HELPER: FILTER EVENTS BY TIME RANGE
// ---------------------------------------------------------------------------

function filterByTimeRange(events: JournalActivityEvent[], range: TimeRangeOption): JournalActivityEvent[] {
  if (range === 'all') return events;
  const now = new Date().getTime();
  const days = range === '7d' ? 7 : 30;
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return events.filter((e) => new Date(e.timestamp).getTime() >= cutoff);
}

// ---------------------------------------------------------------------------
// CALCULATE TRENDS (DETERMINISTIC LAYER 2)
// ---------------------------------------------------------------------------

export function calculateTrends(events: JournalActivityEvent[], range: TimeRangeOption = '7d'): InsightsResult {
  const filtered = filterByTimeRange(events, range);
  const totalEventsAnalyzed = filtered.length;

  const disclaimer =
    'Insights are generated from your self-reported check-ins, tool usage, and exercise feedback. They provide informational pattern observations and do not constitute a clinical medical diagnosis.';

  // Check minimum data requirement (at least 2 entries needed for a trend)
  if (totalEventsAnalyzed < 2) {
    return {
      period: range,
      dataSufficiency: 'insufficient',
      totalEventsAnalyzed,
      overallTrend: 'INSUFFICIENT_DATA',
      overallTrendLabel: 'Need More Data',
      moodTrend: {
        available: false,
        summaryText: 'Keep recording your experiences to build a more useful mood trend.',
      },
      sleepTrend: {
        available: false,
        summaryText: 'Not enough sleep records yet.',
      },
      cognitiveLoadTrend: {
        available: false,
        summaryText: 'Not enough cognitive load records yet.',
      },
      lifestyleTrend: {
        available: false,
        summaryText: 'Not enough lifestyle records yet.',
      },
      feedbackTrend: {
        available: false,
        totalCount: 0,
        improvedCount: 0,
        unchangedCount: 0,
        worsenedCount: 0,
        avgImprovementPoints: 0,
        summaryText: 'No activity feedback records available for this period.',
        topPositiveActivities: [],
      },
      conditionPatterns: [],
      activityUsage: [],
      observations: [
        'Keep logging your daily check-ins and activities to unlock personalized trend observations.',
      ],
      nextStep: {
        type: 'encouragement',
        title: 'Start Tracking Your Routine',
        text: 'Complete mood check-ins, try condition workspace tools, or record feedback to see your personalized trends build up over time.',
        suggestedActions: ['Try a Mood Check', 'Explore Sound Library', 'Run an Analysis Check-in'],
        isProfessionalSupportRecommended: false,
      },
      disclaimer,
    };
  }

  // 1. MOOD TREND
  const moodEvents = filtered.filter((e) => e.type === 'mood' && typeof e.score === 'number');
  let moodTrend: SingleMetricTrend = {
    available: false,
    summaryText: 'Not enough mood entries in this timeframe.',
  };

  if (moodEvents.length >= 2) {
    const sortedMood = [...moodEvents].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const mid = Math.floor(sortedMood.length / 2);
    const earlierGroup = sortedMood.slice(0, mid);
    const recentGroup = sortedMood.slice(mid);

    const earlierAvg = Number((earlierGroup.reduce((acc, curr) => acc + (curr.score || 0), 0) / earlierGroup.length).toFixed(1));
    const recentAvg = Number((recentGroup.reduce((acc, curr) => acc + (curr.score || 0), 0) / recentGroup.length).toFixed(1));
    const diff = recentAvg - earlierAvg;

    // For mood/intensity tracking, lower values represent lower reported intensity,
    // so a decrease over time reflects an improving trend.
    const direction: 'improving' | 'stable' | 'worsening' =
      diff <= -0.5 ? 'improving' : diff >= 0.5 ? 'worsening' : 'stable';

    moodTrend = {
      available: true,
      earlierAvg,
      recentAvg,
      direction,
      summaryText:
        direction === 'improving'
          ? `Your reported mood intensity decreased from ${earlierAvg}/10 to ${recentAvg}/10.`
          : direction === 'worsening'
          ? `Your reported mood intensity increased from ${earlierAvg}/10 to ${recentAvg}/10.`
          : `Your reported mood intensity remained stable around ${recentAvg}/10.`,
    };
  }

  // 2. BEFORE / AFTER FEEDBACK TREND
  const feedbackEvents = filtered.filter((e) => e.type === 'feedback');
  let feedbackTrend: FeedbackTrendSummary = {
    available: false,
    totalCount: 0,
    improvedCount: 0,
    unchangedCount: 0,
    worsenedCount: 0,
    avgImprovementPoints: 0,
    summaryText: 'No feedback entries recorded in this period.',
    topPositiveActivities: [],
  };

  if (feedbackEvents.length > 0) {
    let improvedCount = 0;
    let unchangedCount = 0;
    let worsenedCount = 0;
    let totalDiff = 0;
    const positiveActivitiesMap: Record<string, number> = {};

    feedbackEvents.forEach((fb) => {
      const d = fb.details as Record<string, unknown>;
      const before = Number(d.beforeIntensity || 8);
      const after = Number(d.afterIntensity || 5);
      const diff = before - after; // positive diff means intensity decreased (improved)
      totalDiff += diff;

      if (diff > 0) {
        improvedCount++;
        const actName = (d.relatedActivity as string) || (fb.subtitle?.split('•')[0]) || 'Relief Exercise';
        positiveActivitiesMap[actName] = (positiveActivitiesMap[actName] || 0) + 1;
      } else if (diff === 0) {
        unchangedCount++;
      } else {
        worsenedCount++;
      }
    });

    const avgImprovementPoints = Number((totalDiff / feedbackEvents.length).toFixed(1));
    const topPositiveActivities = Object.entries(positiveActivitiesMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name)
      .slice(0, 3);

    feedbackTrend = {
      available: true,
      totalCount: feedbackEvents.length,
      improvedCount,
      unchangedCount,
      worsenedCount,
      avgImprovementPoints,
      summaryText:
        improvedCount >= feedbackEvents.length / 2
          ? `Most of your recent feedback entries (${improvedCount} of ${feedbackEvents.length}) showed lower reported intensity after activities.`
          : worsenedCount > improvedCount
          ? `Several of your entries recorded higher intensity after sessions.`
          : `Your reported intensity level remained largely stable across feedback entries.`,
      topPositiveActivities,
    };
  }

  // 3. SLEEP TREND
  const sleepEvents = filtered.filter((e) => e.type === 'sleep');
  let sleepTrend: SingleMetricTrend = {
    available: false,
    summaryText: 'Not enough sleep records yet.',
  };

  if (sleepEvents.length >= 2) {
    const sortedSleep = [...sleepEvents].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const mid = Math.floor(sortedSleep.length / 2);
    const earlierGroup = sortedSleep.slice(0, mid);
    const recentGroup = sortedSleep.slice(mid);

    const earlierAvg = Number((earlierGroup.reduce((acc, curr) => acc + (curr.score || 0), 0) / earlierGroup.length).toFixed(1));
    const recentAvg = Number((recentGroup.reduce((acc, curr) => acc + (curr.score || 0), 0) / recentGroup.length).toFixed(1));
    const diff = recentAvg - earlierAvg;

    const direction: 'improving' | 'stable' | 'worsening' =
      diff >= 0.5 ? 'improving' : diff <= -0.5 ? 'worsening' : 'stable';

    sleepTrend = {
      available: true,
      earlierAvg,
      recentAvg,
      direction,
      summaryText:
        direction === 'improving'
          ? `Your recorded sleep duration increased from ${earlierAvg} hrs to ${recentAvg} hrs.`
          : direction === 'worsening'
          ? `Your recorded sleep duration decreased from ${earlierAvg} hrs to ${recentAvg} hrs.`
          : `Your recorded sleep duration remained consistent around ${recentAvg} hrs.`,
    };
  }

  // 4. COGNITIVE LOAD TREND
  const cogEvents = filtered.filter((e) => e.type === 'caffeine' && typeof e.score === 'number');
  let cognitiveLoadTrend: SingleMetricTrend = {
    available: false,
    summaryText: 'Not enough cognitive load records yet.',
  };

  if (cogEvents.length >= 2) {
    const sortedCog = [...cogEvents].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const mid = Math.floor(sortedCog.length / 2);
    const earlierGroup = sortedCog.slice(0, mid);
    const recentGroup = sortedCog.slice(mid);

    const earlierAvg = Number((earlierGroup.reduce((acc, curr) => acc + (curr.score || 0), 0) / earlierGroup.length).toFixed(1));
    const recentAvg = Number((recentGroup.reduce((acc, curr) => acc + (curr.score || 0), 0) / recentGroup.length).toFixed(1));
    const diff = recentAvg - earlierAvg;

    // Lower cognitive-load values are the more positive direction.
    const direction: 'improving' | 'stable' | 'worsening' =
      diff <= -0.5 ? 'improving' : diff >= 0.5 ? 'worsening' : 'stable';

    cognitiveLoadTrend = {
      available: true,
      earlierAvg,
      recentAvg,
      direction,
      summaryText:
        direction === 'improving'
          ? `Your recorded cognitive-load level decreased from ${earlierAvg}/10 to ${recentAvg}/10.`
          : direction === 'worsening'
          ? `Your recorded cognitive-load level increased from ${earlierAvg}/10 to ${recentAvg}/10.`
          : `Your recorded cognitive-load level remained stable around ${recentAvg}/10.`,
    };
  }

  // 5. LIFESTYLE TREND
  const lifestyleEvents = filtered.filter((e) => e.type === 'lifestyle');
  let lifestyleTrend: SingleMetricTrend = {
    available: false,
    summaryText: 'Not enough lifestyle records yet.',
  };

  if (lifestyleEvents.length > 0) {
    const totalActivity = lifestyleEvents.reduce((acc, curr) => {
      const d = curr.details as Record<string, unknown>;
      return acc + (Number(d.physical_activity_mins || d.physicalActivityMins) || 0);
    }, 0);
    const totalHydration = lifestyleEvents.reduce((acc, curr) => {
      const d = curr.details as Record<string, unknown>;
      return acc + (Number(d.hydration_ml || d.hydrationMl) || 0);
    }, 0);

    const avgActivity = Math.round(totalActivity / lifestyleEvents.length);
    const avgHydration = Math.round(totalHydration / lifestyleEvents.length);

    lifestyleTrend = {
      available: true,
      recentAvg: avgActivity,
      summaryText: `Recorded average daily activity: ${avgActivity} mins • Hydration: ${avgHydration} ml across ${lifestyleEvents.length} log(s).`,
    };
  }

  // 6. CONDITION PATTERN FREQUENCY (ANALYSIS HISTORY)
  const analysisEvents = filtered.filter((e) => e.type === 'analysis');
  const condMap: Record<string, { count: number; highestScore: number; recentTime: string }> = {};

  analysisEvents.forEach((an) => {
    const condId = an.conditionId || 'general';
    if (!condMap[condId]) {
      condMap[condId] = { count: 0, highestScore: 0, recentTime: an.timestamp };
    }
    condMap[condId].count += 1;
    if ((an.score || 0) > condMap[condId].highestScore) {
      condMap[condId].highestScore = an.score || 0;
    }
    if (new Date(an.timestamp).getTime() > new Date(condMap[condId].recentTime).getTime()) {
      condMap[condId].recentTime = an.timestamp;
    }
  });

  const conditionPatterns: ConditionPatternTrend[] = Object.entries(condMap)
    .map(([condId, info]) => {
      const formatted = condId
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return {
        conditionId: condId,
        conditionName: formatted,
        count: info.count,
        highestSimilarity: info.highestScore,
        recentTimestamp: info.recentTime,
      };
    })
    .sort((a, b) => b.count - a.count);

  // 7. ACTIVITY USAGE BREAKDOWN
  const actMap: Record<string, { count: number; mins: number; cat: string }> = {};

  filtered.forEach((evt) => {
    if (evt.type === 'condition_activity' || evt.type === 'sound' || evt.type === 'mood') {
      const name = (evt.subtitle || evt.title || 'Activity').trim();
      const cat = evt.type === 'condition_activity' ? 'Workspace' : evt.type === 'sound' ? 'Sound' : 'Tool';
      const d = evt.details as Record<string, unknown>;
      const mins = Number(d.durationMinutes || d.durationHours ? Number(d.durationHours) * 60 : 5) || 5;

      if (!actMap[name]) {
        actMap[name] = { count: 0, mins: 0, cat };
      }
      actMap[name].count += 1;
      actMap[name].mins += mins;
    }
  });

  const activityUsage: ActivityUsageItem[] = Object.entries(actMap)
    .map(([name, info]) => ({
      name,
      count: info.count,
      totalMinutes: info.mins,
      category: info.cat,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // 8. MULTI-SIGNAL OVERALL TREND CLASSIFICATION
  let positiveSignals = 0;
  let negativeSignals = 0;
  let evaluatedSignalsCount = 0;

  if (moodTrend.available && moodTrend.direction) {
    evaluatedSignalsCount++;
    if (moodTrend.direction === 'improving') positiveSignals++;
    else if (moodTrend.direction === 'worsening') negativeSignals++;
  }

  if (feedbackTrend.available) {
    evaluatedSignalsCount++;
    if (feedbackTrend.improvedCount > feedbackTrend.worsenedCount) positiveSignals++;
    else if (feedbackTrend.worsenedCount > feedbackTrend.improvedCount) negativeSignals++;
  }

  if (sleepTrend.available && sleepTrend.direction) {
    evaluatedSignalsCount++;
    if (sleepTrend.direction === 'improving') positiveSignals++;
    else if (sleepTrend.direction === 'worsening') negativeSignals++;
  }

  if (cognitiveLoadTrend.available && cognitiveLoadTrend.direction) {
    evaluatedSignalsCount++;
    if (cognitiveLoadTrend.direction === 'improving') positiveSignals++;
    else if (cognitiveLoadTrend.direction === 'worsening') negativeSignals++;
  }

  let overallTrend: OverallTrendStatus = 'STABLE';
  let overallTrendLabel = 'Stable';

  if (evaluatedSignalsCount === 0) {
    overallTrend = 'INSUFFICIENT_DATA';
    overallTrendLabel = 'Need More Data';
  } else if (positiveSignals > negativeSignals && positiveSignals >= 1) {
    overallTrend = 'IMPROVING';
    overallTrendLabel = 'Improving';
  } else if (negativeSignals > positiveSignals && negativeSignals >= 2) {
    overallTrend = 'WORSENING';
    overallTrendLabel = 'Worsening Trend';
  } else if (positiveSignals > 0 && negativeSignals > 0) {
    overallTrend = 'MIXED';
    overallTrendLabel = 'Mixed Signals';
  } else {
    overallTrend = 'STABLE';
    overallTrendLabel = 'Stable';
  }

  // 9. OBSERVATIONS LIST
  const observations: string[] = [];

  if (moodTrend.available) {
    observations.push(moodTrend.summaryText);
  }
  if (feedbackTrend.available) {
    observations.push(feedbackTrend.summaryText);
    if (feedbackTrend.topPositiveActivities.length > 0) {
      observations.push(
        `Your entries frequently show lower reported intensity after sessions that included ${feedbackTrend.topPositiveActivities.join(', ')}.`
      );
    }
  }
  if (sleepTrend.available) {
    observations.push(sleepTrend.summaryText);
  }
  if (cognitiveLoadTrend.available) {
    observations.push(cognitiveLoadTrend.summaryText);
  }
  if (conditionPatterns.length > 0) {
    const topCond = conditionPatterns[0];
    observations.push(
      `Symptoms associated with ${topCond.conditionName} patterns appeared in ${topCond.count} of your recent analysis check-ins.`
    );
  }
  if (activityUsage.length > 0) {
    const topAct = activityUsage[0];
    observations.push(
      `You completed ${topAct.count} session(s) of ${topAct.name} during this period.`
    );
  }

  if (observations.length === 0) {
    observations.push('Continue logging check-ins to build detailed observations.');
  }

  // 10. NEXT STEP & RECOMMENDATIONS ENGINE
  let nextStep: NextStepRecommendation;

  if (overallTrend === 'IMPROVING') {
    const topActName = activityUsage[0]?.name || 'breathing exercises';
    nextStep = {
      type: 'reinforcement',
      title: 'Maintain Your Routine',
      text: `Your recent entries show a generally positive trend. Continuing activities like ${topActName} and regular mood tracking can help maintain your wellbeing routine.`,
      suggestedActions: [
        `Continue ${topActName}`,
        'Log a daily Mood Check',
        'Maintain current sleep schedule',
      ],
      isProfessionalSupportRecommended: false,
    };
  } else if (overallTrend === 'WORSENING') {
    nextStep = {
      type: 'professional_support',
      title: 'Consider Personalized Support',
      text: `Your recent entries show a worsening trend in the symptoms you've reported. Consider speaking with a qualified mental-health professional who can provide personalized guidance and support.`,
      suggestedActions: [
        'Explore grounding & breathing exercises',
        'Reach out to a trusted friend or healthcare provider',
        'Review crisis support resources',
      ],
      isProfessionalSupportRecommended: true,
    };
  } else if (overallTrend === 'MIXED') {
    nextStep = {
      type: 'guidance',
      title: 'Focus on High-Impact Activities',
      text: 'Your entries show mixed signals across different areas. Notice which activities correlate with lower stress, and consider scheduling dedicated time for them.',
      suggestedActions: [
        'Try a 5-minute breathing session',
        'Check in on hydration and rest',
        'Log your mood after exercises',
      ],
      isProfessionalSupportRecommended: false,
    };
  } else {
    // STABLE or fallback
    nextStep = {
      type: 'encouragement',
      title: 'Stay Consistent',
      text: 'Your reported entries do not show a significant change in either direction. Continuing regular check-ins and using wellbeing tools can help you track subtle changes over time.',
      suggestedActions: [
        'Complete a daily check-in',
        'Listen to a relaxing soundscape',
        'Try a 5-minute grounding exercise',
      ],
      isProfessionalSupportRecommended: false,
    };
  }

  return {
    period: range,
    dataSufficiency: totalEventsAnalyzed >= 5 ? 'sufficient' : 'sparse',
    totalEventsAnalyzed,
    overallTrend,
    overallTrendLabel,
    moodTrend,
    sleepTrend,
    cognitiveLoadTrend,
    lifestyleTrend,
    feedbackTrend,
    conditionPatterns,
    activityUsage,
    observations,
    nextStep,
    disclaimer,
  };
}

// ---------------------------------------------------------------------------
// LAYER 3: OPTIONAL AI SUMMARY (PRIVACY-SAFE AGGREGATE SUMMARY ONLY)
// ---------------------------------------------------------------------------

export async function generateAIInsightsSummary(
  trend: InsightsResult
): Promise<{ narrative: string; keyPoints: string[]; suggestedFocus: string } | null> {
  // Only send structured aggregate numbers — NEVER send raw text or PII
  const payload = {
    period: trend.period,
    data_sufficiency: trend.dataSufficiency,
    overall_trend: trend.overallTrend,
    mood_trend: trend.moodTrend.available
      ? { direction: trend.moodTrend.direction, earlier_avg: trend.moodTrend.earlierAvg, recent_avg: trend.moodTrend.recentAvg }
      : null,
    feedback_summary: trend.feedbackTrend.available
      ? { total: trend.feedbackTrend.totalCount, improved: trend.feedbackTrend.improvedCount, avg_pts: trend.feedbackTrend.avgImprovementPoints }
      : null,
    sleep_trend: trend.sleepTrend.available ? { direction: trend.sleepTrend.direction, recent_hours: trend.sleepTrend.recentAvg } : null,
    top_activities: trend.activityUsage.map((a) => a.name).slice(0, 3),
  };

  try {
    const prompt = `You are a supportive mental wellbeing insights assistant.
Given this privacy-safe aggregate data summary:
${JSON.stringify(payload, null, 2)}

Provide a concise, empathetic, non-clinical summary.
Rules:
1. Do NOT claim a clinical diagnosis or medical treatment.
2. Keep narrative under 60 words.
3. Return ONLY valid JSON:
{
  "narrative": "<supportive 2-3 sentence overview>",
  "keyPoints": ["<point 1>", "<point 2>"],
  "suggestedFocus": "<short 1-line suggestion>"
}`;

    const { data, error } = await supabase.functions.invoke('analyse', {
      body: { prompt, extraction: { emotional_state: ['insights_summary'], symptoms: ['trend_analysis'] } },
    });

    if (error || !data) {
      return null;
    }

    const res = data.result?.immediate_response;
    if (res && typeof res.message === 'string') {
      return {
        narrative: res.message,
        keyPoints: res.suggested_actions || ['Continue tracking check-ins', 'Focus on restful habits'],
        suggestedFocus: 'Maintain a steady daily wellbeing routine.',
      };
    }
    return null;
  } catch {
    // Return null on failure — Layer 2 deterministic UI handles fallback cleanly
    return null;
  }
}

/**
 * Load user events and compute insights asynchronously
 */
export async function getInsightsForUser(
  userId: string,
  range: TimeRangeOption = '7d',
  storeState?: Record<string, unknown>
): Promise<InsightsResult> {
  let events: JournalActivityEvent[] = [];

  if (userId && userId !== 'demo-user-id') {
    events = await fetchUserJournalData(userId);
  } else if (storeState) {
    events = getLocalJournalEvents(storeState);
  }

  return calculateTrends(events, range);
}

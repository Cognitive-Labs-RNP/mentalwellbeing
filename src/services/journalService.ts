import { supabase } from '../lib/supabase';
import type {
  JournalActivityEvent,
  FeedbackSubmission,
  BeforeAfterCluster,
  FeedbackStatus,
  DateFilterOption,
  TypeFilterOption,
} from '../types/journal';
import type {
  AnalysisRow,
  ActivityLogRow,
  ToolRecordRow,
  HealthRecordRow,
  FeedbackRow,
} from '../types/db';

function isPersistableUser(userId: string): boolean {
  return Boolean(userId) && userId !== 'demo-user-id';
}

/**
 * Capitalizes a condition string cleanly for UI display (e.g. 'anxiety' -> 'Anxiety')
 */

function formatConditionName(cond?: string | null): string {
  if (!cond) return 'General Wellbeing';
  return cond
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ---------------------------------------------------------------------------
// FETCH & NORMALIZE USER JOURNAL DATA
// ---------------------------------------------------------------------------

export async function fetchUserJournalData(userId: string): Promise<JournalActivityEvent[]> {
  if (!isPersistableUser(userId)) {
    return [];
  }

  try {
    const [analysesRes, activitiesRes, toolRecordsRes, healthRecordsRes, feedbackRes] =
      await Promise.all([
        supabase
          .from('analyses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('tool_records')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('health_records')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('feedback')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      ]);

    const events: JournalActivityEvent[] = [];

    // 1. Analyses
    if (analysesRes.data) {
      (analysesRes.data as AnalysisRow[]).forEach((row) => {
        const condName = formatConditionName(row.condition);
        events.push({
          id: `analysis-${row.id}`,
          userId: row.user_id,
          timestamp: row.created_at,
          type: 'analysis',
          title: 'Analysis',
          subtitle: `${condName}-related symptoms detected`,
          score: row.similarity_score,
          conditionId: row.condition,
          details: {
            conditionName: condName,
            matchPercentage: row.similarity_score,
            message: `Your reported patterns matched symptoms associated with ${condName.toLowerCase()} by ${row.similarity_score}%.`,
            disclaimer: 'This is an informational pattern match based on reported symptoms, not a clinical diagnosis.',
            structuredSummary: row.structured_summary,
          },
          rawRecord: row,
        });
      });
    }

    // 2. Condition Workspace Activity Logs
    if (activitiesRes.data) {
      (activitiesRes.data as ActivityLogRow[]).forEach((row) => {
        const condName = formatConditionName(row.condition);
        const durationText = row.duration ? `${row.duration} minutes` : 'Completed';
        events.push({
          id: `act-${row.id}`,
          userId: row.user_id,
          timestamp: row.created_at,
          type: 'condition_activity',
          title: 'Condition Workspace',
          subtitle: row.activity_name,
          completed: row.completed,
          conditionId: row.condition,
          details: {
            activityName: row.activity_name,
            activityId: row.activity_id,
            conditionName: condName,
            durationMinutes: row.duration,
            durationText,
            completed: row.completed,
          },
          rawRecord: row,
        });
      });
    }

    // 3. Global Tools (tool_records)
    if (toolRecordsRes.data) {
      (toolRecordsRes.data as ToolRecordRow[]).forEach((row) => {
        const meta = (row.metadata || {}) as Record<string, unknown>;
        if (row.tool_name === 'mood_check') {
          events.push({
            id: `mood-${row.id}`,
            userId: row.user_id,
            timestamp: row.created_at,
            type: 'mood',
            title: 'Mood Check',
            subtitle: `${row.value}/10`,
            score: row.value ?? undefined,
            completed: true,
            details: {
              intensity: row.value,
              moodLabel: meta.mood,
              emotions: meta.emotions,
              note: meta.note,
            },
            rawRecord: row,
          });
        } else if (row.tool_name === 'calm_session') {
          const soundTitle = (meta.sound_title as string) || 'Sound Session';
          const completed = Boolean(row.completed ?? meta.completed);
          const duration = row.value || 5;
          events.push({
            id: `sound-${row.id}`,
            userId: row.user_id,
            timestamp: row.created_at,
            type: 'sound',
            title: 'Sound',
            subtitle: soundTitle,
            completed,
            details: {
              soundTitle,
              soundId: meta.sound_id,
              durationMinutes: duration,
              statusText: completed ? 'Completed ✓' : 'Stopped',
            },
            rawRecord: row,
          });
        } else if (row.tool_name === 'cognitive_caffeine') {
          events.push({
            id: `caffeine-${row.id}`,
            userId: row.user_id,
            timestamp: row.created_at,
            type: 'caffeine',
            title: 'Cognitive Load + Caffeine',
            subtitle: `Load Score: ${row.value}/10 • ${meta.caffeine_mg || 0} mg`,
            score: row.value ?? undefined,
            completed: true,
            details: {
              loadScore: row.value,
              caffeineMg: meta.caffeine_mg,
              guidanceText: meta.guidance_text,
            },
            rawRecord: row,
          });
        } else if (row.tool_name === 'sleep') {
          events.push({
            id: `sleep-${row.id}`,
            userId: row.user_id,
            timestamp: row.created_at,
            type: 'sleep',
            title: 'Sleep Tracker',
            subtitle: `${row.value} hrs • Quality: ${meta.sleep_quality}/10`,
            score: row.value ?? undefined,
            completed: true,
            details: {
              durationHours: row.value,
              bedtime: meta.bedtime,
              wakeTime: meta.wake_time,
              sleepQuality: meta.sleep_quality,
              awakeningsCount: meta.awakenings_count,
              notes: meta.notes,
            },
            rawRecord: row,
          });
        } else if (row.tool_name === 'lifestyle') {
          events.push({
            id: `lifestyle-${row.id}`,
            userId: row.user_id,
            timestamp: row.created_at,
            type: 'lifestyle',
            title: 'Lifestyle Tracker',
            subtitle: `Activity: ${meta.physical_activity_mins || 0} mins • Hydration: ${meta.hydration_ml || 0} ml`,
            completed: true,
            details: meta,
            rawRecord: row,
          });
        } else if (row.tool_name === 'health') {
          events.push({
            id: `health-${row.id}`,
            userId: row.user_id,
            timestamp: row.created_at,
            type: 'health',
            title: 'General Health Tracker',
            subtitle: `BMI: ${row.value} (${meta.bmi_category || 'Calculated'})`,
            score: row.value ?? undefined,
            completed: true,
            details: meta,
            rawRecord: row,
          });
        } else if (row.tool_name === 'gratitude_log') {
          events.push({
            id: `gratitude-${row.id}`,
            userId: row.user_id,
            timestamp: row.created_at,
            type: 'mood',
            title: 'Gratitude Logger',
            subtitle: `${(meta.items as string[])?.length || 0} gratitude notes`,
            completed: true,
            details: meta,
            rawRecord: row,
          });
        }
      });
    }

    // 4. Health Records (Fallback if not mirrored in tool_records)
    if (healthRecordsRes.data) {
      (healthRecordsRes.data as HealthRecordRow[]).forEach((row) => {
        const existingMirror = events.some((e) => e.type === 'health' && Math.abs(new Date(e.timestamp).getTime() - new Date(row.created_at).getTime()) < 5000);
        if (!existingMirror) {
          events.push({
            id: `healthrec-${row.id}`,
            userId: row.user_id,
            timestamp: row.created_at,
            type: 'health',
            title: 'General Health Tracker',
            subtitle: `BMI: ${row.bmi} (${row.bmi_category})`,
            score: row.bmi,
            completed: true,
            details: {
              heightCm: row.height_cm,
              weightKg: row.weight_kg,
              age: row.age,
              activityLevel: row.activity_level,
              bmi: row.bmi,
              bmiCategory: row.bmi_category,
            },
            rawRecord: row,
          });
        }
      });
    }

    // 5. Feedback
    if (feedbackRes.data) {
      (feedbackRes.data as FeedbackRow[]).forEach((row) => {
        const before = row.before_intensity ?? row.before_mood ?? row.before_stress ?? 8;
        const after = row.after_intensity ?? row.after_mood ?? row.after_stress ?? 5;
        const improvement = row.improvement ?? (before - after);
        const status: FeedbackStatus =
          row.status === 'Worsened' || improvement < 0
            ? 'Worsened'
            : row.status === 'No significant change' || improvement === 0
            ? 'No significant change'
            : 'Improved';

        const condName = formatConditionName(row.condition);

        events.push({
          id: `feedback-${row.id}`,
          userId: row.user_id,
          timestamp: row.created_at,
          type: 'feedback',
          title: 'Feedback',
          subtitle: `${before}/10 → ${after}/10 (${status})`,
          conditionId: row.condition ?? undefined,
          score: improvement,
          completed: true,
          details: {
            beforeIntensity: before,
            afterIntensity: after,
            improvement,
            status,
            currentFeeling: row.current_feeling || '🙂',
            comment: row.feedback_text,
            conditionName: condName,
            relatedActivity: row.related_activity,
          },
          rawRecord: row,
        });
      });
    }

    // Sort chronologically (newest first)
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return events;
  } catch (err) {
    console.error('[journalService] fetchUserJournalData caught error:', err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// MAP LOCAL ZUSTAND STORE TO JOURNAL EVENTS FOR DEMO/GUEST USERS
// ---------------------------------------------------------------------------

export function getLocalJournalEvents(storeState: Record<string, unknown>): JournalActivityEvent[] {
  const events: JournalActivityEvent[] = [];

  // 1. Pattern Matches
  if (Array.isArray(storeState.patternMatches)) {
    storeState.patternMatches.forEach((p: Record<string, unknown>, idx: number) => {
      const condName = formatConditionName(p.conditionId as string);
      events.push({
        id: `demo-pm-${idx}-${p.timestamp}`,
        userId: 'demo-user-id',
        timestamp: (p.timestamp as string) || new Date().toISOString(),
        type: 'analysis',
        title: 'Analysis',
        subtitle: `${condName}-related symptoms detected`,
        score: p.similarityPercent as number,
        conditionId: p.conditionId as string,
        details: {
          conditionName: condName,
          matchPercentage: p.similarityPercent,
          message: `Your reported patterns matched symptoms associated with ${condName.toLowerCase()} by ${p.similarityPercent}%.`,
          disclaimer: 'This is an informational pattern match based on reported symptoms, not a clinical diagnosis.',
        },
        rawRecord: p,
      });
    });
  }

  // 2. Activity Records
  if (Array.isArray(storeState.activityRecords)) {
    storeState.activityRecords.forEach((act: Record<string, unknown>) => {
      const condName = formatConditionName(act.conditionId as string);
      const durationText = act.durationMinutes ? `${act.durationMinutes} minutes` : 'Completed';
      events.push({
        id: `demo-act-${act.id}`,
        userId: 'demo-user-id',
        timestamp: (act.completedAt || act.startedAt || new Date().toISOString()) as string,
        type: 'condition_activity',
        title: 'Condition Workspace',
        subtitle: act.title as string,
        completed: Boolean(act.completedAt),
        conditionId: act.conditionId as string,
        details: {
          activityName: act.title,
          activityId: act.activityId,
          conditionName: condName,
          durationMinutes: act.durationMinutes,
          durationText,
          completed: Boolean(act.completedAt),
        },
        rawRecord: act,
      });
    });
  }

  // 3. Mood Checks
  if (Array.isArray(storeState.moodChecks)) {
    storeState.moodChecks.forEach((m: Record<string, unknown>) => {
      events.push({
        id: `demo-mood-${m.id}`,
        userId: 'demo-user-id',
        timestamp: (m.timestamp || new Date().toISOString()) as string,
        type: 'mood',
        title: 'Mood Check',
        subtitle: `${m.mood}/10`,
        score: m.mood as number,
        completed: true,
        details: {
          intensity: m.mood,
          stress: m.stress,
          energy: m.energy,
          note: m.note,
        },
        rawRecord: m,
      });
    });
  }

  // 4. Cognitive Loads
  if (Array.isArray(storeState.cognitiveLoads)) {
    storeState.cognitiveLoads.forEach((c: Record<string, unknown>) => {
      events.push({
        id: `demo-cog-${c.id}`,
        userId: 'demo-user-id',
        timestamp: (c.timestamp || new Date().toISOString()) as string,
        type: 'caffeine',
        title: 'Cognitive Load + Caffeine',
        subtitle: `Load Score: ${c.loadScore}/10 • ${c.caffeineMg || 0} mg`,
        score: c.loadScore as number,
        completed: true,
        details: {
          loadScore: c.loadScore,
          caffeineMg: c.caffeineMg,
          guidanceText: c.guidanceText,
        },
        rawRecord: c,
      });
    });
  }

  // 5. Lifestyle Entries
  if (Array.isArray(storeState.lifestyleEntries)) {
    storeState.lifestyleEntries.forEach((l: Record<string, unknown>) => {
      events.push({
        id: `demo-life-${l.id}`,
        userId: 'demo-user-id',
        timestamp: (l.timestamp || new Date().toISOString()) as string,
        type: 'lifestyle',
        title: 'Lifestyle Tracker',
        subtitle: `Activity: ${l.physicalActivityMins || 0} mins • Hydration: ${l.hydrationMl || 0} ml`,
        completed: true,
        details: l,
        rawRecord: l,
      });
    });
  }

  // 6. Sleep Entries
  if (Array.isArray(storeState.sleepEntries)) {
    storeState.sleepEntries.forEach((s: Record<string, unknown>) => {
      events.push({
        id: `demo-sleep-${s.id}`,
        userId: 'demo-user-id',
        timestamp: (s.timestamp || new Date().toISOString()) as string,
        type: 'sleep',
        title: 'Sleep Tracker',
        subtitle: `${s.durationHours} hrs • Quality: ${s.sleepQuality}/10`,
        score: s.durationHours as number,
        completed: true,
        details: {
          durationHours: s.durationHours,
          bedtime: s.bedtime,
          wakeTime: s.wakeTime,
          sleepQuality: s.sleepQuality,
          awakeningsCount: s.awakeningsCount,
          notes: s.notes,
        },
        rawRecord: s,
      });
    });
  }

  // 7. Calm Sessions
  if (Array.isArray(storeState.calmSessions)) {
    storeState.calmSessions.forEach((cs: Record<string, unknown>) => {
      events.push({
        id: `demo-sound-${cs.id}`,
        userId: 'demo-user-id',
        timestamp: (cs.startedAt || new Date().toISOString()) as string,
        type: 'sound',
        title: 'Sound',
        subtitle: cs.soundName as string,
        completed: Boolean(cs.completed),
        details: {
          soundTitle: cs.soundName,
          soundId: cs.soundId,
          durationMinutes: cs.durationMinutes,
          statusText: cs.completed ? 'Completed ✓' : 'Stopped',
        },
        rawRecord: cs,
      });
    });
  }

  // 8. Journey Feedback Entries
  if (Array.isArray(storeState.journeyEntries)) {
    storeState.journeyEntries.forEach((je: Record<string, unknown>) => {
      const fb = je.feedback as Record<string, number> | undefined;
      if (fb) {
        const before = Math.round(((fb.moodBefore || 5) + (10 - (fb.stressBefore || 5))) / 2);
        const after = Math.round(((fb.moodAfter || 5) + (10 - (fb.stressAfter || 5))) / 2);
        const improvement = before - after;
        const status: FeedbackStatus = improvement > 0 ? 'Improved' : improvement === 0 ? 'No significant change' : 'Worsened';
        events.push({
          id: `demo-fb-${je.date}`,
          userId: 'demo-user-id',
          timestamp: `${je.date}T12:00:00.000Z`,
          type: 'feedback',
          title: 'Feedback',
          subtitle: `${before}/10 → ${after}/10 (${status})`,
          score: improvement,
          completed: true,
          details: {
            beforeIntensity: before,
            afterIntensity: after,
            improvement,
            status,
            currentFeeling: (fb.moodAfter || 5) >= 7 ? '😄' : (fb.moodAfter || 5) >= 5 ? '🙂' : '😐',
          },
          rawRecord: fb,
        });
      }
    });
  }

  // Sort newest first
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return events;
}

// ---------------------------------------------------------------------------
// SAVE FEEDBACK (DETERMINISTIC PROGRESS CALCULATION)
// ---------------------------------------------------------------------------

export async function saveJournalFeedback(
  userId: string,
  payload: FeedbackSubmission
): Promise<JournalActivityEvent | null> {
  // Deterministic calculation: Before = 8, After = 5 => Improvement = 3
  const before = Math.min(10, Math.max(1, Math.round(payload.beforeIntensity)));
  const after = Math.min(10, Math.max(1, Math.round(payload.afterIntensity)));
  const improvement = before - after;

  let status: FeedbackStatus = 'No significant change';
  if (improvement > 0) {
    status = 'Improved';
  } else if (improvement < 0) {
    status = 'Worsened';
  }

  const insertData = {
    user_id: userId,
    condition: payload.relatedCondition || null,
    before_intensity: before,
    after_intensity: after,
    before_mood: before,
    after_mood: after,
    improvement,
    status,
    current_feeling: payload.currentFeeling,
    related_activity: payload.relatedActivity || null,
    feedback_text: payload.comment?.trim() || null,
  };

  if (!isPersistableUser(userId)) {
    // Demo user fallback event
    const nowIso = new Date().toISOString();
    return {
      id: `demo-fb-${Date.now()}`,
      userId,
      timestamp: nowIso,
      type: 'feedback',
      title: 'Feedback',
      subtitle: `${before}/10 → ${after}/10 (${status})`,
      score: improvement,
      completed: true,
      details: {
        beforeIntensity: before,
        afterIntensity: after,
        improvement,
        status,
        currentFeeling: payload.currentFeeling,
        comment: payload.comment,
        relatedActivity: payload.relatedActivity,
      },
      rawRecord: insertData,
    };
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('[journalService] saveJournalFeedback error:', error);
      return null;
    }

    const row = data as FeedbackRow;
    return {
      id: `feedback-${row.id}`,
      userId: row.user_id,
      timestamp: row.created_at,
      type: 'feedback',
      title: 'Feedback',
      subtitle: `${before}/10 → ${after}/10 (${status})`,
      score: improvement,
      completed: true,
      details: {
        beforeIntensity: before,
        afterIntensity: after,
        improvement,
        status,
        currentFeeling: row.current_feeling || payload.currentFeeling,
        comment: row.feedback_text,
        relatedActivity: row.related_activity,
      },
      rawRecord: row,
    };
  } catch (err) {
    console.error('[journalService] saveJournalFeedback caught error:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// BEFORE / AFTER RELATIONSHIP CLUSTERS
// ---------------------------------------------------------------------------

export function computeBeforeAfterClusters(events: JournalActivityEvent[]): BeforeAfterCluster[] {
  // Find all feedback events sorted oldest to newest
  const feedbackEvents = events
    .filter((e) => e.type === 'feedback')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const nonFeedbackEvents = events
    .filter((e) => e.type !== 'feedback')
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return feedbackEvents.map((fb, idx) => {
    const fbTime = new Date(fb.timestamp).getTime();
    // Preceding cutoff is either previous feedback timestamp or 3 hours prior
    const prevFbTime = idx > 0 ? new Date(feedbackEvents[idx - 1].timestamp).getTime() : fbTime - 3 * 60 * 60 * 1000;

    const precedingActivities = nonFeedbackEvents.filter((act) => {
      const actTime = new Date(act.timestamp).getTime();
      return actTime >= prevFbTime && actTime <= fbTime;
    });

    const d = fb.details as {
      beforeIntensity?: number;
      afterIntensity?: number;
      improvement?: number;
      status?: FeedbackStatus;
      currentFeeling?: string;
      comment?: string;
      conditionName?: string;
    };

    const beforeIntensity = d.beforeIntensity ?? 8;
    const afterIntensity = d.afterIntensity ?? 5;
    const improvement = d.improvement ?? beforeIntensity - afterIntensity;
    const status: FeedbackStatus = d.status ?? (improvement > 0 ? 'Improved' : improvement === 0 ? 'No significant change' : 'Worsened');

    let summaryText = `Your reported intensity ${
      improvement > 0
        ? `decreased by ${improvement} point${improvement > 1 ? 's' : ''}`
        : improvement < 0
        ? `increased by ${Math.abs(improvement)} point${Math.abs(improvement) > 1 ? 's' : ''}`
        : 'remained unchanged'
    } after these activities.`;

    return {
      feedbackId: fb.id,
      timestamp: fb.timestamp,
      beforeIntensity,
      afterIntensity,
      improvement,
      status,
      currentFeeling: d.currentFeeling || '🙂',
      comment: d.comment,
      relatedCondition: d.conditionName,
      precedingActivities,
      summaryText,
    };
  });
}

// ---------------------------------------------------------------------------
// FILTER HELPER
// ---------------------------------------------------------------------------

export function filterEvents(
  events: JournalActivityEvent[],
  dateFilter: DateFilterOption,
  typeFilter: TypeFilterOption
): JournalActivityEvent[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfToday - 6 * 24 * 60 * 60 * 1000;
  const startOfMonth = startOfToday - 30 * 24 * 60 * 60 * 1000;

  return events.filter((e) => {
    const t = new Date(e.timestamp).getTime();

    // Date filter
    if (dateFilter === 'today' && t < startOfToday) return false;
    if (dateFilter === 'week' && t < startOfWeek) return false;
    if (dateFilter === 'month' && t < startOfMonth) return false;

    // Type filter
    if (typeFilter === 'analysis' && e.type !== 'analysis') return false;
    if (typeFilter === 'condition' && e.type !== 'condition_activity') return false;
    if (
      typeFilter === 'tools' &&
      !['mood', 'sleep', 'lifestyle', 'caffeine', 'health', 'sound'].includes(e.type)
    ) {
      return false;
    }
    if (typeFilter === 'feedback' && e.type !== 'feedback') return false;

    return true;
  });
}

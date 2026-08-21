import { supabase } from '../lib/supabase';
import type { ToolRecordRow, HealthRecordRow } from '../types/db';

export interface SavedToolRecord {
  id: string;
  tool_name: string;
  value: number | null;
  unit: string | null;
  metadata: Record<string, unknown>;
  completed: boolean | null;
  created_at: string;
}

function isPersistableUser(userId: string): boolean {
  return Boolean(userId) && userId !== 'demo-user-id';
}

/**
 * Log tool usage entry into Supabase tool_usage table.
 */
export async function logToolUsage(userId: string, toolName: string, condition?: string): Promise<boolean> {
  if (!isPersistableUser(userId)) return true;
  try {
    const { error } = await supabase.from('tool_usage').insert({
      user_id: userId,
      tool_name: toolName,
      condition: condition ?? null,
    });
    if (error) console.error('[toolService] logToolUsage error:', error);
    return !error;
  } catch (err) {
    console.error('[toolService] logToolUsage caught error:', err);
    return false;
  }
}

/**
 * Save Mood Check entry to Supabase tool_records table.
 */
export async function saveMoodRecord(
  userId: string,
  intensity: number,
  moodLabel: string,
  emotions: string[],
  note?: string
): Promise<SavedToolRecord | null> {
  await logToolUsage(userId, 'mood_check');
  if (!isPersistableUser(userId)) return null;

  try {
    const { data, error } = await supabase
      .from('tool_records')
      .insert({
        user_id: userId,
        tool_name: 'mood_check',
        value: intensity,
        unit: 'intensity_1_10',
        completed: true,
        metadata: {
          mood: moodLabel,
          intensity,
          emotions,
          note: note?.trim() || null,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('[toolService] saveMoodRecord error:', error);
      return null;
    }
    return data as SavedToolRecord;
  } catch (err) {
    console.error('[toolService] saveMoodRecord caught error:', err);
    return null;
  }
}

/**
 * Save Cognitive Load + Caffeine entry to Supabase tool_records table.
 */
export async function saveCognitiveLoadRecord(
  userId: string,
  loadScore: number,
  caffeineMg: number,
  consumptionTime?: string,
  weightKg?: number,
  maxRecommendedMg?: number,
  guidanceText?: string
): Promise<SavedToolRecord | null> {
  await logToolUsage(userId, 'cognitive_caffeine');
  if (!isPersistableUser(userId)) return null;

  try {
    const { data, error } = await supabase
      .from('tool_records')
      .insert({
        user_id: userId,
        tool_name: 'cognitive_caffeine',
        value: loadScore,
        unit: 'load_score_1_10',
        completed: true,
        metadata: {
          caffeine_mg: caffeineMg,
          consumption_time: consumptionTime || null,
          weight_kg: weightKg || null,
          max_recommended_mg: maxRecommendedMg || 400,
          guidance_text: guidanceText || null,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('[toolService] saveCognitiveLoadRecord error:', error);
      return null;
    }
    return data as SavedToolRecord;
  } catch (err) {
    console.error('[toolService] saveCognitiveLoadRecord caught error:', err);
    return null;
  }
}

/**
 * Save Daily Lifestyle Record to Supabase tool_records table.
 */
export async function saveLifestyleRecord(
  userId: string,
  lifestyleData: {
    physical_activity_mins: number;
    hydration_ml: number;
    meals_count: number;
    outdoor_mins: number;
    social_mins: number;
    screen_time_mins: number;
    relaxation_mins: number;
    routine_completed: boolean;
  }
): Promise<SavedToolRecord | null> {
  await logToolUsage(userId, 'lifestyle');
  if (!isPersistableUser(userId)) return null;

  try {
    const { data, error } = await supabase
      .from('tool_records')
      .insert({
        user_id: userId,
        tool_name: 'lifestyle',
        value: lifestyleData.routine_completed ? 100 : 50,
        unit: 'completion_percent',
        completed: true,
        metadata: lifestyleData as Record<string, unknown>,
      })
      .select()
      .single();

    if (error) {
      console.error('[toolService] saveLifestyleRecord error:', error);
      return null;
    }
    return data as SavedToolRecord;
  } catch (err) {
    console.error('[toolService] saveLifestyleRecord caught error:', err);
    return null;
  }
}

/**
 * Save Sleep Record to Supabase tool_records table.
 */
export async function saveSleepRecord(
  userId: string,
  bedtime: string,
  wakeTime: string,
  durationHours: number,
  sleepQuality: number,
  awakeningsCount: number,
  notes?: string
): Promise<SavedToolRecord | null> {
  await logToolUsage(userId, 'sleep');
  if (!isPersistableUser(userId)) return null;

  try {
    const { data, error } = await supabase
      .from('tool_records')
      .insert({
        user_id: userId,
        tool_name: 'sleep',
        value: durationHours,
        unit: 'hours',
        completed: true,
        metadata: {
          bedtime,
          wake_time: wakeTime,
          sleep_quality: sleepQuality,
          awakenings_count: awakeningsCount,
          notes: notes?.trim() || null,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('[toolService] saveSleepRecord error:', error);
      return null;
    }
    return data as SavedToolRecord;
  } catch (err) {
    console.error('[toolService] saveSleepRecord caught error:', err);
    return null;
  }
}

/**
 * Save General Health Record (BMI) to Supabase health_records & tool_records.
 */
export async function saveHealthRecord(
  userId: string,
  heightCm: number,
  weightKg: number,
  age: number | undefined,
  activityLevel: string,
  bmi: number,
  bmiCategory: string
): Promise<HealthRecordRow | null> {
  await logToolUsage(userId, 'health');
  if (!isPersistableUser(userId)) return null;

  try {
    const { data, error } = await supabase
      .from('health_records')
      .insert({
        user_id: userId,
        height_cm: heightCm,
        weight_kg: weightKg,
        age: age || null,
        activity_level: activityLevel,
        bmi,
        bmi_category: bmiCategory,
      })
      .select()
      .single();

    if (error) {
      console.error('[toolService] saveHealthRecord error:', error);
      return null;
    }

    const { error: mirrorError } = await supabase.from('tool_records').insert({
      user_id: userId,
      tool_name: 'health',
      value: bmi,
      unit: 'bmi',
      completed: true,
      metadata: {
        height_cm: heightCm,
        weight_kg: weightKg,
        age: age || null,
        activity_level: activityLevel,
        bmi_category: bmiCategory,
      },
    });

    if (mirrorError) {
      console.error('[toolService] saveHealthRecord tool_records error:', mirrorError);
      return null;
    }

    return data as HealthRecordRow;
  } catch (err) {
    console.error('[toolService] saveHealthRecord caught error:', err);
    return null;
  }
}

/**
 * Save Sound Session completion/stopped state to Supabase tool_records table.
 */
export async function saveCalmSessionRecord(
  userId: string,
  soundId: string,
  soundTitle: string,
  durationMinutes: number,
  completed: boolean
): Promise<SavedToolRecord | null> {
  await logToolUsage(userId, 'sound_library');
  if (!isPersistableUser(userId)) return null;

  try {
    const { data, error } = await supabase
      .from('tool_records')
      .insert({
        user_id: userId,
        tool_name: 'calm_session',
        value: durationMinutes,
        unit: 'minutes',
        completed,
        metadata: {
          sound_id: soundId,
          sound_title: soundTitle,
          completed,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('[toolService] saveCalmSessionRecord error:', error);
      return null;
    }
    return data as SavedToolRecord;
  } catch (err) {
    console.error('[toolService] saveCalmSessionRecord caught error:', err);
    return null;
  }
}

/**
 * Save Gratitude & Intention entry to Supabase tool_records table.
 */
export async function saveGratitudeRecord(
  userId: string,
  items: string[],
  intention?: string,
  moodAfter?: number
): Promise<SavedToolRecord | null> {
  await logToolUsage(userId, 'gratitude_log');
  if (!isPersistableUser(userId)) return null;

  try {
    const { data, error } = await supabase
      .from('tool_records')
      .insert({
        user_id: userId,
        tool_name: 'gratitude_log',
        value: moodAfter || 8,
        unit: 'score_1_10',
        completed: true,
        metadata: {
          items,
          intention: intention || null,
          mood_after: moodAfter || null,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('[toolService] saveGratitudeRecord error:', error);
      return null;
    }
    return data as SavedToolRecord;
  } catch (err) {
    console.error('[toolService] saveGratitudeRecord caught error:', err);
    return null;
  }
}

/**
 * Fetch past records for a given tool name for the user.
 */
export async function fetchToolHistory(
  userId: string,
  toolName: string,
  limit: number = 20
): Promise<SavedToolRecord[]> {
  if (!isPersistableUser(userId)) return [];

  try {
    const query = () =>
      supabase
        .from('tool_records')
        .select('id, tool_name, value, unit, metadata, completed, created_at')
        .eq('user_id', userId)
        .eq('tool_name', toolName)
        .order('created_at', { ascending: false })
        .limit(limit);

    let { data, error } = await query();

    if (error) {
      const fallback = await supabase
        .from('tool_records')
        .select('id, tool_name, value, unit, metadata, created_at')
        .eq('user_id', userId)
        .eq('tool_name', toolName)
        .order('created_at', { ascending: false })
        .limit(limit);
      data = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error('[toolService] fetchToolHistory error:', error);
      return [];
    }
    return (data as SavedToolRecord[]) || [];
  } catch (err) {
    console.error('[toolService] fetchToolHistory caught error:', err);
    return [];
  }
}

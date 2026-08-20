/**
 * storage.ts — Database abstraction layer
 *
 * All Supabase queries live here. React components never import supabase
 * directly — they call these typed functions instead.
 *
 * Phase 1 implements only the functions needed for this phase.
 * Later phases will add to this file without changing its structure.
 */

import { supabase } from '../lib/supabase';
import type {
  ProfileRow,
  AnalysisRow,
  ConditionProgressRow,
  ActivityLogRow,
  ToolUsageRow,
  ToolRecordRow,
  FeedbackRow,
  InsertAnalysis,
  InsertConditionProgress,
  InsertActivityLog,
  InsertToolUsage,
  InsertToolRecord,
  InsertFeedback,
  StructuredSummaryJson,
} from '../types/db';

// ---------------------------------------------------------------------------
// Result wrapper
// ---------------------------------------------------------------------------

export interface DbResult<T> {
  data: T | null;
  error: string | null;
}

function ok<T>(data: T): DbResult<T> {
  return { data, error: null };
}

function err<T>(message: string): DbResult<T> {
  console.error('[storage]', message);
  return { data: null, error: message };
}

// ---------------------------------------------------------------------------
// PROFILES
// ---------------------------------------------------------------------------

/**
 * Fetch the profile row for the currently authenticated user.
 * Returns null if no profile exists yet (e.g. trigger hasn't run).
 */
export async function getProfile(userId: string): Promise<DbResult<ProfileRow>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No row found — not an error, profile may not exist yet
      return ok(null as unknown as ProfileRow);
    }
    return err(error.message);
  }
  return ok(data);
}

/**
 * Upsert a profile row.
 * Normally the handle_new_user DB trigger creates this automatically.
 * This function is a safety fallback if the trigger hasn't run yet.
 */
export async function createProfile(
  userId: string,
  uid: string
): Promise<DbResult<ProfileRow>> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, uid }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// ANALYSES
// ---------------------------------------------------------------------------

/**
 * Persist a processed analysis result.
 * IMPORTANT: structured_summary must never contain raw user text —
 * only derived scores and tags from the privacy filter.
 */
export async function saveAnalysis(
  userId: string,
  condition: string,
  similarityScore: number,
  structuredSummary: StructuredSummaryJson
): Promise<DbResult<AnalysisRow>> {
  const insert: InsertAnalysis = {
    user_id: userId,
    condition,
    similarity_score: similarityScore,
    structured_summary: structuredSummary,
  };

  const { data, error } = await supabase
    .from('analyses')
    .insert(insert)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data);
}

/**
 * Fetch the analysis history for the authenticated user, newest first.
 * @param limit  Maximum number of rows to return (default 50).
 */
export async function getAnalysisHistory(
  userId: string,
  limit = 50
): Promise<DbResult<AnalysisRow[]>> {
  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// CONDITION PROGRESS
// ---------------------------------------------------------------------------

/**
 * Upsert a condition progress record.
 * On first detection: inserts a new row.
 * On subsequent detections: updates last_used_at and is_active.
 */
export async function saveConditionProgress(
  userId: string,
  condition: string,
  isActive = true
): Promise<DbResult<ConditionProgressRow>> {
  // Check if a row already exists for this user+condition
  const { data: existing } = await supabase
    .from('condition_progress')
    .select('id')
    .eq('user_id', userId)
    .eq('condition', condition)
    .single();

  if (existing) {
    // Update last_used_at and is_active
    const { data, error } = await supabase
      .from('condition_progress')
      .update({ last_used_at: new Date().toISOString(), is_active: isActive })
      .eq('user_id', userId)
      .eq('condition', condition)
      .select()
      .single();

    if (error) return err(error.message);
    return ok(data);
  }

  // Insert new row
  const insert: InsertConditionProgress = {
    user_id: userId,
    condition,
    is_active: isActive,
  };

  const { data, error } = await supabase
    .from('condition_progress')
    .insert(insert)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data);
}

/**
 * Fetch all condition progress rows for the user.
 * Returns active conditions first, then by last_used_at descending.
 */
export async function getConditionProgress(
  userId: string
): Promise<DbResult<ConditionProgressRow[]>> {
  const { data, error } = await supabase
    .from('condition_progress')
    .select('*')
    .eq('user_id', userId)
    .order('is_active', { ascending: false })
    .order('last_used_at', { ascending: false });

  if (error) return err(error.message);
  return ok(data ?? []);
}

// ---------------------------------------------------------------------------
// ACTIVITY LOGS
// ---------------------------------------------------------------------------

/**
 * Log a condition activity attempt or completion.
 */
export async function logActivity(
  userId: string,
  payload: Omit<InsertActivityLog, 'user_id'>
): Promise<DbResult<ActivityLogRow>> {
  const insert: InsertActivityLog = { user_id: userId, ...payload };

  const { data, error } = await supabase
    .from('activity_logs')
    .insert(insert)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// TOOL USAGE
// ---------------------------------------------------------------------------

/**
 * Record that a tool was opened/used.
 */
export async function logToolUsage(
  userId: string,
  toolName: string,
  condition: string | null = null
): Promise<DbResult<ToolUsageRow>> {
  const insert: InsertToolUsage = {
    user_id: userId,
    tool_name: toolName,
    condition,
  };

  const { data, error } = await supabase
    .from('tool_usage')
    .insert(insert)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// TOOL RECORDS
// ---------------------------------------------------------------------------

/**
 * Save a numerical/structured measurement from a tool.
 *
 * @example
 *   await saveToolRecord(userId, 'mood-check', 7, 'score', { energy: 6, stress: 4 });
 *   await saveToolRecord(userId, 'sleep', 7.5, 'hours', { quality: 8, awakenings: 1 });
 */
export async function saveToolRecord(
  userId: string,
  toolName: string,
  value: number | null,
  unit: string | null,
  metadata: Record<string, unknown> = {}
): Promise<DbResult<ToolRecordRow>> {
  const insert: InsertToolRecord = {
    user_id: userId,
    tool_name: toolName,
    value,
    unit,
    metadata,
  };

  const { data, error } = await supabase
    .from('tool_records')
    .insert(insert)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data);
}

// ---------------------------------------------------------------------------
// FEEDBACK
// ---------------------------------------------------------------------------

/**
 * Save before/after mood and stress feedback.
 */
export async function saveFeedback(
  userId: string,
  payload: Omit<InsertFeedback, 'user_id'>
): Promise<DbResult<FeedbackRow>> {
  const insert: InsertFeedback = { user_id: userId, ...payload };

  const { data, error } = await supabase
    .from('feedback')
    .insert(insert)
    .select()
    .single();

  if (error) return err(error.message);
  return ok(data);
}

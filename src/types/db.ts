// ---------------------------------------------------------------------------
// Database types for the Supabase schema defined in
// supabase/migrations/001_initial_schema.sql & 002_phase5_tools_schema.sql
//
// These are the shapes of rows as they exist in Postgres.
// Keep them separate from the UI/store types in types/index.ts.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Row types (what Supabase returns from SELECT queries)
// ---------------------------------------------------------------------------

export interface ProfileRow {
  id: string;           // uuid
  user_id: string;      // uuid — references auth.users.id
  uid: string;          // WB-XXXXXX visible to the user
  created_at: string;   // ISO timestamptz
}

export interface AnalysisRow {
  id: string;
  user_id: string;
  condition: string;
  similarity_score: number;
  /** JSONB — contains mood/stress/energy scores and context tags, never raw text */
  structured_summary: StructuredSummaryJson;
  created_at: string;
}

/** Shape of the structured_summary JSONB column */
export interface StructuredSummaryJson {
  mood: number;
  stress: number;
  energy: number;
  context_tags: string[];
}

export interface ConditionProgressRow {
  id: string;
  user_id: string;
  condition: string;
  first_detected_at: string;
  last_used_at: string;
  is_active: boolean;
}

export interface ActivityLogRow {
  id: string;
  user_id: string;
  condition: string;
  activity_id: string;
  activity_name: string;
  completed: boolean;
  duration: number | null;
  created_at: string;
}

export interface ToolUsageRow {
  id: string;
  user_id: string;
  tool_name: string;
  condition: string | null;
  created_at: string;
}

export interface ToolRecordRow {
  id: string;
  user_id: string;
  tool_name: string;
  value: number | null;
  unit: string | null;
  /** Flexible JSONB for tool-specific data */
  metadata: Record<string, unknown>;
  /** Null on legacy rows; true when the entry/session was completed */
  completed: boolean | null;
  created_at: string;
}

export interface HealthRecordRow {
  id: string;
  user_id: string;
  height_cm: number;
  weight_kg: number;
  age: number | null;
  activity_level: string | null;
  bmi: number;
  bmi_category: string;
  created_at: string;
}

export interface FeedbackRow {
  id: string;
  user_id: string;
  condition: string | null;
  before_mood: number | null;
  after_mood: number | null;
  before_stress: number | null;
  after_stress: number | null;
  feedback_text: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Insert types (what we send to Supabase on INSERT)
// Omit server-generated fields (id, created_at).
// ---------------------------------------------------------------------------

export type InsertProfile = Omit<ProfileRow, 'id' | 'created_at'>;

export type InsertAnalysis = Omit<AnalysisRow, 'id' | 'created_at'>;

export type InsertConditionProgress = Omit<
  ConditionProgressRow,
  'id' | 'first_detected_at' | 'last_used_at'
>;

export type InsertActivityLog = Omit<ActivityLogRow, 'id' | 'created_at'>;

export type InsertToolUsage = Omit<ToolUsageRow, 'id' | 'created_at'>;

export type InsertToolRecord = Omit<ToolRecordRow, 'id' | 'created_at' | 'completed'> & {
  completed?: boolean | null;
};

export type InsertHealthRecord = Omit<HealthRecordRow, 'id' | 'created_at'>;

export type InsertFeedback = Omit<FeedbackRow, 'id' | 'created_at'>;

// ---------------------------------------------------------------------------
// Database generic type used by the typed Supabase client
// (createClient<Database>)
// ---------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: InsertProfile;
        Update: Partial<InsertProfile>;
      };
      analyses: {
        Row: AnalysisRow;
        Insert: InsertAnalysis;
        Update: Partial<InsertAnalysis>;
      };
      condition_progress: {
        Row: ConditionProgressRow;
        Insert: InsertConditionProgress;
        Update: Partial<InsertConditionProgress>;
      };
      activity_logs: {
        Row: ActivityLogRow;
        Insert: InsertActivityLog;
        Update: Partial<InsertActivityLog>;
      };
      tool_usage: {
        Row: ToolUsageRow;
        Insert: InsertToolUsage;
        Update: Partial<InsertToolUsage>;
      };
      tool_records: {
        Row: ToolRecordRow;
        Insert: InsertToolRecord;
        Update: Partial<InsertToolRecord>;
      };
      health_records: {
        Row: HealthRecordRow;
        Insert: InsertHealthRecord;
        Update: Partial<InsertHealthRecord>;
      };
      feedback: {
        Row: FeedbackRow;
        Insert: InsertFeedback;
        Update: Partial<InsertFeedback>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

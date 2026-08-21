// ---------------------------------------------------------------------------
// Journal & Journey Types (Phase 6)
// ---------------------------------------------------------------------------

export type ActivityEventType =
  | 'analysis'
  | 'condition_activity'
  | 'mood'
  | 'sleep'
  | 'lifestyle'
  | 'caffeine'
  | 'health'
  | 'sound'
  | 'feedback';

export interface JournalActivityEvent {
  id: string;
  userId: string;
  timestamp: string; // ISO timestamptz
  type: ActivityEventType;
  title: string;
  subtitle?: string;
  details: Record<string, unknown>;
  conditionId?: string;
  score?: number;
  completed?: boolean;
  rawRecord: unknown;
}

export type FeedbackStatus = 'Improved' | 'No significant change' | 'Worsened';

export interface FeedbackSubmission {
  beforeIntensity: number;
  afterIntensity: number;
  currentFeeling: string;
  comment?: string;
  relatedCondition?: string;
  relatedActivity?: string;
}

export interface BeforeAfterCluster {
  feedbackId: string;
  timestamp: string;
  beforeIntensity: number;
  afterIntensity: number;
  improvement: number;
  status: FeedbackStatus;
  currentFeeling: string;
  comment?: string;
  relatedCondition?: string;
  precedingActivities: JournalActivityEvent[];
  summaryText: string;
}

export type DateFilterOption = 'all' | 'today' | 'week' | 'month';
export type TypeFilterOption = 'all' | 'analysis' | 'condition' | 'tools' | 'feedback';

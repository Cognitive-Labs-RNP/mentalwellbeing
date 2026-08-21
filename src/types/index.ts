// ---------------------------------------------------------------------------
// Condition IDs — exactly 11 primary conditions + general-wellbeing fallback
// ---------------------------------------------------------------------------

export type ConditionId =
  | 'anxiety'
  | 'adhd'
  | 'ocd'
  | 'depressive-symptoms'
  | 'ptsd'
  | 'cognitive-overload'
  | 'burnout'
  | 'anger-irritation'
  | 'social-detachment'
  | 'self-esteem'
  | 'substance-related'
  | 'general-wellbeing'; // non-condition fallback / general support

// ---------------------------------------------------------------------------
// Sound library
// ---------------------------------------------------------------------------

export type SoundCategory = 'nature' | 'noise' | 'ambient';

export interface Sound {
  id: string;
  name: string;
  category: SoundCategory;
  /** Path relative to /public, e.g. /sounds/rain.mp3 */
  file: string;
  description: string;
  loopable: boolean;
  /** ConditionIds that benefit from this sound */
  recommendedFor: ConditionId[];
}

export type SolutionType =
  | 'breathing'
  | 'grounding'
  | 'meditation'
  | 'mind-clearing'
  | 'reflection'
  | 'relaxation'
  | 'thought-observation'
  | 'task-breaker'
  | 'focus-session'
  | 'task-prioritization'
  | 'movement'
  | 'tiny-step'
  | 'strengths-checklist'
  | 'urge-delay'
  | 'support-seeking'
  | 'confidence-building'
  | 'checklist';

/**
 * Single condition-specific solution shape according to Phase 4 spec.
 */
export interface ConditionSolution {
  id: string;
  title: string;
  purpose: string;
  type: SolutionType;
  durationSeconds?: number;
  instructions?: string[];
  recommendedSoundId?: string;
}

/** Full shape of a condition JSON file */
export interface ConditionConfig {
  conditionId: ConditionId;
  name: string;
  description: string;
  taskBreakerEnabled: boolean;
  recommendedSoundIds: string[];
  solutions: ConditionSolution[];
  safetyGuidance?: string;
}

// ---------------------------------------------------------------------------
// Activity tracking
// ---------------------------------------------------------------------------

export type ActivityType =
  | 'breathing'
  | 'grounding'
  | 'meditation'
  | 'journaling'
  | 'movement'
  | 'relaxation'
  | 'thought'
  | 'focus-timer'
  | 'other';

export interface Activity {
  id: string;
  conditionId: ConditionId;
  title: string;
  description?: string;
  type: ActivityType;
  durationMinutes: number;
  instructions?: string[];
}

export interface ActivityRecord {
  id: string;
  conditionId: ConditionId;
  activityId: string;
  activityType: string;
  title: string;
  startedAt: string;
  completedAt?: string;
  durationMinutes?: number;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

export type SimilarityLevel = 'low' | 'medium' | 'high';
export type ProgressSignal = 'improving' | 'stable' | 'declining';
export type MoodScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface StructuredSummary {
  mood: MoodScore;
  stress: MoodScore;
  energy: MoodScore;
  contextTags: string[];
  sanitisedDescription: string;
}

export interface PatternMatch {
  conditionId: ConditionId;
  similarityPercent: number;
  similarityLevel: SimilarityLevel;
  timestamp: string;
}

/**
 * Full result returned after an AI analysis run.
 * Extends PatternMatch with richer narrative context.
 */
export interface AnalysisResult extends PatternMatch {
  summary: StructuredSummary;
  suggestedConditionName: string;
  topInsights: string[];
  recommendedConditionIds: ConditionId[];
}

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

export interface ActivityFeedbackScores {
  helpfulness: MoodScore;
  easeOfUse: MoodScore;
  wouldRepeat: MoodScore;
}

/**
 * User feedback attached to a completed activity or session.
 */
export interface Feedback {
  id: string;
  activityId: string;
  conditionId: ConditionId;
  submittedAt: string;
  scores: ActivityFeedbackScores;
  /** Optional free-text comment */
  comment?: string;
}

// ---------------------------------------------------------------------------
// Tool usage
// ---------------------------------------------------------------------------

/**
 * Tracks which tools have been opened/used and how often,
 * to support personalisation and persistence later.
 */
export interface ToolUsage {
  toolId: string;
  conditionId: ConditionId | null;
  toolType: string;
  openedAt: string;
  completedAt?: string;
  durationMinutes?: number;
}

// ---------------------------------------------------------------------------
// Tracking entries
// ---------------------------------------------------------------------------

export interface MoodCheckEntry {
  id: string;
  timestamp: string;
  mood: MoodScore;
  stress: MoodScore;
  energy: MoodScore;
  note?: string;
}

export interface CognitiveLoadEntry {
  id: string;
  timestamp: string;
  load: MoodScore;
  context?: string;
}

export interface LifestyleEntry {
  id: string;
  timestamp: string;
  waterIntakeGlasses?: number;
  mealsEaten?: number;
  movementMinutes?: number;
  outdoorsMinutes?: number;
  alcoholUnits?: number;
  caffeineCups?: number;
}

export interface SleepEntry {
  id: string;
  timestamp: string;
  date: string;
  hoursSlept: number;
  quality: MoodScore;
  awakenings?: number;
}

export interface CalmSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  /** Sound id from the sound library */
  soundId?: string;
  technique: string;
}

// ---------------------------------------------------------------------------
// Journey / history
// ---------------------------------------------------------------------------

export interface JourneyEntry {
  date: string;
  moodCheckBefore?: MoodCheckEntry;
  analysis?: PatternMatch[];
  activitiesCompleted: ActivityRecord[];
  calmSessions: CalmSession[];
  toolsUsed: string[];
  feedback?: ActivityFeedbackScores;
  progressSignal?: ProgressSignal;
}

export interface ConditionHistoryItem {
  conditionId: ConditionId;
  firstDetectedAt: string;
  lastDetectedAt: string;
  matchCount: number;
  highestSimilarity: number;
}

// ---------------------------------------------------------------------------
// User / auth
// ---------------------------------------------------------------------------

export interface AnonymousAccount {
  uid: string;
  passwordHash: string;
  createdAt: string;
}

export interface ProviderPreferences {
  preferredTypes: string[];
  durationPreferenceMinutes: number;
  soundEnabled: boolean;
  defaultVolume: number;
  notificationsEnabled: boolean;
}

export interface UserProfile {
  displayName?: string;
  timezone: string;
  theme: 'system' | 'light' | 'dark';
  reducedMotion: boolean;
  aiPermissionsEnabled: boolean;
  providerPreferences: ProviderPreferences;
}

export interface UserState {
  account: AnonymousAccount | null;
  profile: UserProfile;
  activeCondition: ConditionId | null;
  moodChecks: MoodCheckEntry[];
  cognitiveLoads: CognitiveLoadEntry[];
  lifestyleEntries: LifestyleEntry[];
  sleepEntries: SleepEntry[];
  calmSessions: CalmSession[];
  activityRecords: ActivityRecord[];
  journeyEntries: JourneyEntry[];
  patternMatches: PatternMatch[];
  conditionHistory: ConditionHistoryItem[];
}

// ---------------------------------------------------------------------------
// Store actions
// ---------------------------------------------------------------------------

export type AppAction =
  | { type: 'createAccount'; account: AnonymousAccount }
  | { type: 'login'; uid: string; passwordHash: string }
  | { type: 'logout' }
  | { type: 'setActiveCondition'; conditionId: ConditionId | null }
  | { type: 'addPatternMatch'; match: PatternMatch }
  | { type: 'logMoodCheck'; entry: MoodCheckEntry }
  | { type: 'logCognitiveLoad'; entry: CognitiveLoadEntry }
  | { type: 'logLifestyle'; entry: LifestyleEntry }
  | { type: 'logSleep'; entry: SleepEntry }
  | { type: 'recordCalmSession'; session: CalmSession }
  | { type: 'startActivity'; activity: ActivityRecord }
  | { type: 'completeActivity'; activityId: string; completedAt: string; durationMinutes: number }
  | { type: 'submitFeedback'; date: string; scores: ActivityFeedbackScores }
  | { type: 'updateProviderPrefs'; prefs: Partial<ProviderPreferences> }
  | { type: 'updateProfile'; profile: Partial<UserProfile> }
  | { type: 'deleteData' }
  | { type: 'loadState'; state: UserState };

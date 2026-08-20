export type ConditionId =
  | 'anxiety'
  | 'depression'
  | 'burnout'
  | 'adhd'
  | 'ocd'
  | 'ptsd'
  | 'cognitive-overload'
  | 'anger-issues'
  | 'social-detachment'
  | 'social-anxiety'
  | 'self-esteem'
  | 'substance-related'
  | 'stress'
  | 'anger'
  | 'general-wellbeing';

export type SimilarityLevel = 'low' | 'medium' | 'high';

export type ProgressSignal = 'improving' | 'stable' | 'declining';

export type MoodScore = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface ActivityFeedbackScores {
  helpfulness: MoodScore;
  easeOfUse: MoodScore;
  wouldRepeat: MoodScore;
}

export interface AnonymousAccount {
  uid: string;
  passwordHash: string;
  createdAt: string;
}

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
  sound?: string;
  technique: string;
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

export interface ImmediateAction {
  id: string;
  title: string;
  durationMinutes: number;
  type: string;
  instructions: string[];
}

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  type: string;
}

export interface ConditionFile {
  conditionId: ConditionId;
  name: string;
  description: string;
  immediateActions: ImmediateAction[];
  tools: ToolItem[];
  recommendedSounds: string[];
  safetyGuidance: string;
}

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

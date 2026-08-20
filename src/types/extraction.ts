// =============================================================================
// Phase 2 — Extraction types
//
// These types describe the structured output produced by the local
// preprocessing pipeline (privacyFilter → localExtractor → preprocessor).
//
// The Phase 3 AI model will consume ExtractionResult as its input.
// Raw user text NEVER appears in these types.
// =============================================================================

// ---------------------------------------------------------------------------
// Controlled vocabularies
// ---------------------------------------------------------------------------

export type EmotionalState =
  | 'sadness'
  | 'anxiety'
  | 'anger'
  | 'fear'
  | 'loneliness'
  | 'guilt'
  | 'shame'
  | 'embarrassment'
  | 'frustration'
  | 'overwhelm'
  | 'irritation'
  | 'confusion'
  | 'disappointment'
  | 'hopelessness'
  | 'excitement'
  | 'happiness'
  | 'relief'
  | 'nervousness'
  | 'stress'
  | 'grief'
  | 'panic'
  | 'numbness';

export type Symptom =
  | 'headache'
  | 'dizziness'
  | 'nausea'
  | 'fatigue'
  | 'weakness'
  | 'racing heartbeat'
  | 'sweating'
  | 'trembling'
  | 'shortness of breath'
  | 'chest discomfort'
  | 'stomach discomfort'
  | 'difficulty sleeping'
  | 'oversleeping'
  | 'loss of appetite'
  | 'increased appetite'
  | 'difficulty concentrating'
  | 'restlessness'
  | 'crying'
  | 'muscle tension'
  | 'feeling numb'
  | 'low energy'
  | 'excessive worry'
  | 'intrusive thoughts'
  | 'brain fog';

export type Trigger =
  | 'exam'
  | 'assignment'
  | 'academic pressure'
  | 'workload'
  | 'argument'
  | 'conflict'
  | 'interpersonal conflict'
  | 'criticism'
  | 'rejection'
  | 'breakup'
  | 'friendship problem'
  | 'family conflict'
  | 'relationship issue'
  | 'financial concern'
  | 'social situation'
  | 'failure'
  | 'mistake'
  | 'deadline'
  | 'poor performance'
  | 'uncertainty about future'
  | 'loss'
  | 'change'
  | 'health concern'
  | 'work pressure'
  | 'public speaking'
  | 'isolation';

export type ActionTaken =
  | 'rested'
  | 'slept'
  | 'took a break'
  | 'talked to someone'
  | 'talked to a friend'
  | 'talked to family'
  | 'exercised'
  | 'walked'
  | 'meditated'
  | 'breathing exercise'
  | 'journaled'
  | 'studied'
  | 'distracted themselves'
  | 'drank water'
  | 'ate something'
  | 'tried to solve the problem'
  | 'avoided the situation'
  | 'sought professional help'
  | 'did nothing'
  | 'cried'
  | 'listened to music'
  | 'watched something';

export type ProgressSignalLocal =
  | 'improving'
  | 'worsening'
  | 'unchanged'
  | 'resolved'
  | 'no improvement'
  | 'fluctuating';

export type SeverityLevel =
  | 'mild'
  | 'moderate'
  | 'high'
  | 'severe'
  | 'unknown';

export type FrequencyLevel =
  | 'once'
  | 'rarely'
  | 'occasionally'
  | 'sometimes'
  | 'often'
  | 'frequently'
  | 'almost every day'
  | 'every day'
  | 'every night'
  | 'several times a day'
  | 'constantly'
  | 'comes and goes'
  | 'randomly'
  | 'recurring';

export type SituationState =
  | 'ongoing'
  | 'improving'
  | 'worsening'
  | 'resolved'
  | 'intermittent'
  | 'recurring'
  | 'first_occurrence'
  | 'frequent'
  | 'occasional'
  | 'not_currently_present';

export type ImpactArea =
  | 'studies'
  | 'work'
  | 'sleep'
  | 'appetite'
  | 'concentration'
  | 'motivation'
  | 'social interaction'
  | 'relationships'
  | 'exercise'
  | 'daily routine'
  | 'communication'
  | 'decision-making'
  | 'productivity'
  | 'attendance'
  | 'personal care'
  | 'academic activities'
  | 'professional activities';

// ---------------------------------------------------------------------------
// PII filter result
// ---------------------------------------------------------------------------

/** What the privacy filter detected and replaced */
export interface PiiDetectionResult {
  /** The sanitised text with PII removed/replaced */
  sanitisedText: string;
  /** Categories of PII that were found (for logging/debugging — no actual PII) */
  detectedCategories: PiiCategory[];
  /** True if any PII was found and removed */
  hadPii: boolean;
}

export type PiiCategory =
  | 'email'
  | 'phone'
  | 'name'
  | 'age'
  | 'date_of_birth'
  | 'address'
  | 'postcode'
  | 'url'
  | 'social_handle'
  | 'location'
  | 'institution';

// ---------------------------------------------------------------------------
// Main extraction output
// This is the ONLY thing Phase 3 AI receives — never raw text.
// ---------------------------------------------------------------------------

export interface ExtractionResult {
  /** Discriminator — always 'symptom_report' for Phase 3 */
  type: 'symptom_report';

  /** Detected emotional states */
  emotional_state: EmotionalState[];

  /** Reported physical/cognitive symptoms */
  symptoms: Symptom[];

  /**
   * How long the person has been experiencing this.
   * Normalized string, e.g. "since yesterday", "~2 weeks", "a few hours".
   * null if not mentioned.
   */
  duration: string | null;

  /**
   * How often it occurs.
   * null if not mentioned.
   */
  frequency: FrequencyLevel | null;

  /** What triggered or preceded the current state */
  trigger: Trigger[];

  /** Normalized severity assessment */
  severity: SeverityLevel;

  /** Coping actions the person has already tried */
  action_taken: ActionTaken[];

  /**
   * Whether things are getting better, worse, or unchanged.
   * null if not mentioned.
   */
  progress: ProgressSignalLocal | null;

  /** Descriptors of the current situation */
  current_situation: SituationState[];

  /** Areas of daily functioning that are affected */
  impact: ImpactArea[];

  // -------------------------------------------------------------------------
  // Metadata — about the extraction process, not about the person
  // -------------------------------------------------------------------------

  /** ISO timestamp of when extraction ran */
  extractedAt: string;

  /**
   * Categories of PII that were removed before extraction.
   * Contains no actual PII values.
   */
  piiRemoved: PiiCategory[];

  /**
   * Confidence score 0–1 for the extraction overall.
   * Low score means few signals were found.
   */
  confidence: number;
}

// ---------------------------------------------------------------------------
// Pipeline input/output for preprocessor.ts
// ---------------------------------------------------------------------------

export interface PreprocessorInput {
  /** Raw free text from the user — stays inside the local pipeline */
  rawText: string;
}

export interface PreprocessorOutput {
  /** Structured result safe to pass to Phase 3 AI */
  extraction: ExtractionResult;
  /**
   * Categories of PII removed (no actual values).
   * Useful for showing the user a privacy confirmation.
   */
  piiSummary: PiiCategory[];
  /**
   * Whether the text had enough signals to produce a meaningful extraction.
   * If false, the UI should ask the user for more detail.
   */
  hasMinimumSignals: boolean;
}

// =============================================================================
// Phase 3 — AI Analysis types
//
// These types describe the input and output of the AI analysis layer.
//
// Input:  ExtractionResult from Phase 2 (sanitised — never raw text)
// Output: AnalysisEngineResult consumed by the application UI
// =============================================================================

// ---------------------------------------------------------------------------
// Supported condition IDs — the AI may ONLY return these values
// ---------------------------------------------------------------------------

export const SUPPORTED_CONDITION_IDS = [
  'anxiety',
  'adhd',
  'ocd',
  'depressive-symptoms',
  'ptsd',
  'cognitive-overload',
  'burnout',
  'anger-irritation',
  'social-detachment',
  'self-esteem',
  'substance-related',
] as const;

export type SupportedConditionId = typeof SUPPORTED_CONDITION_IDS[number];

/** Returned when the extracted information is insufficient for a meaningful match */
export const NO_CLEAR_MATCH = 'no-clear-match' as const;
export type ConditionResult = SupportedConditionId | typeof NO_CLEAR_MATCH;

/** Validate that a string is a supported condition ID or no-clear-match */
export function isValidConditionResult(value: unknown): value is ConditionResult {
  if (typeof value !== 'string') return false;
  return (
    value === NO_CLEAR_MATCH ||
    (SUPPORTED_CONDITION_IDS as readonly string[]).includes(value)
  );
}

// ---------------------------------------------------------------------------
// AI payload — what we send to the Edge Function / AI model
// Contains ONLY the Phase 2 ExtractionResult. Raw text is never included.
// ---------------------------------------------------------------------------

/**
 * Payload sent from the client to the Edge Function.
 * The Edge Function forwards extraction (never rawText) to the AI model.
 */
export interface AnalysisPayload {
  /**
   * The sanitised structured extraction from Phase 2.
   * This is typed as `unknown` here so the client code can pass
   * ExtractionResult without importing the full Phase 2 type tree into
   * every consumer — the Edge Function and aiEngine both narrow it.
   */
  extraction: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// AI model output shapes
// The AI is instructed to return JSON conforming to RawAiResponse.
// We validate and narrow it before exposing AnalysisEngineResult.
// ---------------------------------------------------------------------------

export interface SecondaryConditionMatch {
  condition: ConditionResult;
  similarity_score: number;
}

/** Raw JSON the AI model returns — we validate this before trusting it */
export interface RawAiResponse {
  primary_condition: string;
  similarity_score: number;
  secondary_conditions: Array<{
    condition: string;
    similarity_score: number;
  }>;
  matching_factors: string[];
  immediate_response: {
    message: string;
    suggested_actions: string[];
  };
}

/** Validated, typed result returned to the application */
export interface AnalysisEngineResult {
  /** Primary pattern match — one of 11 conditions or no-clear-match */
  primary_condition: ConditionResult;
  /**
   * 0–100 pattern similarity score.
   * Represents how closely the reported pattern matches the category.
   * NOT a probability of having a disorder.
   */
  similarity_score: number;
  /** Up to 2 secondary matches with their own scores */
  secondary_conditions: SecondaryConditionMatch[];
  /** Specific signals from the extraction that drove this match */
  matching_factors: string[];
  /** Short supportive response with practical suggestions */
  immediate_response: {
    message: string;
    suggested_actions: string[];
  };
  /** Which model produced this result */
  model_used: 'gemini' | 'groq' | 'fallback';
  /** ISO timestamp */
  analysedAt: string;
}

// ---------------------------------------------------------------------------
// Engine call result — wraps success/error uniformly
// ---------------------------------------------------------------------------

export type AnalysisEngineCallResult =
  | { ok: true; result: AnalysisEngineResult }
  | { ok: false; error: AnalysisEngineError };

export type AnalysisEngineErrorCode =
  | 'INSUFFICIENT_SIGNALS'   // Phase 2 extraction had too little signal
  | 'BOTH_MODELS_FAILED'     // Gemini and Groq both failed
  | 'INVALID_RESPONSE'       // AI returned malformed/invalid JSON
  | 'NETWORK_ERROR'          // Could not reach the Edge Function
  | 'EDGE_FUNCTION_ERROR'    // Edge Function returned a non-200 status
  | 'UNKNOWN';

export interface AnalysisEngineError {
  code: AnalysisEngineErrorCode;
  message: string;
}

// ---------------------------------------------------------------------------
// Edge Function response shape
// ---------------------------------------------------------------------------

/** Successful response body from the Edge Function */
export interface EdgeFunctionSuccessResponse {
  result: AnalysisEngineResult;
}

/** Error response body from the Edge Function */
export interface EdgeFunctionErrorResponse {
  error: string;
  code: AnalysisEngineErrorCode;
}

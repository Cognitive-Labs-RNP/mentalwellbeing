/**
 * aiEngine.ts — Client-side AI analysis service
 *
 * Calls the Supabase Edge Function `analyse`, which handles:
 *   - Gemini (primary)
 *   - Groq (fallback)
 *
 * This module NEVER holds API keys. Keys live in Supabase Edge Function secrets.
 * This module NEVER sends raw text — only the Phase 2 ExtractionResult.
 *
 * Data flow:
 *   ExtractionResult (Phase 2 output)
 *       ↓
 *   aiEngine.ts  →  POST /functions/v1/analyse  →  Edge Function
 *       ↓
 *   AnalysisEngineResult (validated, typed)
 */

import { supabase } from '../lib/supabase';
import type { ExtractionResult } from '../types/extraction';
import type {
  AnalysisEngineResult,
  AnalysisEngineCallResult,
  AnalysisEngineErrorCode,
  AnalysisPayload,
  EdgeFunctionSuccessResponse,
  EdgeFunctionErrorResponse,
} from '../types/aiAnalysis';
import {
  isValidConditionResult,
  SUPPORTED_CONDITION_IDS,
} from '../types/aiAnalysis';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Timeout for the Edge Function call in milliseconds */
const EDGE_FUNCTION_TIMEOUT_MS = 30_000;

/** Edge Function name as deployed to Supabase */
const EDGE_FUNCTION_NAME = 'analyse';

// ---------------------------------------------------------------------------
// Payload sanitisation
// ---------------------------------------------------------------------------

/**
 * Strip any fields from the extraction that should not reach the AI.
 * This is a defensive last-resort check — Phase 2 should already have
 * produced a clean payload.
 */
function sanitisePayload(extraction: ExtractionResult): Record<string, unknown> {
  // Destructure out metadata fields not needed for AI classification
  // and any field that could theoretically contain raw text
  const {
    extractedAt: _extractedAt,
    piiRemoved: _piiRemoved,
    // ExtractionResult has no rawText field by design, but guard anyway
    ...signals
  } = extraction as ExtractionResult & { rawText?: unknown };

  // Explicit guard: remove any key whose name suggests raw text
  const forbidden = new Set([
    'rawText', 'originalText', 'userInput', 'raw_text',
    'original_text', 'raw_paragraph', 'user_paragraph',
  ]);
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(signals)) {
    if (!forbidden.has(key)) {
      clean[key] = value;
    }
  }
  return clean;
}

// ---------------------------------------------------------------------------
// Response validation
// ---------------------------------------------------------------------------

/**
 * Validate that the AnalysisEngineResult returned by the Edge Function
 * conforms to the expected shape before trusting it.
 */
function validateResult(raw: unknown): AnalysisEngineResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  // primary_condition
  if (!isValidConditionResult(r['primary_condition'])) return null;

  // similarity_score in range
  const score = r['similarity_score'];
  if (typeof score !== 'number' || score < 0 || score > 100) return null;

  // secondary_conditions array
  if (!Array.isArray(r['secondary_conditions'])) return null;
  const validSecondary = (r['secondary_conditions'] as unknown[]).every(
    (s) => {
      if (!s || typeof s !== 'object') return false;
      const sc = s as Record<string, unknown>;
      return (
        isValidConditionResult(sc['condition']) &&
        typeof sc['similarity_score'] === 'number' &&
        sc['similarity_score'] >= 0 &&
        sc['similarity_score'] <= 100
      );
    }
  );
  if (!validSecondary) return null;

  // matching_factors
  if (!Array.isArray(r['matching_factors'])) return null;

  // immediate_response
  const ir = r['immediate_response'];
  if (!ir || typeof ir !== 'object') return null;
  const irObj = ir as Record<string, unknown>;
  if (typeof irObj['message'] !== 'string') return null;
  if (!Array.isArray(irObj['suggested_actions'])) return null;

  // model_used
  if (!['gemini', 'groq', 'fallback'].includes(r['model_used'] as string)) return null;

  return raw as AnalysisEngineResult;
}

// ---------------------------------------------------------------------------
// Error builder
// ---------------------------------------------------------------------------

function makeError(
  code: AnalysisEngineErrorCode,
  message: string
): AnalysisEngineCallResult {
  return { ok: false, error: { code, message } };
}

// ---------------------------------------------------------------------------
// Main analysis function
// ---------------------------------------------------------------------------

/**
 * Run AI analysis on the Phase 2 extraction result.
 *
 * @param extraction  Output from preprocessor.ts — sanitised, no raw text.
 * @returns           Typed analysis result or structured error.
 *
 * @example
 * ```ts
 * const { extraction } = preprocess({ rawText: userInput });
 * const callResult = await analyseExtraction(extraction);
 * if (callResult.ok) {
 *   console.log(callResult.result.primary_condition);
 * } else {
 *   console.error(callResult.error.code);
 * }
 * ```
 */
export async function analyseExtraction(
  extraction: ExtractionResult
): Promise<AnalysisEngineCallResult> {
  // Guard: require at least minimal signals
  const hasSignals =
    extraction.emotional_state.length > 0 || extraction.symptoms.length > 0;
  if (!hasSignals) {
    return makeError(
      'INSUFFICIENT_SIGNALS',
      'The description did not contain enough information to perform a meaningful analysis. ' +
        'Please share more about how you have been feeling.'
    );
  }

  // Build the sanitised payload — raw text never included
  const sanitised = sanitisePayload(extraction);
  const payload: AnalysisPayload = { extraction: sanitised };

  // Race the Edge Function call against a timeout promise
  const invokePromise = supabase.functions.invoke<
    EdgeFunctionSuccessResponse | EdgeFunctionErrorResponse
  >(EDGE_FUNCTION_NAME, { body: payload });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new DOMException('Edge Function call timed out', 'AbortError')),
      EDGE_FUNCTION_TIMEOUT_MS
    )
  );

  try {
    const { data, error } = await Promise.race([invokePromise, timeoutPromise]);

    // Supabase client-level error (network, auth, etc.)
    if (error) {
      console.error('[aiEngine] Edge Function invoke error:', error);
      return makeError(
        'NETWORK_ERROR',
        `Could not reach the analysis service: ${error.message}`
      );
    }

    if (!data) {
      return makeError('EDGE_FUNCTION_ERROR', 'No response from analysis service.');
    }

    // Check for application-level error from the Edge Function
    if ('error' in data) {
      const errData = data as EdgeFunctionErrorResponse;
      const code = errData.code ?? 'EDGE_FUNCTION_ERROR';

      // Both models failed — Edge Function returned a fallback result
      if (code === 'BOTH_MODELS_FAILED') {
        const dataAsObj = data as unknown as Record<string, unknown>;
        if ('result' in dataAsObj) {
          const validated = validateResult(dataAsObj['result']);
          if (validated) {
            return { ok: true, result: validated };
          }
        }
      }

      return makeError(code as AnalysisEngineErrorCode, errData.error ?? 'Analysis failed.');
    }

    // Validate the successful result
    const successData = data as EdgeFunctionSuccessResponse;
    const validated = validateResult(successData.result);

    if (!validated) {
      console.error('[aiEngine] Invalid result shape from Edge Function:', successData.result);
      return makeError(
        'INVALID_RESPONSE',
        'The analysis service returned an unexpected response format.'
      );
    }

    return { ok: true, result: validated };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return makeError('NETWORK_ERROR', 'The analysis request timed out. Please try again.');
    }

    console.error('[aiEngine] Unexpected error:', err);
    return makeError('UNKNOWN', `An unexpected error occurred: ${String(err)}`);
  }
}

// ---------------------------------------------------------------------------
// Utility exports used by other parts of the application
// ---------------------------------------------------------------------------

/**
 * Human-readable display name for a condition ID.
 * Used by the Result page and condition workspace.
 */
export const CONDITION_DISPLAY_NAMES: Record<string, string> = {
  anxiety:             'Anxiety',
  adhd:                'ADHD',
  ocd:                 'OCD',
  'depressive-symptoms': 'Depressive Symptoms',
  ptsd:                'PTSD',
  'cognitive-overload': 'Cognitive Overload',
  burnout:             'Burnout',
  'anger-irritation':  'Anger & Irritation',
  'social-detachment': 'Social Detachment',
  'self-esteem':       'Self-Esteem Issues',
  'substance-related': 'Substance-Related Challenges',
  'no-clear-match':    'Insufficient Information',
};

/** The list of conditions the AI may classify into */
export { SUPPORTED_CONDITION_IDS };

/** Type guard re-export for convenience */
export { isValidConditionResult };

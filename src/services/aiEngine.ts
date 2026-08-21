/**
 * aiEngine.ts — Client-side AI analysis service
 *
 * Calls the Supabase Edge Function `analyse`, which handles:
 *   - Gemini (primary)
 *   - Groq (fallback)
 *
 * This module NEVER holds API keys in production. Keys live in Supabase Edge Function secrets.
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
  const {
    extractedAt: _extractedAt,
    piiRemoved: _piiRemoved,
    ...signals
  } = extraction as ExtractionResult & { rawText?: unknown };

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

function validateResult(raw: unknown): AnalysisEngineResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  if (!isValidConditionResult(r['primary_condition'])) return null;

  const score = r['similarity_score'];
  if (typeof score !== 'number' || score < 0 || score > 100) return null;

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

  if (!Array.isArray(r['matching_factors'])) return null;

  const ir = r['immediate_response'];
  if (!ir || typeof ir !== 'object') return null;
  const irObj = ir as Record<string, unknown>;
  if (typeof irObj['message'] !== 'string') return null;
  if (!Array.isArray(irObj['suggested_actions'])) return null;

  if (!['gemini', 'groq', 'fallback'].includes(r['model_used'] as string)) return null;

  return raw as AnalysisEngineResult;
}

function makeError(
  code: AnalysisEngineErrorCode,
  message: string
): AnalysisEngineCallResult {
  return { ok: false, error: { code, message } };
}

// ---------------------------------------------------------------------------
// Direct client-side AI caller (Development Fallback when Edge Function is not deployed)
// ---------------------------------------------------------------------------

async function callDirectGemini(
  extraction: ExtractionResult,
  apiKey: string
): Promise<AnalysisEngineResult | null> {
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const conditionList = SUPPORTED_CONDITION_IDS.join(', ');
  const prompt = `You are a mental wellbeing pattern analysis assistant.
IMPORTANT RULES:
1. You MUST classify using ONLY these exact condition IDs: ${conditionList}
2. If the information is insufficient, return primary_condition: "no-clear-match"
3. Similarity scores represent pattern similarity (0-100), NOT clinical diagnosis probability
4. Never claim the user has been clinically diagnosed
5. Use language like "The reported pattern most closely resembles..."
6. Keep immediate_response.message under 60 words, practical and supportive
7. Return ONLY valid JSON — no markdown, no explanation text

INPUT (sanitised structured extraction — no personal identifiers):
${JSON.stringify(extraction, null, 2)}

Return EXACTLY this JSON structure:
{
  "primary_condition": "<one of the 11 condition IDs or no-clear-match>",
  "similarity_score": <integer 0-100>,
  "secondary_conditions": [
    { "condition": "<condition ID>", "similarity_score": <integer 0-100> }
  ],
  "matching_factors": ["<factor 1>", "<factor 2>", "<factor 3>"],
  "immediate_response": {
    "message": "<short supportive message under 60 words>",
    "suggested_actions": ["<action 1>", "<action 2>", "<action 3>"]
  }
}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
          responseMimeType: 'application/json',
        },
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    const candidates = data['candidates'] as Array<Record<string, unknown>> | undefined;
    const text = candidates?.[0]?.['content'] as Record<string, unknown> | undefined;
    const parts = text?.['parts'] as Array<Record<string, unknown>> | undefined;
    const rawText = parts?.[0]?.['text'] as string | undefined;
    if (!rawText) return null;
    const parsed = JSON.parse(rawText);
    return validateResult({
      ...parsed,
      model_used: 'gemini',
      analysedAt: new Date().toISOString(),
    });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main analysis function
// ---------------------------------------------------------------------------

export async function analyseExtraction(
  extraction: ExtractionResult
): Promise<AnalysisEngineCallResult> {
  const hasSignals =
    extraction.emotional_state.length > 0 || extraction.symptoms.length > 0;
  if (!hasSignals) {
    return makeError(
      'INSUFFICIENT_SIGNALS',
      'The description did not contain enough information to perform a meaningful analysis. ' +
        'Please share more about how you have been feeling.'
    );
  }

  const sanitised = sanitisePayload(extraction);
  const payload: AnalysisPayload = { extraction: sanitised };

  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? 'https://wnccvewlqlotvsizuhby.supabase.co';

  // Temporary development logging as requested
  console.log('[aiEngine] --- Invoking Supabase Edge Function ---');
  console.log('[aiEngine] Supabase Project URL:', supabaseUrl);
  console.log('[aiEngine] Edge Function Name:', EDGE_FUNCTION_NAME);
  console.log('[aiEngine] Payload Signals:', Object.keys(sanitised));

  const invokePromise = supabase.functions.invoke(EDGE_FUNCTION_NAME, { body: payload }) as Promise<{
    data: EdgeFunctionSuccessResponse | EdgeFunctionErrorResponse | null;
    error: any;
  }>;

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new DOMException('Edge Function call timed out', 'AbortError')),
      EDGE_FUNCTION_TIMEOUT_MS
    )
  );

  try {
    const { data, error } = await Promise.race([invokePromise, timeoutPromise]);

    if (error) {
      console.error('[aiEngine] Edge Function invoke error details:', {
        name: error.name,
        message: error.message,
        status: error.status,
      });

      // Local Client Direct Fallback if Edge Function is NOT DEPLOYED (HTTP 404 / FunctionsFetchError)
      const clientGeminiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (clientGeminiKey && clientGeminiKey.trim().length > 10) {
        console.warn('[aiEngine] Edge Function call failed. Attempting local client AI model call fallback...');
        const directResult = await callDirectGemini(extraction, clientGeminiKey);
        if (directResult) {
          console.log('[aiEngine] Local client AI model call succeeded.');
          return { ok: true, result: directResult };
        }
      }

      return makeError(
        'NETWORK_ERROR',
        `Could not reach the analysis Edge Function ('analyse') on Supabase project ${supabaseUrl}: ${error.message}`
      );
    }

    if (!data) {
      return makeError('EDGE_FUNCTION_ERROR', 'No response from analysis service.');
    }

    if ('error' in data) {
      const errData = data as EdgeFunctionErrorResponse;
      const code = errData.code ?? 'EDGE_FUNCTION_ERROR';

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

export { SUPPORTED_CONDITION_IDS };
export { isValidConditionResult };

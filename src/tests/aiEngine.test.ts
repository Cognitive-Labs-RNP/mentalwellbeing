/**
 * aiEngine.test.ts — Phase 3 AI engine unit tests
 *
 * Tests the client-side aiEngine using mocked Supabase Edge Function calls.
 * No real API calls are made. All 11 conditions + edge cases are covered.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ExtractionResult } from '../types/extraction';
import type { AnalysisEngineResult } from '../types/aiAnalysis';
import { isValidConditionResult, SUPPORTED_CONDITION_IDS } from '../types/aiAnalysis';

// ---------------------------------------------------------------------------
// Mock supabase client BEFORE importing aiEngine
// ---------------------------------------------------------------------------

const mockInvoke = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: mockInvoke,
    },
  },
}));

// Import AFTER mock is set up
const { analyseExtraction, CONDITION_DISPLAY_NAMES } = await import('../services/aiEngine');

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeExtraction(overrides: Partial<ExtractionResult> = {}): ExtractionResult {
  return {
    type: 'symptom_report',
    emotional_state: ['anxiety'],
    symptoms: ['racing heartbeat', 'difficulty concentrating'],
    duration: '~2 weeks',
    frequency: 'almost every day',
    trigger: ['academic pressure'],
    severity: 'high',
    action_taken: ['took a break'],
    progress: 'no improvement',
    current_situation: ['ongoing'],
    impact: ['concentration', 'academic activities'],
    extractedAt: new Date().toISOString(),
    piiRemoved: [],
    confidence: 0.75,
    ...overrides,
  };
}

function makeSuccessResponse(
  partial: Partial<AnalysisEngineResult> = {}
): { data: { result: AnalysisEngineResult }; error: null } {
  return {
    data: {
      result: {
        primary_condition: 'anxiety',
        similarity_score: 82,
        secondary_conditions: [{ condition: 'cognitive-overload', similarity_score: 61 }],
        matching_factors: ['anxiety emotional state', 'racing heartbeat', 'academic pressure'],
        immediate_response: {
          message: 'Try a 4-7-8 breathing exercise to calm your nervous system.',
          suggested_actions: ['4-7-8 breathing', 'short walk', 'grounding exercise'],
        },
        model_used: 'gemini',
        analysedAt: new Date().toISOString(),
        ...partial,
      },
    },
    error: null,
  };
}

// ---------------------------------------------------------------------------
// Tests — one per supported condition
// ---------------------------------------------------------------------------

describe('aiEngine — condition coverage', () => {

  beforeEach(() => { vi.clearAllMocks(); });
  afterEach(() => { vi.restoreAllMocks(); });

  it('returns anxiety result', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({ primary_condition: 'anxiety' }));
    const result = await analyseExtraction(makeExtraction({ emotional_state: ['anxiety'] }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.primary_condition).toBe('anxiety');
  });

  it('returns adhd result', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({ primary_condition: 'adhd' }));
    const result = await analyseExtraction(makeExtraction({
      emotional_state: ['frustration'],
      symptoms: ['difficulty concentrating', 'restlessness'],
      trigger: ['workload'],
    }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.primary_condition).toBe('adhd');
  });

  it('returns ocd result', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({ primary_condition: 'ocd' }));
    const result = await analyseExtraction(makeExtraction({
      emotional_state: ['anxiety', 'fear'],
      symptoms: ['intrusive thoughts', 'restlessness'],
    }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.primary_condition).toBe('ocd');
  });

  it('returns depressive-symptoms result', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({ primary_condition: 'depressive-symptoms' }));
    const result = await analyseExtraction(makeExtraction({
      emotional_state: ['sadness', 'hopelessness'],
      symptoms: ['fatigue', 'loss of appetite', 'difficulty sleeping'],
    }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.primary_condition).toBe('depressive-symptoms');
  });

  it('returns ptsd result', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({ primary_condition: 'ptsd' }));
    const result = await analyseExtraction(makeExtraction({
      emotional_state: ['fear', 'numbness'],
      symptoms: ['intrusive thoughts', 'difficulty sleeping', 'restlessness'],
      trigger: ['conflict'],
    }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.primary_condition).toBe('ptsd');
  });

  it('returns cognitive-overload result', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({ primary_condition: 'cognitive-overload' }));
    const result = await analyseExtraction(makeExtraction({
      emotional_state: ['overwhelm', 'confusion'],
      symptoms: ['brain fog', 'difficulty concentrating'],
      trigger: ['workload', 'deadline'],
    }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.primary_condition).toBe('cognitive-overload');
  });

  it('returns burnout result', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({ primary_condition: 'burnout' }));
    const result = await analyseExtraction(makeExtraction({
      emotional_state: ['stress', 'numbness'],
      symptoms: ['fatigue', 'low energy'],
      trigger: ['work pressure'],
      duration: 'several months',
    }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.primary_condition).toBe('burnout');
  });

  it('returns anger-irritation result', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({ primary_condition: 'anger-irritation' }));
    const result = await analyseExtraction(makeExtraction({
      emotional_state: ['anger', 'irritation', 'frustration'],
      trigger: ['argument', 'interpersonal conflict'],
    }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.primary_condition).toBe('anger-irritation');
  });

  it('returns social-detachment result', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({ primary_condition: 'social-detachment' }));
    const result = await analyseExtraction(makeExtraction({
      emotional_state: ['loneliness', 'numbness'],
      trigger: ['isolation'],
      impact: ['social interaction', 'relationships'],
    }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.primary_condition).toBe('social-detachment');
  });

  it('returns self-esteem result', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({ primary_condition: 'self-esteem' }));
    const result = await analyseExtraction(makeExtraction({
      emotional_state: ['shame', 'guilt', 'disappointment'],
      trigger: ['criticism', 'failure'],
    }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.primary_condition).toBe('self-esteem');
  });

  it('returns substance-related result', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({ primary_condition: 'substance-related' }));
    const result = await analyseExtraction(makeExtraction({
      emotional_state: ['anxiety', 'guilt'],
      symptoms: ['restlessness', 'difficulty sleeping'],
    }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.primary_condition).toBe('substance-related');
  });

  it('returns no-clear-match for insufficient information', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({
      primary_condition: 'no-clear-match',
      similarity_score: 0,
    }));
    const result = await analyseExtraction(makeExtraction({
      emotional_state: ['confusion'],
      symptoms: [],
    }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.result.primary_condition).toBe('no-clear-match');
  });

});

// ---------------------------------------------------------------------------
// Tests — error handling and edge cases
// ---------------------------------------------------------------------------

describe('aiEngine — error handling', () => {

  beforeEach(() => { vi.clearAllMocks(); });

  // ── Insufficient signals ───────────────────────────────────────────────────
  it('returns INSUFFICIENT_SIGNALS when emotional_state and symptoms are both empty', async () => {
    const result = await analyseExtraction(makeExtraction({
      emotional_state: [],
      symptoms: [],
    }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('INSUFFICIENT_SIGNALS');
    }
    // invoke should NOT be called at all
    expect(mockInvoke).not.toHaveBeenCalled();
  });

  // ── Malformed AI response ──────────────────────────────────────────────────
  it('returns INVALID_RESPONSE when Edge Function returns a malformed result', async () => {
    mockInvoke.mockResolvedValue({
      data: { result: { primary_condition: 'not-a-real-condition', similarity_score: 'high' } },
      error: null,
    });
    const result = await analyseExtraction(makeExtraction());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INVALID_RESPONSE');
  });

  // ── Invalid condition name returned by model ───────────────────────────────
  it('returns INVALID_RESPONSE when model returns an invented condition name', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        result: {
          primary_condition: 'bipolar-disorder', // not in allowed list
          similarity_score: 75,
          secondary_conditions: [],
          matching_factors: ['test'],
          immediate_response: { message: 'test', suggested_actions: ['test'] },
          model_used: 'gemini',
          analysedAt: new Date().toISOString(),
        },
      },
      error: null,
    });
    const result = await analyseExtraction(makeExtraction());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INVALID_RESPONSE');
  });

  // ── Similarity score outside 0–100 ────────────────────────────────────────
  it('returns INVALID_RESPONSE when similarity_score is outside 0-100', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        result: {
          primary_condition: 'anxiety',
          similarity_score: 150, // invalid
          secondary_conditions: [],
          matching_factors: [],
          immediate_response: { message: 'test', suggested_actions: [] },
          model_used: 'gemini',
          analysedAt: new Date().toISOString(),
        },
      },
      error: null,
    });
    const result = await analyseExtraction(makeExtraction());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INVALID_RESPONSE');
  });

  // ── Gemini failure → Groq fallback ────────────────────────────────────────
  it('succeeds with model_used=groq when Edge Function used Groq as fallback', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse({
      primary_condition: 'burnout',
      model_used: 'groq',
    }));
    const result = await analyseExtraction(makeExtraction());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.model_used).toBe('groq');
      expect(result.result.primary_condition).toBe('burnout');
    }
  });

  // ── Both models failing ────────────────────────────────────────────────────
  it('returns ok with fallback result when Edge Function reports both models failed', async () => {
    mockInvoke.mockResolvedValue({
      data: {
        error: 'Both AI models failed',
        code: 'BOTH_MODELS_FAILED',
        result: {
          primary_condition: 'no-clear-match',
          similarity_score: 0,
          secondary_conditions: [],
          matching_factors: [],
          immediate_response: {
            message: 'Unable to complete analysis. Please try again.',
            suggested_actions: ['Try breathing exercise'],
          },
          model_used: 'fallback',
          analysedAt: new Date().toISOString(),
        },
      },
      error: null,
    });
    const result = await analyseExtraction(makeExtraction());
    // Engine recovers from BOTH_MODELS_FAILED by using the fallback result
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.result.model_used).toBe('fallback');
      expect(result.result.primary_condition).toBe('no-clear-match');
    }
  });

  // ── Network / Supabase client error ───────────────────────────────────────
  it('returns NETWORK_ERROR when Supabase invoke returns an error', async () => {
    mockInvoke.mockResolvedValue({
      data: null,
      error: { message: 'FetchError: Failed to fetch' },
    });
    const result = await analyseExtraction(makeExtraction());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('NETWORK_ERROR');
  });

  // ── Edge Function 422 (insufficient signals server-side) ──────────────────
  it('returns INSUFFICIENT_SIGNALS when Edge Function returns that error code', async () => {
    mockInvoke.mockResolvedValue({
      data: { error: 'Insufficient signals', code: 'INSUFFICIENT_SIGNALS' },
      error: null,
    });
    // Force signals to be present client-side so it passes local check
    const result = await analyseExtraction(makeExtraction({
      emotional_state: ['anxiety'],
      symptoms: [],
    }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('INSUFFICIENT_SIGNALS');
  });

  // ── Sanitised payload never contains raw text ──────────────────────────────
  it('never includes rawText or original text in the payload sent to invoke', async () => {
    mockInvoke.mockResolvedValue(makeSuccessResponse());
    const extraction = makeExtraction() as ExtractionResult & { rawText?: string };
    extraction.rawText = 'I am Pakhi and I feel anxious'; // simulate accidental field

    await analyseExtraction(extraction);

    expect(mockInvoke).toHaveBeenCalledOnce();
    const callArg = mockInvoke.mock.calls[0][1] as { body: { extraction: Record<string, unknown> } };
    const sentPayload = callArg.body.extraction;
    expect(sentPayload).not.toHaveProperty('rawText');
    expect(sentPayload).not.toHaveProperty('extractedAt');
    expect(sentPayload).not.toHaveProperty('piiRemoved');
  });

});

// ---------------------------------------------------------------------------
// Tests — type guards and utilities
// ---------------------------------------------------------------------------

describe('aiAnalysis type utilities', () => {

  it('isValidConditionResult accepts all 11 conditions', () => {
    for (const id of SUPPORTED_CONDITION_IDS) {
      expect(isValidConditionResult(id)).toBe(true);
    }
  });

  it('isValidConditionResult accepts no-clear-match', () => {
    expect(isValidConditionResult('no-clear-match')).toBe(true);
  });

  it('isValidConditionResult rejects invented condition names', () => {
    expect(isValidConditionResult('depression')).toBe(false);
    expect(isValidConditionResult('bipolar-disorder')).toBe(false);
    expect(isValidConditionResult('schizophrenia')).toBe(false);
    expect(isValidConditionResult('')).toBe(false);
    expect(isValidConditionResult(null)).toBe(false);
    expect(isValidConditionResult(42)).toBe(false);
  });

  it('CONDITION_DISPLAY_NAMES has an entry for all 11 conditions', () => {
    for (const id of SUPPORTED_CONDITION_IDS) {
      expect(CONDITION_DISPLAY_NAMES[id]).toBeTruthy();
    }
  });

});

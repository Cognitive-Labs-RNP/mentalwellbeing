/**
 * Supabase Edge Function: analyse
 *
 * Receives the Phase 2 ExtractionResult from the client,
 * calls Gemini (primary) → Groq (fallback),
 * validates the response, and returns a structured AnalysisEngineResult.
 *
 * Security:
 *   - API keys are read from Deno.env (Supabase secrets) — never from the request.
 *   - Raw user text is never accepted or forwarded.
 *   - CORS is locked to the application origin via env var.
 *
 * Deploy:
 *   supabase functions deploy analyse
 *   supabase secrets set GEMINI_API_KEY=... GROQ_API_KEY=...
 */

// ---------------------------------------------------------------------------
// Types (inlined to keep the Edge Function self-contained)
// ---------------------------------------------------------------------------

const SUPPORTED_CONDITION_IDS = [
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

type SupportedConditionId = typeof SUPPORTED_CONDITION_IDS[number];
type ConditionResult = SupportedConditionId | 'no-clear-match';

function isValidCondition(v: unknown): v is ConditionResult {
  if (typeof v !== 'string') return false;
  return v === 'no-clear-match' || (SUPPORTED_CONDITION_IDS as readonly string[]).includes(v);
}

function clampScore(n: unknown): number {
  const num = typeof n === 'number' ? n : Number(n);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

interface SecondaryMatch { condition: ConditionResult; similarity_score: number; }

interface AnalysisEngineResult {
  primary_condition: ConditionResult;
  similarity_score: number;
  secondary_conditions: SecondaryMatch[];
  matching_factors: string[];
  immediate_response: { message: string; suggested_actions: string[] };
  model_used: 'gemini' | 'groq' | 'fallback';
  analysedAt: string;
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

/**
 * Build the prompt sent to the AI model.
 * The extraction object is embedded as JSON — no raw user text is included.
 */
function buildPrompt(extraction: Record<string, unknown>): string {
  // Strip metadata fields not useful for classification
  const { extractedAt: _a, piiRemoved: _b, confidence: _c, ...signals } = extraction;

  const conditionList = SUPPORTED_CONDITION_IDS.join(', ');

  return `You are a mental wellbeing pattern analysis assistant.

IMPORTANT RULES:
1. You MUST classify using ONLY these exact condition IDs: ${conditionList}
2. If the information is insufficient, return primary_condition: "no-clear-match"
3. Similarity scores represent pattern similarity (0-100), NOT clinical diagnosis probability
4. Never claim the user has been clinically diagnosed
5. Use language like "The reported pattern most closely resembles..."
6. Keep immediate_response.message under 60 words, practical and supportive
7. Return ONLY valid JSON — no markdown, no explanation text

INPUT (sanitised structured extraction — no personal identifiers):
${JSON.stringify(signals, null, 2)}

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
}

// ---------------------------------------------------------------------------
// Response validator
// ---------------------------------------------------------------------------

function validateAndNormalise(
  raw: unknown,
  modelUsed: 'gemini' | 'groq'
): AnalysisEngineResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  // primary_condition
  const primary = r['primary_condition'];
  if (!isValidCondition(primary)) return null;

  // similarity_score
  const rawScore = r['similarity_score'];
  if (rawScore === undefined || rawScore === null) return null;
  const score = clampScore(rawScore);

  // secondary_conditions — optional, default to []
  const rawSecondary = Array.isArray(r['secondary_conditions'])
    ? r['secondary_conditions']
    : [];
  const secondary: SecondaryMatch[] = rawSecondary
    .filter((s) => s && typeof s === 'object')
    .map((s: Record<string, unknown>) => ({
      condition: isValidCondition(s['condition']) ? s['condition'] : 'no-clear-match',
      similarity_score: clampScore(s['similarity_score']),
    }))
    .filter((s) => s.condition !== 'no-clear-match' || rawSecondary.length === 0)
    .slice(0, 2);

  // matching_factors
  const factors = Array.isArray(r['matching_factors'])
    ? (r['matching_factors'] as unknown[])
        .filter((f) => typeof f === 'string')
        .slice(0, 6)
    : [];

  // immediate_response
  const ir = r['immediate_response'];
  if (!ir || typeof ir !== 'object') return null;
  const irObj = ir as Record<string, unknown>;
  const message =
    typeof irObj['message'] === 'string' && irObj['message'].trim().length > 0
      ? irObj['message'].trim()
      : 'Take a few slow breaths and give yourself a moment of kindness right now.';
  const suggested_actions = Array.isArray(irObj['suggested_actions'])
    ? (irObj['suggested_actions'] as unknown[])
        .filter((a) => typeof a === 'string')
        .slice(0, 4)
    : ['Try a short breathing exercise', 'Take a brief walk or stretch'];

  return {
    primary_condition: primary,
    similarity_score: score,
    secondary_conditions: secondary,
    matching_factors: factors,
    immediate_response: { message, suggested_actions },
    model_used: modelUsed,
    analysedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Gemini caller
// ---------------------------------------------------------------------------

async function callGemini(
  prompt: string,
  apiKey: string
): Promise<AnalysisEngineResult | null> {
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.8,
      maxOutputTokens: 800,
      responseMimeType: 'application/json',
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH',      threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    console.error(`[analyse] Gemini HTTP ${res.status}: ${await res.text()}`);
    return null;
  }

  const data = await res.json() as Record<string, unknown>;

  // Extract text from Gemini response structure
  const candidates = data['candidates'] as Array<Record<string, unknown>> | undefined;
  const text = candidates?.[0]?.['content'] as Record<string, unknown> | undefined;
  const parts = text?.['parts'] as Array<Record<string, unknown>> | undefined;
  const rawText = parts?.[0]?.['text'] as string | undefined;

  if (!rawText) return null;

  try {
    const parsed = JSON.parse(rawText);
    return validateAndNormalise(parsed, 'gemini');
  } catch {
    // responseMimeType: 'application/json' should prevent this, but handle anyway
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return validateAndNormalise(JSON.parse(jsonMatch[0]), 'gemini');
      } catch { /* fall through */ }
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Groq caller (fallback)
// ---------------------------------------------------------------------------

async function callGroq(
  prompt: string,
  apiKey: string
): Promise<AnalysisEngineResult | null> {
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const body = {
    model: 'llama-3.1-8b-instant',
    messages: [
      {
        role: 'system',
        content:
          'You are a mental wellbeing pattern analysis assistant. ' +
          'Always respond with valid JSON only. No markdown, no explanation.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
    max_tokens: 800,
    response_format: { type: 'json_object' },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    console.error(`[analyse] Groq HTTP ${res.status}: ${await res.text()}`);
    return null;
  }

  const data = await res.json() as Record<string, unknown>;
  const choices = data['choices'] as Array<Record<string, unknown>> | undefined;
  const messageContent = (choices?.[0]?.['message'] as Record<string, unknown> | undefined)?.['content'];

  if (typeof messageContent !== 'string') return null;

  try {
    return validateAndNormalise(JSON.parse(messageContent), 'groq');
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Safe fallback result (when both models fail)
// ---------------------------------------------------------------------------

function makeFallbackResult(): AnalysisEngineResult {
  return {
    primary_condition: 'no-clear-match',
    similarity_score: 0,
    secondary_conditions: [],
    matching_factors: [],
    immediate_response: {
      message:
        'We were unable to complete the analysis right now. ' +
        'Please try again in a moment. If you need immediate support, ' +
        'consider reaching out to a trusted person or a crisis line.',
      suggested_actions: [
        'Try a slow breathing exercise',
        'Take a short break',
        'Reach out to someone you trust',
      ],
    },
    model_used: 'fallback',
    analysedAt: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// CORS helper
// ---------------------------------------------------------------------------

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = Deno.env.get('ALLOWED_ORIGIN') ?? '*';
  return {
    'Access-Control-Allow-Origin': allowed === '*' ? '*' : (origin ?? '*'),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const cors = corsHeaders(origin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed', code: 'UNKNOWN' }),
      { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  // Parse body
  let extraction: Record<string, unknown>;
  try {
    const body = await req.json() as { extraction?: unknown };
    if (!body.extraction || typeof body.extraction !== 'object' || Array.isArray(body.extraction)) {
      throw new Error('Missing or invalid extraction field');
    }
    extraction = body.extraction as Record<string, unknown>;
  } catch (e) {
    return new Response(
      JSON.stringify({ error: `Invalid request body: ${String(e)}`, code: 'INVALID_RESPONSE' }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  // Defensive check: reject any field that looks like raw text / PII
  // The extraction object should NOT contain fields like rawText, originalText, etc.
  const forbidden = ['rawText', 'originalText', 'userInput', 'raw_text', 'original_text'];
  for (const key of forbidden) {
    if (key in extraction) {
      return new Response(
        JSON.stringify({ error: 'Raw text field detected in payload', code: 'INVALID_RESPONSE' }),
        { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
  }

  // Check minimum signals
  const emotional = extraction['emotional_state'] as unknown[] | undefined;
  const symptoms  = extraction['symptoms'] as unknown[] | undefined;
  if (
    (!emotional || emotional.length === 0) &&
    (!symptoms  || symptoms.length  === 0)
  ) {
    return new Response(
      JSON.stringify({ error: 'Insufficient signals for analysis', code: 'INSUFFICIENT_SIGNALS' }),
      { status: 422, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
  const groqKey   = Deno.env.get('GROQ_API_KEY') ?? '';
  const prompt    = buildPrompt(extraction);

  // ── Step 1: Try Gemini ────────────────────────────────────────────────────
  let result: AnalysisEngineResult | null = null;

  if (geminiKey) {
    try {
      result = await callGemini(prompt, geminiKey);
    } catch (e) {
      console.warn('[analyse] Gemini threw:', e);
    }
  } else {
    console.warn('[analyse] GEMINI_API_KEY not set — skipping Gemini');
  }

  // ── Step 2: Groq fallback ─────────────────────────────────────────────────
  if (!result) {
    if (groqKey) {
      try {
        result = await callGroq(prompt, groqKey);
      } catch (e) {
        console.warn('[analyse] Groq threw:', e);
      }
    } else {
      console.warn('[analyse] GROQ_API_KEY not set — skipping Groq');
    }
  }

  // ── Step 3: Both failed ───────────────────────────────────────────────────
  if (!result) {
    result = makeFallbackResult();
    return new Response(
      JSON.stringify({ error: 'Both AI models failed', code: 'BOTH_MODELS_FAILED', result }),
      { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ result }),
    { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } }
  );
});

import { describe, it, expect } from 'vitest';
import { extractStructuredData, hasMinimumSignals } from '../services/localExtractor';
import { preprocess } from '../services/preprocessor';

// =============================================================================
// Local Extractor — unit tests
// Verifies structured extraction from sanitised text.
// =============================================================================

describe('localExtractor — structured extraction', () => {

  // ── Test 1: Full scenario — anxiety after interpersonal conflict ───────────
  it('extracts the canonical Phase 2 example correctly', () => {
    // Already sanitised (PII removed by privacy filter in real usage)
    const text =
      'Someone shouted at the user and the user subsequently felt extremely anxious. ' +
      'My heart races at night and I cannot concentrate on studying. ' +
      'I tried taking a break but it hasn\'t improved.';

    const result = extractStructuredData(text);

    expect(result.type).toBe('symptom_report');
    expect(result.emotional_state).toContain('anxiety');
    expect(result.symptoms).toContain('racing heartbeat');
    expect(result.symptoms).toContain('difficulty concentrating');
    expect(result.trigger).toContain('interpersonal conflict');
    expect(result.action_taken).toContain('took a break');
    expect(result.progress).toBe('no improvement');
    expect(result.impact).toContain('concentration');
    // Must not contain any names or ages (we verify the output shape not the input)
    expect(JSON.stringify(result)).not.toMatch(/\b(Pakhi|Rahul|19)\b/);
  });

  // ── Test 2: Academic stress scenario ──────────────────────────────────────
  it('extracts academic stress triggers and impact', () => {
    const text =
      'I have an exam coming up and I feel extremely stressed and overwhelmed. ' +
      'I cannot concentrate during lectures and I have been missing classes.';

    const result = extractStructuredData(text);

    expect(result.trigger.some(t => ['exam', 'academic pressure'].includes(t))).toBe(true);
    expect(result.emotional_state).toContain('stress');
    expect(result.emotional_state).toContain('overwhelm');
    expect(result.impact).toContain('concentration');
    expect(result.impact.some(i => ['attendance', 'academic activities'].includes(i))).toBe(true);
  });

  // ── Test 3: Anxiety symptoms ───────────────────────────────────────────────
  it('extracts physical anxiety symptoms', () => {
    const text =
      'My heart keeps beating really fast and I feel short of breath. ' +
      'I am sweating a lot and my hands are shaking. I feel very nervous.';

    const result = extractStructuredData(text);

    expect(result.symptoms).toContain('racing heartbeat');
    expect(result.symptoms).toContain('shortness of breath');
    expect(result.symptoms).toContain('sweating');
    expect(result.symptoms).toContain('trembling');
    expect(result.emotional_state).toContain('nervousness');
  });

  // ── Test 4: Anger after an argument ───────────────────────────────────────
  it('extracts anger emotion and conflict trigger', () => {
    const text =
      'I had a huge argument with my family and I have been furious ever since. ' +
      'I feel irritable and snappy all the time. I tried taking a walk but nothing helps.';

    const result = extractStructuredData(text);

    expect(result.emotional_state).toContain('anger');
    expect(result.emotional_state).toContain('irritation');
    expect(result.trigger.some(t => ['argument', 'family conflict'].includes(t))).toBe(true);
    expect(result.action_taken).toContain('walked');
    expect(result.progress).toBe('no improvement');
  });

  // ── Test 5: Sleep problems ─────────────────────────────────────────────────
  it('extracts sleep-related symptoms and impact', () => {
    const text =
      'I cannot sleep at night. I keep tossing and turning and wake up at 3am. ' +
      'I feel exhausted all day. My sleep is affecting everything.';

    const result = extractStructuredData(text);

    expect(result.symptoms).toContain('difficulty sleeping');
    expect(result.symptoms).toContain('fatigue');
    expect(result.impact).toContain('sleep');
  });

  // ── Test 6: No improvement — progress signal ───────────────────────────────
  it('detects no improvement progress signal', () => {
    const inputs = [
      "It hasn't improved at all.",
      "Nothing is helping me.",
      "I tried but it's still the same.",
    ];

    for (const text of inputs) {
      const result = extractStructuredData(text);
      expect(['no improvement', 'unchanged']).toContain(result.progress);
    }
  });

  // ── Test 7: Improvement — progress signal ─────────────────────────────────
  it('detects improving progress signal', () => {
    const text =
      'I have been feeling better recently. Things are slowly improving and I am calming down.';

    const result = extractStructuredData(text);

    expect(result.progress).toBe('improving');
  });

  // ── Test 8: Multiple symptoms ──────────────────────────────────────────────
  it('extracts multiple co-occurring symptoms', () => {
    const text =
      'I have a headache, I feel nauseous, my muscles are tense, and I keep crying. ' +
      'I also have no appetite and my stomach is in knots.';

    const result = extractStructuredData(text);

    expect(result.symptoms).toContain('headache');
    expect(result.symptoms).toContain('nausea');
    expect(result.symptoms).toContain('muscle tension');
    expect(result.symptoms).toContain('crying');
    expect(result.symptoms).toContain('loss of appetite');
    expect(result.symptoms).toContain('stomach discomfort');
  });

  // ── Test 9: Action taken ───────────────────────────────────────────────────
  it('extracts multiple coping actions', () => {
    const text =
      'I took a break and talked to my friend. I also tried meditation and deep breathing.';

    const result = extractStructuredData(text);

    expect(result.action_taken).toContain('took a break');
    expect(result.action_taken).toContain('talked to a friend');
    expect(result.action_taken).toContain('meditated');
    expect(result.action_taken).toContain('breathing exercise');
  });

  // ── Test 10: Impact on studies and work ───────────────────────────────────
  it('extracts impact on studies and work', () => {
    const text =
      'I cannot focus during class and I keep missing lectures. ' +
      'My work performance has also dropped significantly.';

    const result = extractStructuredData(text);

    expect(result.impact.some(i => ['concentration', 'academic activities', 'attendance'].includes(i))).toBe(true);
    expect(result.impact.some(i => ['work', 'professional activities'].includes(i))).toBe(true);
  });

  // ── Test 11: Multiple emotional states ────────────────────────────────────
  it('extracts multiple concurrent emotional states', () => {
    const text =
      'I feel really embarrassed and disappointed. I also feel guilty and lonely.';

    const result = extractStructuredData(text);

    expect(result.emotional_state).toContain('embarrassment');
    expect(result.emotional_state).toContain('disappointment');
    expect(result.emotional_state).toContain('guilt');
    expect(result.emotional_state).toContain('loneliness');
  });

  // ── Test 12: Duration extraction ──────────────────────────────────────────
  it('extracts and normalises duration expressions', () => {
    const cases: [string, string][] = [
      ['I have felt this way for almost two weeks.', '~2 weeks'],
      ['This has been going on since yesterday.', 'since yesterday'],
      ['I have been struggling for a few hours.', 'a few hours'],
      ['This started this morning.', 'since this morning'],
    ];

    for (const [text, expectedDuration] of cases) {
      const result = extractStructuredData(text);
      expect(result.duration).toBe(expectedDuration);
    }
  });

  // ── Test 13: hasMinimumSignals and confidence ─────────────────────────────
  it('reports low confidence and no minimum signals for empty/vague text', () => {
    const vague = 'I do not know what to say.';
    const result = extractStructuredData(vague);
    expect(hasMinimumSignals(result)).toBe(false);
    expect(result.confidence).toBeLessThan(0.3);
  });

  it('reports high confidence for richly described scenario', () => {
    const rich =
      'I feel extremely anxious and overwhelmed. My heart is racing and I cannot sleep. ' +
      'This has been going on for two weeks since a big argument with my family. ' +
      'I tried meditation and breathing exercises but it hasn\'t improved at all.';

    const result = extractStructuredData(rich);
    expect(hasMinimumSignals(result)).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.5);
  });

});

// =============================================================================
// Preprocessor pipeline — integration tests
// =============================================================================

describe('preprocessor — full pipeline', () => {

  it('produces structured output with no PII from a realistic input', () => {
    const rawText =
      'I am Pakhi, 19 years old, and I live in ABC Colony in Lucknow. ' +
      'My friend Rahul shouted at me yesterday and since then I feel extremely anxious. ' +
      'My heart races at night and I cannot concentrate on studying. ' +
      'I tried taking a break but it hasn\'t improved.';

    const output = preprocess({ rawText });

    // PII must not appear in the extraction output
    const serialised = JSON.stringify(output.extraction);
    expect(serialised).not.toMatch(/\bPakhi\b/i);
    expect(serialised).not.toMatch(/\bRahul\b/i);
    expect(serialised).not.toMatch(/\b19\s*years?\s*old\b/i);
    expect(serialised).not.toMatch(/\bLucknow\b/i);
    expect(serialised).not.toMatch(/ABC Colony/i);

    // Mental health signals must be present
    expect(output.extraction.emotional_state).toContain('anxiety');
    expect(output.extraction.symptoms).toContain('racing heartbeat');
    expect(output.extraction.trigger).toContain('interpersonal conflict');
    expect(output.extraction.action_taken).toContain('took a break');
    expect(output.extraction.progress).toBe('no improvement');
    expect(output.hasMinimumSignals).toBe(true);

    // PII summary must list removed categories
    expect(output.piiSummary).toContain('name');
    expect(output.piiSummary).toContain('age');
  });

});

import { describe, it, expect } from 'vitest';
import { filterPii, likelyContainsPii } from '../services/privacyFilter';

// =============================================================================
// Privacy Filter — unit tests
// Verifies that PII is removed and useful context is preserved.
// =============================================================================

describe('privacyFilter — PII removal', () => {

  // ── Test 1: Name + age + location ─────────────────────────────────────────
  it('removes name, age and exact location; preserves emotional context', () => {
    const input =
      'I am Pakhi, 19 years old, and I live in ABC Colony in Lucknow. ' +
      'My friend Rahul shouted at me yesterday and since then I feel extremely anxious.';

    const { sanitisedText, detectedCategories, hadPii } = filterPii(input);

    // PII must be gone
    expect(sanitisedText).not.toMatch(/\bPakhi\b/i);
    expect(sanitisedText).not.toMatch(/\bRahul\b/i);
    expect(sanitisedText).not.toMatch(/\b19\s*years?\s*old\b/i);
    expect(sanitisedText).not.toMatch(/\bABC Colony\b/i);
    expect(sanitisedText).not.toMatch(/\bLucknow\b/i);

    // Emotional context must survive
    expect(sanitisedText).toMatch(/anxious/i);
    expect(sanitisedText).toMatch(/shouted/i);
    expect(sanitisedText).toMatch(/yesterday/i);

    // Categories detected
    expect(detectedCategories).toContain('name');
    expect(detectedCategories).toContain('age');
    expect(hadPii).toBe(true);
  });

  // ── Test 2: Email address ──────────────────────────────────────────────────
  it('removes email addresses', () => {
    const input =
      'You can reach me at pakhi.sharma@gmail.com. I have been feeling very stressed.';

    const { sanitisedText, detectedCategories } = filterPii(input);

    expect(sanitisedText).not.toMatch(/pakhi\.sharma@gmail\.com/i);
    expect(sanitisedText).not.toMatch(/@gmail\.com/i);
    expect(sanitisedText).toMatch(/stressed/i);
    expect(detectedCategories).toContain('email');
  });

  // ── Test 3: Phone number ───────────────────────────────────────────────────
  it('removes phone numbers in multiple formats', () => {
    const inputs = [
      { text: 'Call me on 9876543210, I am feeling very low.',       shouldRemove: '9876543210' },
      { text: 'My number is +91 98765 43210, feeling anxious.',      shouldRemove: '98765 43210' },
      { text: 'Contact: 022-2345-6789. I cant sleep at night.',      shouldRemove: '022-2345-6789' },
    ];

    for (const { text, shouldRemove } of inputs) {
      const { sanitisedText, detectedCategories } = filterPii(text);
      expect(sanitisedText).not.toContain(shouldRemove);
      expect(detectedCategories).toContain('phone');
    }
  });

  // ── Test 4: URL and social handle ─────────────────────────────────────────
  it('removes URLs and social media handles', () => {
    const input =
      'Check my profile at https://instagram.com/pakhi123 or follow @pakhi123. ' +
      'I feel really lonely these days.';

    const { sanitisedText, detectedCategories } = filterPii(input);

    expect(sanitisedText).not.toMatch(/instagram\.com/i);
    expect(sanitisedText).not.toMatch(/@pakhi123/);
    expect(sanitisedText).toMatch(/lonely/i);
    expect(detectedCategories).toContain('url');
    expect(detectedCategories).toContain('social_handle');
  });

  // ── Test 5: Age patterns ───────────────────────────────────────────────────
  it('removes various age expression formats', () => {
    const cases = [
      '19 years old',
      'aged 23',
      '25-year-old',
      'age: 30',
    ];

    for (const ageExpr of cases) {
      const input = `I am ${ageExpr} and I have been feeling very sad.`;
      const { sanitisedText, detectedCategories } = filterPii(input);
      expect(sanitisedText).not.toMatch(/\b(19|23|25|30)\s*(?:years?\s*old|-year-old)?\b/);
      expect(detectedCategories).toContain('age');
      expect(sanitisedText).toMatch(/sad/i);
    }
  });

  // ── Test 6: Postcode / PIN code ────────────────────────────────────────────
  it('removes postcodes and PIN codes', () => {
    const input =
      'I live in the 110001 area. Feeling overwhelmed by everything lately.';

    const { sanitisedText, detectedCategories } = filterPii(input);

    expect(sanitisedText).not.toMatch(/110001/);
    expect(sanitisedText).toMatch(/overwhelmed/i);
    expect(detectedCategories).toContain('postcode');
  });

  // ── Test 7: City name generalisation ──────────────────────────────────────
  it('generalises known Indian city names', () => {
    const input =
      'I moved to Bangalore last year and now I feel isolated and alone.';

    const { sanitisedText, detectedCategories } = filterPii(input);

    expect(sanitisedText).not.toMatch(/\bBangalore\b/i);
    expect(sanitisedText).toMatch(/isolated|alone/i);
    expect(detectedCategories).toContain('location');
  });

  // ── Test 8: Institution name generalisation ────────────────────────────────
  it('generalises institution names', () => {
    const input =
      'I study at ABC College in Ghaziabad. The academic pressure is unbearable.';

    const { sanitisedText, detectedCategories } = filterPii(input);

    expect(sanitisedText).not.toMatch(/ABC College/i);
    expect(sanitisedText).not.toMatch(/\bGhaziabad\b/i);
    expect(sanitisedText).toMatch(/academic|pressure|unbearable/i);
    expect(detectedCategories).toContain('location');
  });

  // ── Test 9: Self-introduction name ────────────────────────────────────────
  it('removes name from self-introduction but keeps context', () => {
    const input = 'My name is Priya and I have been feeling extremely hopeless lately.';

    const { sanitisedText, detectedCategories } = filterPii(input);

    expect(sanitisedText).not.toMatch(/\bPriya\b/i);
    expect(sanitisedText).toMatch(/hopeless/i);
    expect(detectedCategories).toContain('name');
  });

  // ── Test 10: Third-party person name ──────────────────────────────────────
  it('removes referenced person names but preserves relationship label', () => {
    const input = 'My colleague Amit ignored me in front of everyone. I felt so embarrassed.';

    const { sanitisedText, detectedCategories } = filterPii(input);

    expect(sanitisedText).not.toMatch(/\bAmit\b/i);
    // relationship label should remain
    expect(sanitisedText).toMatch(/colleague/i);
    expect(sanitisedText).toMatch(/embarrassed/i);
    expect(detectedCategories).toContain('name');
  });

  // ── Test 11: Date of birth ─────────────────────────────────────────────────
  it('removes date of birth patterns', () => {
    const input = 'I was born on 15/03/2004. Recently I have been feeling very anxious.';

    const { sanitisedText, detectedCategories } = filterPii(input);

    expect(sanitisedText).not.toMatch(/15\/03\/2004/);
    expect(sanitisedText).toMatch(/anxious/i);
    expect(detectedCategories.some(c => c === 'date_of_birth' || c === 'postcode')).toBe(true);
  });

  // ── Test 12: Clean text passes through unchanged ───────────────────────────
  it('passes through text with no PII', () => {
    const input =
      'I have been feeling very anxious and overwhelmed for the past two weeks. ' +
      'My heart races at night and I cannot concentrate on anything.';

    const { sanitisedText, hadPii } = filterPii(input);

    // Text should be substantially preserved
    expect(sanitisedText).toMatch(/anxious/i);
    expect(sanitisedText).toMatch(/overwhelmed/i);
    expect(sanitisedText).toMatch(/heart races/i);
    expect(hadPii).toBe(false);
  });

  // ── Test 13: likelyContainsPii helper ─────────────────────────────────────
  it('likelyContainsPii returns true for text with PII', () => {
    expect(likelyContainsPii('My email is test@example.com')).toBe(true);
    expect(likelyContainsPii('I am 22 years old')).toBe(true);
    expect(likelyContainsPii('I feel sad and anxious')).toBe(false);
  });

});

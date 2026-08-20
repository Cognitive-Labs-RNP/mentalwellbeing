/**
 * preprocessor.ts — Local preprocessing pipeline orchestrator
 *
 * This is the ONLY entry point the rest of the application should use.
 * It enforces the privacy boundary:
 *
 *   Raw user text  →  [privacyFilter]  →  sanitised text
 *                                              ↓
 *                                       [localExtractor]
 *                                              ↓
 *                                     ExtractionResult (structured JSON)
 *                                              ↓
 *                                    [STOP — Phase 3 AI receives this]
 *
 * The raw text is used only inside this function and is never returned,
 * stored, or forwarded to any external service by this module.
 */

import { filterPii } from './privacyFilter';
import { extractStructuredData, hasMinimumSignals } from './localExtractor';
import type { PreprocessorInput, PreprocessorOutput } from '../types/extraction';

/**
 * Run the full local preprocessing pipeline.
 *
 * @param input - Contains only rawText; everything else is derived locally.
 * @returns     - Structured extraction result + metadata. Raw text is discarded.
 *
 * @example
 * ```ts
 * const output = preprocess({ rawText: userInput });
 * // output.extraction is safe to pass to Phase 3 AI
 * // output.piiSummary tells the UI which PII categories were removed
 * // output.hasMinimumSignals indicates whether the extraction is usable
 * ```
 */
export function preprocess(input: PreprocessorInput): PreprocessorOutput {
  const { rawText } = input;

  // -------------------------------------------------------------------------
  // Step 1 — Privacy filter
  // Remove/generalise PII from the raw text.
  // The original rawText reference ends here — it is not used again.
  // -------------------------------------------------------------------------
  const filterResult = filterPii(rawText);

  // -------------------------------------------------------------------------
  // Step 2 — Structured extraction
  // Extract mental-health signals from the sanitised text only.
  // -------------------------------------------------------------------------
  const extraction = extractStructuredData(
    filterResult.sanitisedText,
    filterResult.detectedCategories
  );

  // -------------------------------------------------------------------------
  // Step 3 — Signal quality check
  // -------------------------------------------------------------------------
  const signalsFound = hasMinimumSignals(extraction);

  return {
    extraction,
    piiSummary: filterResult.detectedCategories,
    hasMinimumSignals: signalsFound,
  };
}

/**
 * Convenience wrapper that returns only the extraction result.
 * Useful when the caller does not need PII metadata.
 */
export function extractFromText(rawText: string) {
  return preprocess({ rawText }).extraction;
}

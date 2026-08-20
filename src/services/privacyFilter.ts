/**
 * privacyFilter.ts — Local PII detection and removal
 *
 * Runs entirely in the browser/Node — no external API calls.
 * Uses regex patterns, keyword lists, and phrase heuristics.
 *
 * Design principle: conservative removal.
 * - Remove obvious direct identifiers (email, phone, name patterns).
 * - Generalise specific locations and institutions.
 * - Preserve all useful emotional/symptom/context information.
 * - Never attempt to infer identity from indirect signals.
 */

import type { PiiDetectionResult, PiiCategory } from '../types/extraction';

// =============================================================================
// REGEX PATTERNS
// =============================================================================

/** RFC-5321-ish email — catches the common forms reliably */
const EMAIL_RE = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g;

/**
 * Phone numbers — covers:
 * - International: +91 98765 43210, +1-800-555-0199
 * - Local 10-digit: 9876543210, 98765 43210
 * - With separators: (022) 2345-6789, 022-2345-6789
 */
const PHONE_RE =
  /(\+?\d{1,3}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,5}[\s\-.]?\d{3,5}(\s?(ext|x|ext\.)\s?\d{1,5})?/g;

/**
 * Age patterns:
 * "19 years old", "aged 23", "I am 25 years", "age: 30", "23-year-old"
 */
const AGE_RE =
  /\b(\d{1,3})\s*[-–]?\s*(years?\s*old|yr\s*old|year-old|yrs?\s*old)\b|\baged?\s*\d{1,3}\b|\bage\s*[:\-]?\s*\d{1,3}\b|\b\d{1,3}\s*[-–]\s*year[-–]old\b/gi;

/**
 * Date of birth patterns:
 * "born on 12/03/2004", "DOB: 1999-04-15", "birthday on March 3"
 */
const DOB_RE =
  /\b(born\s*(on|in)?|DOB\s*[:\-]?|date\s*of\s*birth\s*[:\-]?|birthday\s*(on|is)?)\s*[\w\s,\/\-]+\d{4}\b/gi;

/**
 * Explicit date patterns (standalone dates that may reveal DOB or specific event context)
 * Only targets clearly formatted dates, not vague temporal references like "yesterday".
 */
const EXPLICIT_DATE_RE =
  /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/g;

/**
 * PIN / postal codes — India (6 digit), UK, US ZIP (5 or 5+4)
 */
const POSTCODE_RE =
  /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b|\b\d{5}(?:[-\s]\d{4})?\b|\b\d{6}\b/g;

/**
 * URLs and social handles
 */
const URL_RE =
  /https?:\/\/[^\s]+|www\.[^\s]+|\b[A-Za-z0-9._%+\-]+\.(com|net|org|in|io|co)\b/gi;
const SOCIAL_HANDLE_RE = /[@#][A-Za-z0-9_.]{2,}/g;

/**
 * House / flat / door numbers with street names:
 * "Flat 3B, MG Road", "12/A Nehru Street", "#45 Park Avenue"
 * Conservative — only catches clear address patterns.
 */
const ADDRESS_RE =
  /\b(flat|apartment|apt|house|plot|door|no\.?|#)\s*\d+[A-Za-z\-\/]*[,\s]+[A-Za-z\s]+(?:road|street|lane|avenue|colony|nagar|marg|chowk|bazaar|sector|phase|block|area|locality|layout)\b/gi;

// =============================================================================
// NAME DETECTION
// Heuristic: detect "I am [Name]", "my name is [Name]", "call me [Name]"
// Conservative — only removes when preceded by explicit self-introduction phrases.
// =============================================================================

/**
 * Name intro: "I am Priya", "my name is Rahul", "call me Dev", "I'm Sara"
 * Removes the capitalised name token; preserves the intro phrase.
 * Uses a factory function so a fresh regex (with lastIndex=0) is created per call.
 */
function makeNameIntroRe(): RegExp {
  return /\b(I\s+am|my\s+name\s+is|call\s+me|this\s+is|i'm|i\s+go\s+by)\s+([A-Z][a-z]{1,20})\b/gi;
}

/**
 * Friend / person references: "my friend Rahul", "my colleague Priya"
 * Removes the name but preserves the relationship label.
 */
function makePersonRefRe(): RegExp {
  return /\b(my\s+(?:friend|colleague|classmate|roommate|neighbour|neighbor|boss|manager|partner|boyfriend|girlfriend|husband|wife|sister|brother|mother|father|mom|dad|uncle|aunt|cousin|teacher|professor|doctor))\s+([A-Z][a-z]{1,20})\b/gi;
}

// =============================================================================
// LOCATION GENERALISATION
// Map specific place types to generic context labels.
// Does NOT attempt a worldwide city database — uses pattern categories.
// =============================================================================

interface LocationPattern {
  pattern: RegExp;
  replacement: string;
}

const LOCATION_PATTERNS: LocationPattern[] = [
  // Educational institutions
  {
    pattern:
      /\b[A-Z][A-Za-z\s]*(?:university|college|institute|school|academy|iit|nit|iim|bit|dit)\b(?:\s*,\s*[A-Za-z\s]+)?/gi,
    replacement: 'an educational setting',
  },
  // Hostels / PGs
  {
    pattern: /\b(?:my\s+)?(?:hostel|pg|paying\s+guest|dormitory|dorm)\b(?:\s+(?:in|at|on)\s+[A-Za-z\s]+)?/gi,
    replacement: 'a residential setting',
  },
  // Hospitals / clinics
  {
    pattern:
      /\b[A-Z][A-Za-z\s]*(?:hospital|clinic|medical\s+centre|healthcare|nursing\s+home)\b(?:\s*,\s*[A-Za-z\s]+)?/gi,
    replacement: 'a healthcare setting',
  },
  // Offices / companies
  {
    pattern:
      /\b[A-Z][A-Za-z\s]*(?:office|company|firm|corporation|ltd|pvt|inc|llc)\b(?:\s*,\s*[A-Za-z\s]+)?/gi,
    replacement: 'a workplace',
  },
  // Named colonies / societies / localities (common South Asian pattern)
  {
    pattern:
      /\b[A-Z][A-Za-z\s]*(?:colony|nagar|vihar|enclave|society|township|residency|apartments)\b/gi,
    replacement: 'a residential area',
  },
  // Streets / roads (named)
  {
    pattern:
      /\b[A-Z][A-Za-z\s]+(?:road|street|lane|avenue|marg|path|gali)\b/gi,
    replacement: 'a local area',
  },
  // Indian cities (high-frequency set — conservative list)
  {
    pattern:
      /\b(?:Mumbai|Delhi|Bangalore|Bengaluru|Hyderabad|Chennai|Kolkata|Pune|Ahmedabad|Jaipur|Lucknow|Kanpur|Nagpur|Indore|Bhopal|Patna|Vadodara|Ghaziabad|Ludhiana|Agra|Nashik|Faridabad|Meerut|Rajkot|Varanasi|Srinagar|Aurangabad|Dhanbad|Amritsar|Allahabad|Prayagraj|Ranchi|Jabalpur|Gwalior|Coimbatore|Vijayawada|Jodhpur|Madurai|Raipur|Kota|Guwahati|Chandigarh|Thiruvananthapuram|Noida|Gurugram|Gurgaon|Thane|Navi\s+Mumbai|Surat|Visakhapatnam|Vizag)\b/gi,
    replacement: 'a city in India',
  },
  // Major world cities
  {
    pattern:
      /\b(?:London|Manchester|Birmingham|New\s+York|Los\s+Angeles|Chicago|Houston|Phoenix|San\s+Francisco|Seattle|Boston|Toronto|Vancouver|Sydney|Melbourne|Dubai|Singapore|Tokyo|Paris|Berlin|Amsterdam|Madrid|Rome|Beijing|Shanghai|Hong\s+Kong)\b/gi,
    replacement: 'a city',
  },
  // State / country names when used as location context
  {
    pattern:
      /\b(?:in|from|at|near)\s+(?:Uttar\s+Pradesh|Maharashtra|Karnataka|Tamil\s+Nadu|West\s+Bengal|Rajasthan|Gujarat|Madhya\s+Pradesh|Bihar|Andhra\s+Pradesh|Telangana|Kerala|Odisha|Punjab|Haryana|Jharkhand|Assam|Uttarakhand|Himachal\s+Pradesh|Goa|India|Pakistan|Bangladesh|Nepal|Sri\s+Lanka|USA|UK|Canada|Australia)\b/gi,
    replacement: 'in a region',
  },
];

// =============================================================================
// UTILITY
// =============================================================================

function dedupeCategories(arr: PiiCategory[]): PiiCategory[] {
  return [...new Set(arr)];
}

/**
 * Collapse multiple consecutive whitespace/punctuation artifacts left
 * after replacement into clean single spaces.
 */
function cleanupSpacing(text: string): string {
  return text
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*,/g, ',')
    .replace(/\.\s*\./g, '.')
    .trim();
}

// =============================================================================
// MAIN FILTER FUNCTION
// =============================================================================

/**
 * Apply all PII filters to the input text.
 * Returns the sanitised text and metadata about what was removed.
 * The original text is never returned or stored.
 */
export function filterPii(rawText: string): PiiDetectionResult {
  const detected: PiiCategory[] = [];
  let text = rawText;

  // 1. Emails
  if (EMAIL_RE.test(text)) detected.push('email');
  EMAIL_RE.lastIndex = 0;
  text = text.replace(EMAIL_RE, '[contact info removed]');

  // 2. Phones — run before age so 10-digit sequences are caught first
  if (PHONE_RE.test(text)) detected.push('phone');
  PHONE_RE.lastIndex = 0;
  text = text.replace(PHONE_RE, (match) => {
    // Only replace if the match looks like a phone (≥7 consecutive digits)
    const digits = match.replace(/\D/g, '');
    return digits.length >= 7 ? '[contact info removed]' : match;
  });

  // 3. Date of birth (before age so "born on..." is caught completely)
  if (DOB_RE.test(text)) detected.push('date_of_birth');
  DOB_RE.lastIndex = 0;
  text = text.replace(DOB_RE, '[date removed]');

  // 4. Explicit formatted dates
  if (EXPLICIT_DATE_RE.test(text)) {
    if (!detected.includes('date_of_birth')) detected.push('date_of_birth');
  }
  EXPLICIT_DATE_RE.lastIndex = 0;
  text = text.replace(EXPLICIT_DATE_RE, '[date removed]');

  // 5. Age
  if (AGE_RE.test(text)) detected.push('age');
  AGE_RE.lastIndex = 0;
  text = text.replace(AGE_RE, '[age removed]');

  // 6. Postcodes
  if (POSTCODE_RE.test(text)) detected.push('postcode');
  POSTCODE_RE.lastIndex = 0;
  text = text.replace(POSTCODE_RE, '[postcode removed]');

  // 7. Named addresses (before general location so specifics are caught)
  if (ADDRESS_RE.test(text)) detected.push('address');
  ADDRESS_RE.lastIndex = 0;
  text = text.replace(ADDRESS_RE, '[address removed]');

  // 8. Location generalisation
  let hadLocation = false;
  for (const { pattern, replacement } of LOCATION_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      hadLocation = true;
      pattern.lastIndex = 0;
      text = text.replace(pattern, replacement);
    } else {
      pattern.lastIndex = 0;
    }
  }
  if (hadLocation) detected.push('location');

  // 9. Self-introduction names — remove just the name token
  const nameIntroRe = makeNameIntroRe();
  if (nameIntroRe.test(text)) detected.push('name');
  text = text.replace(makeNameIntroRe(), (_match, intro) => intro);

  // 10. Third-party person names referenced with relationship labels
  //     Keep the relationship, remove the name.
  const personRefRe = makePersonRefRe();
  if (personRefRe.test(text)) {
    if (!detected.includes('name')) detected.push('name');
  }
  text = text.replace(makePersonRefRe(), (_match, relationship) => relationship);

  // 11. URLs
  if (URL_RE.test(text)) detected.push('url');
  URL_RE.lastIndex = 0;
  text = text.replace(URL_RE, '[link removed]');

  // 12. Social handles
  if (SOCIAL_HANDLE_RE.test(text)) {
    if (!detected.includes('social_handle')) detected.push('social_handle');
  }
  SOCIAL_HANDLE_RE.lastIndex = 0;
  text = text.replace(SOCIAL_HANDLE_RE, '[handle removed]');

  text = cleanupSpacing(text);

  return {
    sanitisedText: text,
    detectedCategories: dedupeCategories(detected),
    hadPii: detected.length > 0,
  };
}

/**
 * Quick check — does this text likely contain PII?
 * Useful for showing a privacy notice before processing.
 */
export function likelyContainsPii(text: string): boolean {
  const result = filterPii(text);
  return result.hadPii;
}

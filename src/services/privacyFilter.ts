import type { MoodScore, StructuredSummary } from '../types';

const NAME_REGEX =
  /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\b/g;

const EMAIL_REGEX =
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

const PHONE_REGEX =
  /(?:\+?\d{1,3}[\s\-.]?)?(?:\(?\d{2,4}\)?[\s\-.]?)?\d{3,4}[\s\-.]?\d{3,4}\b/g;

const ADDRESS_REGEX =
  /\b\d{1,5}\s+[\w\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl|Square|Sq|Terrace|Ter|Way|Close|Crescent|Cres)\b(?:[\s,]+[A-Za-z\s]+)?(?:[\s,]+[A-Z]{1,3}\d[\w\s-]*)?/gi;

const CONTEXT_TAG_KEYWORDS: Array<{ re: RegExp; tag: string }> = [
  { re: /\b(work|job|boss|colleague|meeting|deadline|office|email)\b/i, tag: 'work' },
  { re: /\b(family|parent|child|kid|son|daughter|mom|mum|dad|sibling|partner|spouse|husband|wife|relationship)\b/i, tag: 'relationships' },
  { re: /\b(sleep|tired|exhausted|insomnia|awake|nightmare)\b/i, tag: 'sleep' },
  { re: /\b(food|eat|meal|appetite|hungry|weight)\b/i, tag: 'nutrition' },
  { re: /\b(exercise|gym|run|walk|yoga|workout|sport)\b/i, tag: 'movement' },
  { re: /\b(money|financ|bill|debt|rent|pay|budget)\b/i, tag: 'finances' },
  { re: /\b(school|study|exam|homework|class|university|college|student)\b/i, tag: 'education' },
  { re: /\b(health|doctor|hospital|pain|illness|sick|medication|medicine)\b/i, tag: 'health' },
  { re: /\b(friend|lonely|alone|social|party|isolat)\b/i, tag: 'social' },
];

const randomMood = (): MoodScore => {
  const val = 3 + Math.floor(Math.random() * 5);
  return val as MoodScore;
};

const detectContextTags = (text: string): string[] => {
  const tags = new Set<string>();
  for (const { re, tag } of CONTEXT_TAG_KEYWORDS) {
    if (re.test(text)) {
      tags.add(tag);
    }
  }
  return Array.from(tags);
};

const sanitiseText = (raw: string): string => {
  let out = raw;
  out = out.replace(EMAIL_REGEX, '[REDACTED]');
  out = out.replace(PHONE_REGEX, '[REDACTED]');
  out = out.replace(ADDRESS_REGEX, '[REDACTED]');
  out = out.replace(NAME_REGEX, '[REDACTED]');
  return out;
};

export const LocalPrivacyFilter = {
  filter(rawText: string): StructuredSummary {
    const sanitisedDescription = sanitiseText(rawText);
    const contextTags = detectContextTags(sanitisedDescription);
    return {
      mood: randomMood(),
      stress: randomMood(),
      energy: randomMood(),
      contextTags,
      sanitisedDescription,
    };
  },

  previewSummary(rawText: string): {
    sanitisedDescription: string;
    contextTags: string[];
    suggestedMood: MoodScore;
    suggestedStress: MoodScore;
    suggestedEnergy: MoodScore;
  } {
    const sanitisedDescription = sanitiseText(rawText);
    const contextTags = detectContextTags(sanitisedDescription);
    return {
      sanitisedDescription,
      contextTags,
      suggestedMood: randomMood(),
      suggestedStress: randomMood(),
      suggestedEnergy: randomMood(),
    };
  },
};

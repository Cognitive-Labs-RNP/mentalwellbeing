type ConcernLevel = 'none' | 'low' | 'high';

interface SafetyScreenResult {
  concernLevel: ConcernLevel;
  message?: string;
}

const HIGH_RISK_PATTERNS: Array<{ re: RegExp; context?: RegExp }> = [
  { re: /\b(kill|killing|kill myself|end my life|end it all|want to die)\b/i },
  { re: /\b(suicid|suicide|suicidal|take my own life|hang myself|jump off|overdose)\b/i },
  { re: /\b(self[- ]?harm|self harm|cut myself|cutting myself|hurt myself|harm myself)\b/i },
  { re: /\b(crisis line|emergency|need help now|can't go on|can[’']?t live|give up on life)\b/i },
  {
    re: /\b(no reason to live|life is not worth|everyone better off|better off without me|worthless and want to)\b/i,
  },
];

const LOW_RISK_PATTERNS: Array<{ re: RegExp }> = [
  { re: /\b(feeling hopeless|really down|i feel empty|numb|nothing matters|so alone|lonely and sad)\b/i },
  { re: /\b(depressed|anxious|panic|overwhelmed|stressed out|falling apart)\b/i },
  { re: /\b(crying|teary|sad all day|can[’']?t stop crying)\b/i },
  { re: /\b(angry all the time|rage|want to hurt|furious)\b/i },
];

const HIGH_MESSAGE =
  "What you're sharing sounds really heavy, and your safety matters a lot. Please know that you don't have to go through this alone. If you are in immediate danger or having thoughts of harming yourself, please contact your local crisis line or emergency services right now. You deserve care and support, and there are people who can help you through this moment.";

const LOW_MESSAGE =
  "I'm sorry you're going through something difficult right now. It takes courage to acknowledge how you're feeling. Consider taking a small, gentle step for yourself: a few slow breaths, a glass of water, or reaching out to someone you trust. If this feeling persists or intensifies, please consider speaking with a mental health professional or a crisis support service.";

export const SafetyEngine = {
  screen(text: string): SafetyScreenResult {
    if (!text || typeof text !== 'string') {
      return { concernLevel: 'none' };
    }

    for (const { re, context } of HIGH_RISK_PATTERNS) {
      if (re.test(text)) {
        if (context && !context.test(text)) {
          continue;
        }
        return {
          concernLevel: 'high',
          message: HIGH_MESSAGE,
        };
      }
    }

    for (const { re } of LOW_RISK_PATTERNS) {
      if (re.test(text)) {
        return {
          concernLevel: 'low',
          message: LOW_MESSAGE,
        };
      }
    }

    return { concernLevel: 'none' };
  },
};

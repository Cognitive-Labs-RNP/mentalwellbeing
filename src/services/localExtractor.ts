/**
 * localExtractor.ts — Local structured information extractor
 *
 * Works entirely offline using keyword dictionaries, synonyms, and regex.
 * No NLP library, no embeddings, no external API.
 *
 * Input:  sanitised text from privacyFilter.ts
 * Output: ExtractionResult — structured JSON ready for Phase 3 AI
 */

import type {
  ExtractionResult,
  EmotionalState,
  Symptom,
  Trigger,
  ActionTaken,
  ProgressSignalLocal,
  SeverityLevel,
  FrequencyLevel,
  SituationState,
  ImpactArea,
  PiiCategory,
} from '../types/extraction';

// =============================================================================
// HELPER — normalise text for matching
// =============================================================================

const normalise = (t: string): string => t.toLowerCase().replace(/[''`]/g, "'");

/** Returns true if any of the phrases appear in the text */
function matchesAny(text: string, phrases: string[]): boolean {
  const n = normalise(text);
  return phrases.some((p) => n.includes(p));
}

/** Returns all matching entries from the dictionary */
function matchAll<T extends string>(
  text: string,
  dict: Record<T, string[]>
): T[] {
  const n = normalise(text);
  const results: T[] = [];
  for (const [key, phrases] of Object.entries(dict) as [T, string[]][]) {
    if (phrases.some((p) => n.includes(p))) {
      results.push(key);
    }
  }
  return results;
}

// =============================================================================
// DICTIONARIES
// Each key is a canonical value; the array is the set of synonyms/phrases.
// =============================================================================

// ---------------------------------------------------------------------------
// 1. Emotional state
// ---------------------------------------------------------------------------

const EMOTIONAL_STATE_DICT: Record<EmotionalState, string[]> = {
  sadness: [
    'sad', 'sadness', 'feeling sad', 'feel sad', 'unhappy', 'down', 'low',
    'blue', 'miserable', 'depressed', 'gloomy', 'dejected', 'heartbroken',
    'sorrowful', 'tearful', 'feel empty', 'feeling empty', 'feel hollow',
  ],
  anxiety: [
    'anxious', 'anxiety', 'worried', 'worry', 'worrying', 'nervous',
    'nervousness', 'on edge', 'uneasy', 'unease', 'apprehensive', 'tense',
    'panicky', 'feel anxious', 'feeling anxious', 'stressed out',
    'overthinking', 'cant stop thinking', "can't stop thinking",
  ],
  anger: [
    'angry', 'anger', 'furious', 'rage', 'mad', 'irritated', 'irritation',
    'aggravated', 'livid', 'outraged', 'resentful', 'resentment',
    'boiling', 'fuming', 'snapping', 'lose temper', 'losing temper',
    'short temper', 'hot headed',
  ],
  fear: [
    'afraid', 'scared', 'fear', 'fearful', 'terrified', 'terror', 'dread',
    'dreading', 'frightened', 'petrified', 'phobia', 'phobic',
    'feel unsafe', 'feeling unsafe', 'feel threatened',
  ],
  loneliness: [
    'lonely', 'loneliness', 'alone', 'isolated', 'isolation', 'no one to talk',
    'no one understands', 'feel left out', 'feeling left out', 'excluded',
    'cut off', 'disconnected', 'no friends', 'all alone',
  ],
  guilt: [
    'guilty', 'guilt', 'feel guilty', 'blame myself', 'blaming myself',
    'my fault', 'regret', 'regretful', 'remorseful', 'remorse',
    'should have', 'shouldnt have', "shouldn't have",
  ],
  shame: [
    'ashamed', 'shame', 'feel ashamed', 'humiliated', 'humiliation',
    'disgrace', 'disgraced', 'feel worthless', 'feeling worthless',
    'not good enough', 'inferior',
  ],
  embarrassment: [
    'embarrassed', 'embarrassment', 'feel embarrassed', 'awkward', 'awkwardness',
    'mortified', 'cringe', 'cringed', 'red faced',
  ],
  frustration: [
    'frustrated', 'frustration', 'feel frustrated', 'fed up', 'fed-up',
    'exasperated', 'exasperation', 'at my wits end', 'annoyed', 'annoying',
    'irritating', 'cant take it', "can't take it",
  ],
  overwhelm: [
    'overwhelmed', 'overwhelm', 'too much', 'too many things', 'overloaded',
    'cant cope', "can't cope", 'drowning', 'suffocating', 'buried',
    'cant handle', "can't handle", 'everything at once', 'so much going on',
  ],
  irritation: [
    'irritable', 'irritability', 'snappy', 'on edge', 'easily annoyed',
    'short fuse', 'touchy', 'grumpy', 'grouchy', 'cranky',
  ],
  confusion: [
    'confused', 'confusion', 'unsure', 'uncertain', 'dont know what',
    "don't know what", "don't understand", 'lost', 'disoriented',
    'mixed up', 'cant think clearly', "can't think clearly",
  ],
  disappointment: [
    'disappointed', 'disappointment', 'let down', 'let myself down',
    'expected more', 'not what i expected', 'failed expectations',
    'things didnt work', "things didn't work",
  ],
  hopelessness: [
    'hopeless', 'hopelessness', 'no hope', 'no point', 'pointless',
    'nothing will change', 'whats the point', "what's the point",
    'giving up', 'cant see a way', "can't see a way", 'no future',
    'nothing to look forward', 'feels impossible',
  ],
  excitement: [
    'excited', 'excitement', 'thrilled', 'enthusiastic', 'looking forward',
    'cant wait', "can't wait", 'eager', 'pumped', 'energised', 'energized',
  ],
  happiness: [
    'happy', 'happiness', 'joyful', 'joy', 'pleased', 'delighted',
    'content', 'contented', 'cheerful', 'elated', 'great mood',
    'feeling good', 'feel good',
  ],
  relief: [
    'relieved', 'relief', 'feel relieved', 'weight lifted', 'less worried',
    'burden lifted', 'finally over', 'thank goodness',
  ],
  nervousness: [
    'nervous', 'jittery', 'jumpy', 'shaky', 'butterflies', 'on edge',
    'stomach in knots', 'tense before', 'sweaty palms',
  ],
  stress: [
    'stressed', 'stress', 'under pressure', 'pressure', 'stressful',
    'too much pressure', 'burnt out', 'burned out', 'strained',
  ],
  grief: [
    'grief', 'grieving', 'mourning', 'loss', 'lost someone', 'bereavement',
    'miss them', 'missing them greatly',
  ],
  panic: [
    'panic', 'panicking', 'panic attack', 'heart racing and cant breathe',
    "heart racing and can't breathe", 'suddenly feel like dying',
    'feel like something terrible', 'intense fear suddenly',
  ],
  numbness: [
    'numb', 'numbness', 'feel nothing', 'cant feel', "can't feel",
    'emotionally numb', 'detached', 'going through motions',
    'disconnected from feelings', 'empty inside',
  ],
};

// ---------------------------------------------------------------------------
// 2. Symptoms
// ---------------------------------------------------------------------------

const SYMPTOM_DICT: Record<Symptom, string[]> = {
  headache: [
    'headache', 'head ache', 'head pain', 'my head hurts', 'head is hurting',
    'migraine', 'head throbbing',
  ],
  dizziness: [
    'dizzy', 'dizziness', 'lightheaded', 'light headed', 'spinning',
    'room spinning', 'feeling faint',
  ],
  nausea: [
    'nausea', 'nauseous', 'feel sick', 'feeling sick', 'want to vomit',
    'want to throw up', 'stomach turning',
  ],
  fatigue: [
    'fatigue', 'tired', 'exhausted', 'exhaustion', 'drained', 'no energy',
    'low energy', 'worn out', 'run down', 'wiped out', 'sluggish',
    'lethargic', 'lethargy', 'always tired',
  ],
  weakness: [
    'weak', 'weakness', 'feel weak', 'no strength', 'body feels heavy',
    'heavy limbs', 'feeling heavy',
  ],
  'racing heartbeat': [
    'racing heart', 'heart racing', 'heart pounding', 'heart beats fast',
    'heart beating fast', 'heart keeps beating', 'heart beat fast',
    'heart is racing', 'heart is pounding', 'heart is beating fast',
    'heart races', 'palpitation', 'palpitations', 'fast heartbeat',
    'rapid heartbeat', 'heart fluttering', 'chest pounding',
    'my heart races', 'heart is going fast',
  ],
  sweating: [
    'sweating', 'sweat', 'sweaty', 'perspiring', 'cold sweat', 'night sweat',
    'night sweats', 'drenched in sweat',
  ],
  trembling: [
    'trembling', 'shaking', 'shaky', 'tremors', 'hands shake', 'hands shaking',
    'body shaking', 'can\'t stop shaking', 'quivering',
  ],
  'shortness of breath': [
    'short of breath', 'shortness of breath', 'cant breathe', "can't breathe",
    'difficulty breathing', 'hard to breathe', 'breathless', 'breathlessness',
    'gasping', 'tightness in chest when breathing',
  ],
  'chest discomfort': [
    'chest pain', 'chest discomfort', 'chest tightness', 'tight chest',
    'pressure in chest', 'chest feels tight', 'heaviness in chest',
  ],
  'stomach discomfort': [
    'stomach pain', 'stomach ache', 'stomachache', 'stomach discomfort',
    'upset stomach', 'gut pain', 'abdominal pain', 'stomach cramps',
    'stomach in knots', 'my stomach is in knots', 'butterflies in stomach',
    'stomach turning', 'stomach is in knots', 'knots in my stomach',
  ],
  'difficulty sleeping': [
    'cant sleep', "can't sleep", 'difficulty sleeping', 'trouble sleeping',
    'insomnia', 'sleepless', 'sleeplessness', 'tossing and turning',
    'waking up at night', 'wake up early', 'lying awake', 'restless sleep',
    'not sleeping well', 'poor sleep', 'sleep problems', 'sleep issues',
  ],
  oversleeping: [
    'oversleeping', 'sleeping too much', 'can\'t get out of bed', "can't get out of bed",
    'sleep all day', 'always sleeping', 'sleeping more than usual',
    'hard to wake up',
  ],
  'loss of appetite': [
    'no appetite', 'lost appetite', 'not eating', 'dont want to eat',
    "don't want to eat", 'no hunger', 'not hungry', 'skipping meals',
    'forgetting to eat', 'food doesnt appeal', "food doesn't appeal",
  ],
  'increased appetite': [
    'eating more', 'overeating', 'stress eating', 'eating a lot',
    'constant hunger', 'always hungry', 'eating too much',
  ],
  'difficulty concentrating': [
    'cant concentrate', "can't concentrate", 'difficulty concentrating',
    'trouble concentrating', 'cant focus', "can't focus", 'trouble focusing',
    'difficulty focusing', 'mind wandering', 'mind goes blank',
    'losing focus', 'zoning out', 'distracted', 'attention problems',
    'cannot concentrate', 'cannot focus', 'hard to concentrate',
    'hard to focus', 'struggling to concentrate', 'struggling to focus',
  ],
  restlessness: [
    'restless', 'restlessness', 'cant sit still', "can't sit still",
    'fidgety', 'fidgeting', 'pacing', 'unable to relax', 'agitated',
  ],
  crying: [
    'crying', 'cry', 'cried', 'tears', 'tearing up', 'break down crying',
    'burst into tears', 'cant stop crying', "can't stop crying",
    'weeping', 'sobbing',
  ],
  'muscle tension': [
    'muscle tension', 'tense muscles', 'muscles are tense', 'my muscles are tense',
    'stiff', 'stiffness', 'tight shoulders', 'jaw clenching', 'grinding teeth',
    'neck tension', 'body tension', 'tense body', 'clenching', 'muscles tense',
  ],
  'feeling numb': [
    'feel numb', 'feeling numb', 'emotionally numb', 'numb inside',
    'cant feel anything', "can't feel anything", 'no feelings',
  ],
  'low energy': [
    'low energy', 'no energy', 'energy depleted', 'no motivation',
    'flat', 'feel flat', 'no drive', 'zero motivation',
  ],
  'excessive worry': [
    'excessive worry', 'worrying too much', 'overthinking everything',
    'cant stop worrying', "can't stop worrying", 'constant worry',
    'always worrying', 'mind wont stop', "mind won't stop",
  ],
  'intrusive thoughts': [
    'intrusive thoughts', 'unwanted thoughts', 'thoughts keep coming',
    'cant get thoughts out', "can't get thoughts out",
    'thoughts wont stop', "thoughts won't stop", 'racing thoughts',
    'intrusive memories',
  ],
  'brain fog': [
    'brain fog', 'foggy', 'mental fog', 'confused thinking', 'foggy headed',
    'cant think', "can't think", 'thinking is slow', 'mental clarity gone',
  ],
};

// ---------------------------------------------------------------------------
// 3. Triggers
// ---------------------------------------------------------------------------

const TRIGGER_DICT: Record<Trigger, string[]> = {
  exam: [
    'exam', 'exams', 'examination', 'test', 'quiz', 'viva', 'board exam',
    'finals', 'midterm', 'midterms',
  ],
  assignment: [
    'assignment', 'homework', 'project', 'submission', 'report due',
    'project deadline', 'coursework',
  ],
  'academic pressure': [
    'academic pressure', 'study pressure', 'pressure to study', 'grade pressure',
    'marks pressure', 'pressure from college', 'pressure from school',
    'academic stress', 'studies are stressful',
  ],
  workload: [
    'workload', 'too much work', 'overwhelming work', 'heavy workload',
    'lot of work', 'lots of work', 'so much work', 'work pressure',
    'too many tasks',
  ],
  argument: [
    'argument', 'fight', 'fighting', 'argued', 'had a fight', 'big fight',
    'shouting match', 'heated argument', 'dispute',
  ],
  conflict: [
    'conflict', 'confrontation', 'confronted', 'tension with',
    'issues with', 'problem with someone',
  ],
  'interpersonal conflict': [
    'shouted at me', 'yelled at me', 'screamed at me', 'someone yelled',
    'someone shouted', 'got into a fight with', 'they argued with me',
    'verbal fight', 'someone was rude', 'treated badly',
  ],
  criticism: [
    'criticised', 'criticized', 'criticism', 'negative feedback', 'told off',
    'scolded', 'rebuked', 'judged', 'made fun of', 'laughed at',
    'humiliated publicly',
  ],
  rejection: [
    'rejected', 'rejection', 'turned down', 'not selected', 'not chosen',
    'didnt get in', "didn't get in", 'denied', 'refused', 'ghosted',
  ],
  breakup: [
    'breakup', 'break up', 'broke up', 'relationship ended', 'ex',
    'split up', 'separated', 'she left', 'he left', 'they left',
  ],
  'friendship problem': [
    'friend problem', 'friendship issue', 'lost a friend', 'friend betrayed',
    'best friend', 'falling out with friend', 'friends ignored',
    'friends excluding', 'friends left me out',
  ],
  'family conflict': [
    'family fight', 'parents fighting', 'fight with parents', 'family problem',
    'home tension', 'domestic issue', 'trouble at home', 'family conflict',
    'parents arguing', 'family stress',
  ],
  'relationship issue': [
    'relationship problem', 'relationship trouble', 'relationship issue',
    'partner problem', 'couple issue', 'marriage problem', 'trust issues',
  ],
  'financial concern': [
    'financial stress', 'money problem', 'no money', 'cant afford',
    "can't afford", 'debt', 'financial pressure', 'money issues',
    'financial difficulty', 'broke',
  ],
  'social situation': [
    'social event', 'party', 'gathering', 'meeting people', 'social anxiety',
    'around people', 'crowd', 'public', 'presentation', 'speaking in public',
    'public speaking',
  ],
  failure: [
    'failed', 'failure', 'didnt pass', "didn't pass", 'flunked',
    'didnt succeed', "didn't succeed", 'failed the exam', 'failed the test',
  ],
  mistake: [
    'made a mistake', 'made an error', 'messed up', 'screwed up',
    'blundered', 'did something wrong', 'regret what i did',
  ],
  deadline: [
    'deadline', 'due date', 'submission date', 'running out of time',
    'time running out', 'deadline tomorrow', 'deadline today',
  ],
  'poor performance': [
    'poor performance', 'bad result', 'bad grade', 'bad marks',
    'low grade', 'low score', 'performed badly', 'did poorly',
    'below expectations',
  ],
  'uncertainty about future': [
    'uncertain about future', 'future is unclear', 'dont know what to do',
    "don't know what to do", 'confused about future', 'career confusion',
    'what will happen', 'no plan', 'future scares me',
  ],
  loss: [
    'lost someone', 'passed away', 'death', 'died', 'funeral',
    'bereavement', 'lost a loved one', 'grief',
  ],
  change: [
    'big change', 'moving', 'relocated', 'new city', 'new place',
    'new school', 'new job', 'life change', 'transition', 'everything changed',
  ],
  'health concern': [
    'health issue', 'medical problem', 'sick', 'illness', 'diagnosed',
    'chronic pain', 'health scare', 'worried about health',
  ],
  'work pressure': [
    'boss pressure', 'manager pressure', 'workplace stress', 'office tension',
    'tight deadline at work', 'performance review', 'appraisal stress',
  ],
  'public speaking': [
    'presentation', 'speech', 'speaking in front', 'presenting to class',
    'seminar', 'viva', 'oral exam',
  ],
  isolation: [
    'isolated', 'alone all the time', 'no social contact', 'staying indoors',
    'never go out', 'locked myself away', 'withdrew from everyone',
  ],
};

// ---------------------------------------------------------------------------
// 4. Actions taken
// ---------------------------------------------------------------------------

const ACTION_DICT: Record<ActionTaken, string[]> = {
  rested: [
    'rested', 'took rest', 'had rest', 'lying down', 'relaxed',
    'took it easy', 'took a nap',
  ],
  slept: [
    'slept', 'went to sleep', 'fell asleep', 'took a sleep', 'took sleep',
    'had a good sleep', 'tried to sleep',
  ],
  'took a break': [
    'took a break', 'took break', 'had a break', 'step away',
    'stepped away', 'took time off', 'took some time', 'paused',
    'taking a break', 'taken a break', 'take a break',
  ],
  'talked to someone': [
    'talked to someone', 'spoke to someone', 'told someone',
    'shared with someone', 'opened up to someone', 'confided in someone',
  ],
  'talked to a friend': [
    'talked to my friend', 'spoke to my friend', 'called my friend',
    'texted my friend', 'told my friend', 'confided in my friend',
  ],
  'talked to family': [
    'talked to family', 'spoke to family', 'told my parents',
    'talked to my parents', 'called home', 'spoke to my mom',
    'spoke to my dad', 'family support',
  ],
  exercised: [
    'exercised', 'workout', 'worked out', 'gym', 'went to gym',
    'jogging', 'ran', 'running', 'yoga', 'stretching', 'physical activity',
  ],
  walked: [
    'went for a walk', 'took a walk', 'walked', 'walking', 'strolled',
    'went outside for a walk', 'taking a walk', 'took walk', 'had a walk',
    'went on a walk', 'step outside',
  ],
  meditated: [
    'meditated', 'meditation', 'mindfulness', 'mindful', 'sat quietly',
    'calm breathing', 'tried meditation',
  ],
  'breathing exercise': [
    'breathing exercise', 'deep breathing', 'breathed deeply', 'breath work',
    'breathwork', 'tried breathing', 'slow breathing',
  ],
  journaled: [
    'journaled', 'wrote in journal', 'wrote it down', 'diary', 'wrote about it',
    'wrote my feelings', 'journaling',
  ],
  studied: [
    'studied', 'went back to studying', 'tried to study', 'focused on studies',
    'did my work', 'distracted by studying',
  ],
  'distracted themselves': [
    'distracted myself', 'watched tv', 'watched something',
    'played games', 'scrolled', 'kept busy', 'tried to distract',
    'stayed busy', 'occupied myself',
  ],
  'drank water': [
    'drank water', 'had water', 'hydrated', 'drank something',
  ],
  'ate something': [
    'ate something', 'had something to eat', 'had food', 'ate',
    'had a meal', 'had a snack',
  ],
  'tried to solve the problem': [
    'tried to solve', 'worked on it', 'addressed it', 'dealt with it',
    'tried to fix', 'took action',
  ],
  'avoided the situation': [
    'avoided', 'stayed away', 'avoided the person', 'avoided going',
    'didnt go', "didn't go", 'skipped it', 'ran away from', 'escaped',
  ],
  'sought professional help': [
    'saw a doctor', 'saw a therapist', 'therapy', 'counselling', 'counseling',
    'professional help', 'psychologist', 'psychiatrist', 'mental health professional',
  ],
  'did nothing': [
    'did nothing', 'nothing helped', 'didnt do anything', "didn't do anything",
    'no action', 'just sat there', 'couldnt do anything', "couldn't do anything",
  ],
  cried: [
    'cried', 'had a cry', 'cried it out', 'let myself cry', 'cried a lot',
  ],
  'listened to music': [
    'listened to music', 'played music', 'music helped', 'put on music',
    'headphones on', 'listened to songs',
  ],
  'watched something': [
    'watched something', 'watched a show', 'watched a movie', 'netflix',
    'binge watched', 'put on a show',
  ],
};

// ---------------------------------------------------------------------------
// 5. Progress signals
// ---------------------------------------------------------------------------

const PROGRESS_PATTERNS: Record<ProgressSignalLocal, string[]> = {
  improving: [
    'improving', 'feeling better', 'getting better', 'less intense',
    'reduced', 'calming down', 'calmed down', 'better now',
    'starting to improve', 'slowly getting better', 'bit better',
    'somewhat better', 'gradually improving',
  ],
  worsening: [
    'worsening', 'getting worse', 'more intense', 'increasingly',
    'becoming worse', 'escalating', 'worse than before', 'got worse',
    'much worse', 'worse now', 'harder to deal with',
  ],
  unchanged: [
    'unchanged', 'same as before', 'no change', 'still the same',
    'still happening', 'still there', 'hasnt changed', "hasn't changed",
  ],
  resolved: [
    'resolved', 'gone', 'completely better', 'feeling normal', 'over it',
    'all good now', 'no longer', 'went away', 'disappeared', 'sorted out',
  ],
  'no improvement': [
    'no improvement', "hasn't improved", 'hasnt improved', 'not improving',
    'not getting better', "hasn't helped", 'hasnt helped', 'nothing helps',
    'nothing is helping', 'tried but failed', 'still struggling',
    "doesn't help", 'doesnt help',
  ],
  fluctuating: [
    'fluctuating', 'on and off', 'comes and goes', 'up and down',
    'sometimes better sometimes worse', 'varies', 'inconsistent',
    'not consistent', 'unpredictable',
  ],
};

// ---------------------------------------------------------------------------
// 6. Severity
// ---------------------------------------------------------------------------

const SEVERITY_LEVELS: Record<SeverityLevel, string[]> = {
  mild: [
    'mild', 'slight', 'a little', 'a bit', 'minor', 'barely noticeable',
    'not too bad', 'manageable', 'somewhat', 'slightly',
  ],
  moderate: [
    'moderate', 'moderately', 'quite', 'fairly', 'noticeably',
    'reasonably difficult', 'affecting me', 'bothering me',
  ],
  high: [
    'very', 'really', 'a lot', 'quite a bit', 'quite difficult',
    'very difficult', 'hard to deal with', 'struggling', 'strong',
    'intense', 'significant',
  ],
  severe: [
    'severe', 'extremely', 'unbearable', 'overwhelming', 'worst',
    'terrible', 'horrible', 'awful', 'devastating', 'crippling',
    'impossible to function', 'cant function', "can't function",
    'constant', 'non-stop', 'all the time', 'every moment',
  ],
  unknown: [],
};

// ---------------------------------------------------------------------------
// 7. Duration
// ---------------------------------------------------------------------------

interface DurationPattern {
  pattern: RegExp;
  normalised: string;
}

const DURATION_PATTERNS: DurationPattern[] = [
  { pattern: /\bfor\s+(?:almost\s+)?(?:around\s+)?two\s+weeks?\b/i,       normalised: '~2 weeks' },
  { pattern: /\bfor\s+(?:about\s+)?(?:a\s+)?(?:2|two)\s*[-–]?\s*weeks?\b/i, normalised: '~2 weeks' },
  { pattern: /\bfor\s+(?:about\s+)?(?:a\s+)?(?:3|three)\s*[-–]?\s*weeks?\b/i, normalised: '~3 weeks' },
  { pattern: /\bfor\s+(?:about\s+)?(?:a\s+)?(?:4|four)\s*[-–]?\s*weeks?\b/i, normalised: '~4 weeks' },
  { pattern: /\bfor\s+(?:a\s+)?(?:few|several|some)\s+weeks?\b/i,         normalised: 'several weeks' },
  { pattern: /\bfor\s+(?:about\s+)?(?:a\s+)?(?:2|two)\s*[-–]?\s*months?\b/i, normalised: '~2 months' },
  { pattern: /\bfor\s+(?:a\s+)?(?:few|several|some)\s+months?\b/i,        normalised: 'several months' },
  { pattern: /\bfor\s+(?:about\s+)?(?:a\s+)?(?:1|one)\s*[-–]?\s*months?\b/i, normalised: '~1 month' },
  { pattern: /\bfor\s+(?:about\s+)?(?:a\s+)?(?:a\s+)?month\b/i,           normalised: '~1 month' },
  { pattern: /\bfor\s+(?:about\s+)?(?:a\s+)?(?:1|one)\s*[-–]?\s*weeks?\b/i, normalised: '~1 week' },
  { pattern: /\bfor\s+(?:a\s+)?(?:a\s+)?week\b/i,                         normalised: '~1 week' },
  { pattern: /\bsince\s+yesterday\b/i,                                     normalised: 'since yesterday' },
  { pattern: /\bsince\s+last\s+night\b/i,                                  normalised: 'since last night' },
  { pattern: /\bsince\s+(?:this\s+)?morning\b/i,                           normalised: 'since this morning' },
  { pattern: /\bsince\s+last\s+week\b/i,                                   normalised: 'since last week' },
  { pattern: /\bsince\s+last\s+month\b/i,                                  normalised: 'since last month' },
  { pattern: /\bfor\s+(?:a\s+)?(?:few|some|couple\s+of)\s+hours?\b/i,     normalised: 'a few hours' },
  { pattern: /\bfor\s+(?:a\s+)?couple\s+(?:of\s+)?days?\b/i,              normalised: '~2 days' },
  { pattern: /\bfor\s+(?:about\s+)?(?:2|two)\s*[-–]?\s*days?\b/i,        normalised: '~2 days' },
  { pattern: /\bfor\s+(?:a\s+)?(?:few|several|some)\s+days?\b/i,          normalised: 'several days' },
  { pattern: /\bfor\s+(?:a\s+)?(?:long\s+time|while)\b/i,                 normalised: 'for a long time' },
  { pattern: /\brecently\b/i,                                              normalised: 'recently' },
  { pattern: /\blast\s+(?:few\s+)?days?\b/i,                              normalised: 'last few days' },
  { pattern: /\byesterday\b/i,                                             normalised: 'since yesterday' },
  { pattern: /\btoday\b/i,                                                 normalised: 'today' },
  { pattern: /\bthis\s+morning\b/i,                                        normalised: 'since this morning' },
  { pattern: /\ball\s+(?:day|week|month)\b/i,                             normalised: 'persistently' },
  { pattern: /\bon\s+and\s+off\b/i,                                        normalised: 'on and off' },
];

// ---------------------------------------------------------------------------
// 8. Frequency
// ---------------------------------------------------------------------------

const FREQUENCY_DICT: Record<FrequencyLevel, string[]> = {
  once: ['once', 'one time', 'happened once', 'first time', 'just once'],
  rarely: ['rarely', 'very rarely', 'almost never', 'hardly ever', 'once in a while'],
  occasionally: ['occasionally', 'now and then', 'sometimes occasionally', 'here and there'],
  sometimes: ['sometimes', 'at times', 'on some days', 'some days'],
  often: ['often', 'quite often', 'many times', 'a lot', 'regularly', 'usually'],
  frequently: ['frequently', 'more often than not', 'most of the time', 'almost always'],
  'almost every day': ['almost every day', 'nearly every day', 'most days', 'almost daily'],
  'every day': ['every day', 'daily', 'each day', 'day after day', 'everyday'],
  'every night': ['every night', 'nightly', 'each night', 'night after night'],
  'several times a day': ['several times a day', 'multiple times a day', 'throughout the day', 'all day'],
  constantly: ['constantly', 'all the time', 'non-stop', 'continuously', 'always', 'without a break'],
  'comes and goes': ['comes and goes', 'on and off', 'fluctuates', 'in waves'],
  randomly: ['randomly', 'out of nowhere', 'without warning', 'unpredictably', 'at random'],
  recurring: ['recurring', 'keeps coming back', 'comes back', 'recurs', 'repeating'],
};

// ---------------------------------------------------------------------------
// 9. Situation / current state
// ---------------------------------------------------------------------------

const SITUATION_DICT: Record<SituationState, string[]> = {
  ongoing: [
    'still happening', 'still going on', 'ongoing', 'continues', 'still there',
    'has not stopped', "hasn't stopped", 'persisting', 'still dealing with',
  ],
  improving: [
    'getting better', 'improving', 'slowly improving', 'on the mend',
    'better than before',
  ],
  worsening: [
    'getting worse', 'worsening', 'deteriorating', 'worse each day',
    'harder each day',
  ],
  resolved: [
    'resolved', 'sorted', 'over now', 'past now', 'no longer a problem',
    'dealt with it', 'moved on',
  ],
  intermittent: [
    'intermittent', 'in waves', 'on and off', 'comes and goes', 'variable',
  ],
  recurring: [
    'recurring', 'keeps happening', 'happens again and again', 'back again',
    'returned', 'keeps coming back',
  ],
  first_occurrence: [
    'first time', 'never felt this before', 'new feeling', 'this is new',
    'happened for the first time', 'never experienced this',
  ],
  frequent: [
    'frequent', 'very frequent', 'happens a lot', 'most of the time',
    'all the time', 'constantly happening',
  ],
  occasional: [
    'occasional', 'sometimes', 'not all the time', 'every so often',
  ],
  not_currently_present: [
    'not anymore', 'not right now', 'has passed', 'went away',
    'no longer feeling', 'stopped now',
  ],
};

// Function state phrases
const FUNCTIONAL_STATE_PHRASES: { phrase: string; impact: ImpactArea }[] = [
  { phrase: 'affect.*stud',          impact: 'studies' },
  { phrase: 'affect.*work',          impact: 'work' },
  { phrase: 'affect.*sleep',         impact: 'sleep' },
  { phrase: 'affect.*eat',           impact: 'appetite' },
  { phrase: 'cannot concentrate',    impact: 'concentration' },
  { phrase: "can't concentrate",     impact: 'concentration' },
  { phrase: 'cant concentrate',      impact: 'concentration' },
  { phrase: 'cannot focus',          impact: 'concentration' },
  { phrase: "can't focus",           impact: 'concentration' },
  { phrase: 'cant focus',            impact: 'concentration' },
  { phrase: 'no motivation',         impact: 'motivation' },
  { phrase: 'lost motivation',       impact: 'motivation' },
  { phrase: 'no interest',           impact: 'motivation' },
  { phrase: 'lost interest',         impact: 'motivation' },
  { phrase: 'social.*avoid',         impact: 'social interaction' },
  { phrase: 'avoid.*people',         impact: 'social interaction' },
  { phrase: 'not sleeping',          impact: 'sleep' },
  { phrase: 'cant sleep',            impact: 'sleep' },
  { phrase: "can't sleep",           impact: 'sleep' },
  { phrase: 'sleep problem',         impact: 'sleep' },
  { phrase: 'sleep issue',           impact: 'sleep' },
  { phrase: 'not eating',            impact: 'appetite' },
  { phrase: 'no appetite',           impact: 'appetite' },
  { phrase: 'miss.*class',           impact: 'attendance' },
  { phrase: 'skip.*class',           impact: 'attendance' },
  { phrase: 'miss.*lecture',         impact: 'attendance' },
  { phrase: 'during.*lecture',       impact: 'academic activities' },
  { phrase: 'during.*class',         impact: 'academic activities' },
  { phrase: 'during.*study',         impact: 'academic activities' },
  { phrase: 'study.*difficult',      impact: 'academic activities' },
  { phrase: 'studying.*hard',        impact: 'academic activities' },
  { phrase: 'work.*performance',     impact: 'professional activities' },
  { phrase: 'daily.*routine',        impact: 'daily routine' },
  { phrase: 'routine.*disrupt',      impact: 'daily routine' },
  { phrase: 'not.*productive',       impact: 'productivity' },
  { phrase: 'productivity.*drop',    impact: 'productivity' },
  { phrase: 'decision.*hard',        impact: 'decision-making' },
  { phrase: 'cannot decide',         impact: 'decision-making' },
  { phrase: 'relationships.*affect', impact: 'relationships' },
  { phrase: 'affecting.*relationship', impact: 'relationships' },
];

// ---------------------------------------------------------------------------
// 10. Impact areas
// ---------------------------------------------------------------------------

const IMPACT_DICT: Record<ImpactArea, string[]> = {
  studies: [
    'studies', 'studying', 'academic', 'academics', 'college work',
    'school work', 'coursework', 'exam preparation', 'lecture',
    'class', 'assignments', 'grades', 'marks',
  ],
  work: [
    'work', 'job', 'office', 'workplace', 'professional', 'career',
    'employment', 'tasks at work', 'work performance',
  ],
  sleep: [
    'sleep', 'sleeping', 'sleep quality', 'sleep pattern', 'rest',
    'waking up', 'bedtime', 'nighttime',
  ],
  appetite: [
    'appetite', 'eating', 'food', 'hunger', 'meals', 'diet', 'eating habits',
  ],
  concentration: [
    'concentrate', 'concentration', 'focus', 'attention', 'mind',
    'thinking clearly', 'mental clarity',
  ],
  motivation: [
    'motivation', 'motivated', 'drive', 'enthusiasm', 'energy to do things',
    'interest', 'desire to do',
  ],
  'social interaction': [
    'social', 'socialising', 'socializing', 'people', 'friends', 'meeting people',
    'going out', 'talking to people', 'communication',
  ],
  relationships: [
    'relationship', 'relationships', 'bond', 'connection', 'closeness',
    'romantic relationship', 'friendship',
  ],
  exercise: [
    'exercise', 'workout', 'physical activity', 'gym', 'sport', 'fitness',
  ],
  'daily routine': [
    'daily routine', 'routine', 'daily life', 'day to day', 'everyday life',
    'normal activities', 'regular activities',
  ],
  communication: [
    'communication', 'talking', 'expressing', 'speaking up', 'opening up',
    'able to communicate',
  ],
  'decision-making': [
    'decision', 'decisions', 'decide', 'choice', 'choices', 'making decisions',
    'decision-making',
  ],
  productivity: [
    'productive', 'productivity', 'output', 'getting things done', 'tasks',
    'accomplishing', 'efficiency',
  ],
  attendance: [
    'attendance', 'attending', 'showing up', 'going to class', 'going to work',
    'missing class', 'skipping class',
  ],
  'personal care': [
    'personal care', 'hygiene', 'self care', 'self-care', 'grooming',
    'taking care of myself', 'basic needs',
  ],
  'academic activities': [
    'lecture', 'class', 'study', 'studying', 'academic', 'assignment',
    'coursework', 'exam', 'test',
  ],
  'professional activities': [
    'work tasks', 'professional tasks', 'work duties', 'job performance',
    'at work', 'in the office',
  ],
};

// =============================================================================
// EXTRACTION FUNCTIONS
// =============================================================================

function extractEmotionalStates(text: string): EmotionalState[] {
  return matchAll(text, EMOTIONAL_STATE_DICT);
}

function extractSymptoms(text: string): Symptom[] {
  return matchAll(text, SYMPTOM_DICT);
}

function extractTriggers(text: string): Trigger[] {
  return matchAll(text, TRIGGER_DICT);
}

function extractActionsTaken(text: string): ActionTaken[] {
  return matchAll(text, ACTION_DICT);
}

function extractProgress(text: string): ProgressSignalLocal | null {
  const n = normalise(text);
  for (const [signal, phrases] of Object.entries(PROGRESS_PATTERNS) as [ProgressSignalLocal, string[]][]) {
    if (phrases.some((p) => n.includes(p))) return signal;
  }
  return null;
}

function extractSeverity(text: string): SeverityLevel {
  const n = normalise(text);
  // Check from most severe to least — first match wins
  const order: SeverityLevel[] = ['severe', 'high', 'moderate', 'mild'];
  for (const level of order) {
    const phrases = SEVERITY_LEVELS[level];
    if (phrases.some((p) => n.includes(p))) return level;
  }
  return 'unknown';
}

function extractDuration(text: string): string | null {
  for (const { pattern, normalised } of DURATION_PATTERNS) {
    if (pattern.test(text)) return normalised;
  }
  return null;
}

function extractFrequency(text: string): FrequencyLevel | null {
  const n = normalise(text);
  // Check from most frequent to least to avoid 'sometimes' matching before 'every day'
  const order: FrequencyLevel[] = [
    'constantly', 'several times a day', 'every day', 'every night',
    'almost every day', 'frequently', 'often', 'recurring',
    'comes and goes', 'sometimes', 'occasionally', 'rarely', 'once', 'randomly',
  ];
  for (const level of order) {
    if (FREQUENCY_DICT[level].some((p) => n.includes(p))) return level;
  }
  return null;
}

function extractSituations(text: string): SituationState[] {
  return matchAll(text, SITUATION_DICT);
}

function extractImpact(text: string): ImpactArea[] {
  const results = new Set<ImpactArea>();

  // Dictionary matching
  const dictMatches = matchAll(text, IMPACT_DICT);
  for (const m of dictMatches) results.add(m);

  // Regex-based functional state phrases
  const n = normalise(text);
  for (const { phrase, impact } of FUNCTIONAL_STATE_PHRASES) {
    const re = new RegExp(phrase, 'i');
    if (re.test(n)) results.add(impact);
  }

  return [...results];
}

// ---------------------------------------------------------------------------
// Confidence score
// ---------------------------------------------------------------------------

function calculateConfidence(result: Omit<ExtractionResult, 'extractedAt' | 'piiRemoved' | 'confidence'>): number {
  let score = 0;
  if (result.emotional_state.length > 0) score += 0.25;
  if (result.symptoms.length > 0)        score += 0.20;
  if (result.trigger.length > 0)         score += 0.15;
  if (result.duration !== null)          score += 0.10;
  if (result.progress !== null)          score += 0.10;
  if (result.impact.length > 0)          score += 0.10;
  if (result.severity !== 'unknown')     score += 0.05;
  if (result.action_taken.length > 0)    score += 0.05;
  return Math.min(score, 1);
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Extract structured mental-health signals from sanitised text.
 * Input must already have been processed by privacyFilter.ts.
 * Never call this with raw user text.
 */
export function extractStructuredData(
  sanitisedText: string,
  piiRemoved: PiiCategory[] = []
): ExtractionResult {
  const emotional_state  = extractEmotionalStates(sanitisedText);
  const symptoms         = extractSymptoms(sanitisedText);
  const trigger          = extractTriggers(sanitisedText);
  const action_taken     = extractActionsTaken(sanitisedText);
  const progress         = extractProgress(sanitisedText);
  const severity         = extractSeverity(sanitisedText);
  const duration         = extractDuration(sanitisedText);
  const frequency        = extractFrequency(sanitisedText);
  const current_situation = extractSituations(sanitisedText);
  const impact           = extractImpact(sanitisedText);

  const partial = {
    type: 'symptom_report' as const,
    emotional_state,
    symptoms,
    duration,
    frequency,
    trigger,
    severity,
    action_taken,
    progress,
    current_situation,
    impact,
  };

  const confidence = calculateConfidence(partial);

  return {
    ...partial,
    extractedAt: new Date().toISOString(),
    piiRemoved,
    confidence,
  };
}

/**
 * Determine if the extraction result has enough signal to be useful.
 * At minimum we need emotional state or symptoms.
 */
export function hasMinimumSignals(result: ExtractionResult): boolean {
  return result.emotional_state.length > 0 || result.symptoms.length > 0;
}

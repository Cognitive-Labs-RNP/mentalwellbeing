# Design Document

## Overview

Wellbeing Hub is a client-side React/TypeScript SPA that guides users through an emotional pattern-analysis pipeline and provides a suite of condition-specific and general wellbeing tools, tracking, and insights — entirely without a real backend. The core data flow is:

**Raw Input → Local Privacy Filter → Structured Summary → AI Engine → Condition ID → Condition Library → Dynamic UI**

All raw personal text stays on the device. The AI receives only a sanitised structured summary. Condition-specific content is driven entirely by local JSON files so the AI cannot invent interventions.

### Key Design Goals

- **Privacy-first** — PII filtering happens on-device; AI never sees raw text
- **Predefined content, AI interpretation** — AI identifies patterns and interprets progress; all activity content comes from local condition files
- **Polished, production-quality feel** — glassmorphism surfaces, soft gradients, smooth micro-interactions
- **Emotional safety** — Safety Engine runs in the background on every input; emergency resources always one tap away
- **Non-diagnostic language** — pattern similarity, never diagnoses
- **Accessibility first** — WCAG AA, full keyboard navigation, `prefers-reduced-motion` support
- **Modular, replaceable internals** — storage, AI engine, and provider data are standalone swappable modules

---

## Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Browser (SPA)                             │
│                                                                     │
│  ┌──────────┐  ┌──────────────────────────────────────────────┐    │
│  │  Router  │─▶│              Page Components                 │    │
│  └──────────┘  │  Auth · Home · Analysis · Disorder Tab       │    │
│                │  Tools · Journal · Insights · Recs · Profile  │    │
│                └────────────────┬─────────────────────────────┘    │
│                                 │                                   │
│         ┌───────────────────────▼──────────────────────────┐       │
│         │              App State (React Context)            │       │
│         │  UserState · ActiveCondition · UIState            │       │
│         └──────┬──────────────────────┬────────────────────┘       │
│                │                      │                             │
│  ┌─────────────▼──────┐  ┌────────────▼───────────────────────┐   │
│  │  Storage Module    │  │  AI Engine Module                   │   │
│  │  (localStorage)    │  │  (mock or real; receives only       │   │
│  └────────────────────┘  │   Structured Summary)               │   │
│                           └────────────┬───────────────────────┘   │
│  ┌────────────────────────────────────▼───────────────────────┐   │
│  │  Condition Library  (conditions/*.json)                     │   │
│  │  anxiety · depression · adhd · ocd · stress · anger · …     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Safety Engine  (background, screens all user input)         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React 18 + TypeScript | Component model; strong typing |
| Styling | Tailwind CSS + custom CSS variables | Utility-first; easy theming |
| Routing | React Router v6 | Nested routes; dynamic tab injection |
| Charts | Recharts | Lightweight, accessible, responsive |
| Animation | Framer Motion | Declarative; respects `prefers-reduced-motion` |
| State | React Context + `useReducer` | Single-source-of-truth; no external dependency |
| Persistence | localStorage (via StorageService) | Requirement 19; swappable |
| AI | Mock AI Engine (OpenAI-compatible interface) | Works offline; real API swap is one module change |
| PBT | fast-check | TypeScript-native property-based testing |
| Unit tests | Vitest + React Testing Library | Vite-native; same API as Jest |
| Accessibility | jest-axe + axe-core | Automated WCAG checks |

### Routing Structure

```
/auth                → Authentication (login / create account)
  /auth/login
  /auth/create
/                    → Home
/analysis            → Analysis (multi-step)
  /analysis/input
  /analysis/privacy-review
  /analysis/loading
  /analysis/result
  /analysis/history
/:conditionId        → Dynamic Disorder Tab (e.g. /anxiety, /depression)
  /:conditionId/immediate-support
  /:conditionId/tools
  /:conditionId/sounds
/tools               → General Tools (tabbed)
  /tools/mood-check
  /tools/cognitive-load
  /tools/lifestyle
  /tools/calm
  /tools/sleep
/journal             → Journal & Journey
/insights            → Insights
/recommendations     → Recommendations
/profile             → Profile & Privacy
```

---

## Components and Interfaces

### Layout Shell

```
AuthLayout
└── Login / CreateAccount pages

AppLayout (authenticated)
├── Navbar (sidebar ≥768px) or MobileTopBar + BottomNav (<768px)
│   ├── Home
│   ├── Analysis
│   ├── [Dynamic Disorder Tab — injected after first analysis]
│   ├── Tools
│   ├── Journal
│   ├── Insights
│   ├── Recommendations
│   └── Profile
├── <Outlet /> (page content)
└── UrgentHelpButton (fixed, every page)
```

### Reusable UI Components

| Component | Key Props | Purpose |
|---|---|---|
| `Button` | `variant`, `size`, `disabled`, `onClick` | Primary / secondary / ghost / danger |
| `Card` | `glassy`, `className` | Glassmorphism surface wrapper |
| `Modal` | `open`, `onClose`, `title` | Dialogs, confirmations |
| `ProgressBar` | `value`, `animated` | Activity and checklist progress |
| `MoodSlider` | `label`, `value`, `onChange` | 1–10 numerical mood/stress/energy input |
| `ActivityCard` | `activity`, `onStart`, `onComplete` | Condition tool / activity card |
| `ChartCard` | `title`, `children`, `isEmpty` | Chart wrapper with empty state |
| `Timeline` | `entries: JourneyEntry[]` | Animated chronological journey list |
| `SafetyAlert` | `onContinue` | Full-screen safety intervention screen |
| `ToastNotification` | `message`, `duration` | Ephemeral confirmation |
| `EmptyState` | `title`, `description`, `ctaLabel`, `onCta` | Reusable empty state |
| `ProviderCard` | `provider` | Mock professional care card |
| `BackgroundBlobs` | — | Decorative animated gradient blobs |
| `AudioPlayer` | `tracks`, `onSessionComplete` | Calm audio player with timer |
| `PatternResultCard` | `conditionId`, `similarity` | Non-diagnostic analysis result display |
| `FeedbackForm` | `before`, `onSubmit` | Before/after mood/stress/energy capture |
| `PrivacyReviewPanel` | `structuredSummary`, `onConfirm`, `onCancel` | Shows what will be sent to AI |

### Analysis Module Sub-Components

```
AnalysisPage
├── AnalysisInput       — free text + voice affordance
├── PrivacyReview       — shows structured summary before sending
├── AnalysisLoading     — sequential loading messages
└── AnalysisResult      — pattern result + non-diagnostic language
```

### Dynamic Disorder Tab Sub-Components

```
DisorderTabPage  (route param: conditionId)
├── ImmediateSupport    — AI-sequenced steps from condition file
│   ├── ActivityCard[]  — each step with Start / timer / Complete
│   └── SoundCard[]     — condition-recommended sounds
└── ConditionTools      — full condition-specific tool list
    └── ActivityCard[]
```

---

## Data Models

### Core Types

```typescript
type ConditionId =
  | 'anxiety'
  | 'depression'
  | 'adhd'
  | 'ocd'
  | 'stress'
  | 'anger'
  | 'general-wellbeing';

type SimilarityLevel = 'Low' | 'Moderate' | 'High';

type ProgressSignal = 'Improving' | 'Unchanged' | 'Worsening';

type MoodScore = number; // 1–10

type ActivityFeedbackScores = {
  moodBefore: MoodScore;
  stressBefore: MoodScore;
  energyBefore: MoodScore;
  moodAfter: MoodScore;
  stressAfter: MoodScore;
  energyAfter: MoodScore;
  note?: string;
};
```

### Entity Interfaces

```typescript
interface AnonymousAccount {
  uid: string;           // WB-XXXXXX
  passwordHash: string;
  createdAt: string;
}

interface StructuredSummary {
  moodScore: MoodScore;
  stressLevel: MoodScore;
  energyLevel: MoodScore;
  contextTags: string[];
  sanitisedDescription: string;
}

interface PatternMatch {
  conditionId: ConditionId;
  similarityPercent: number; // 0–100
  similarityLevel: SimilarityLevel;
  timestamp: string;
}

interface MoodCheckEntry {
  id: string;
  timestamp: string;
  mood: MoodScore;
  energy: MoodScore;
  stress: MoodScore;
  sleep: MoodScore;
}

interface CognitiveLoadEntry {
  id: string;
  timestamp: string;
  studyWorkDuration: number;   // hours
  mentalWorkload: MoodScore;   // 1–10
  screenTime: number;          // hours
  caffeineIntake: number;      // cups
  sleepHours: number;
}

interface LifestyleEntry {
  id: string;
  timestamp: string;
  sleepHours: number;
  activityMinutes: number;
  hydrationLitres: number;
  heightCm?: number;
  weightKg?: number;
}

interface SleepEntry {
  id: string;
  timestamp: string;
  durationHours: number;
  bedtime: string;
  wakeTime: string;
  quality: MoodScore;
  routineConsistency: boolean;
}

interface CalmSession {
  id: string;
  timestamp: string;
  trackName: string;
  durationSeconds: number;
  conditionContext?: ConditionId;
}

interface ActivityRecord {
  id: string;
  activityId: string;
  activityName: string;
  conditionId: ConditionId;
  startedAt: string;
  completedAt?: string;
  feedback?: ActivityFeedbackScores;
}

interface JourneyEntry {
  id: string;
  date: string;               // YYYY-MM-DD
  moodCheckBefore?: MoodCheckEntry;
  analysis?: PatternMatch;
  activitiesCompleted: ActivityRecord[];
  calmSessions: CalmSession[];
  toolsUsed: string[];
  feedback?: ActivityFeedbackScores;
  progressSignal?: ProgressSignal;
}

interface ConditionHistoryItem {
  patternMatch: PatternMatch;
  inputSummary: StructuredSummary;
}

interface ProviderPreferences {
  city: string;
  locality?: string;
  budget?: string;
  type: ('Therapist' | 'Psychologist' | 'Psychiatrist')[];
  mode: ('Online' | 'Offline')[];
}

interface UserProfile {
  notificationsEnabled: boolean;
  audioVolume: number;
  theme: 'dark' | 'light' | 'system';
  reducedMotion: boolean;
  aiPermissionsEnabled: boolean;
}
```

### Root State Shape

```typescript
interface UserState {
  account: AnonymousAccount | null;
  profile: UserProfile;
  activeCondition: ConditionId | null;
  conditionHistory: ConditionHistoryItem[];
  journeyEntries: JourneyEntry[];
  moodChecks: MoodCheckEntry[];
  cognitiveLoadEntries: CognitiveLoadEntry[];
  lifestyleEntries: LifestyleEntry[];
  sleepEntries: SleepEntry[];
  calmSessions: CalmSession[];
  providerPreferences: ProviderPreferences;
}
```

### Condition Library Schema (per `conditions/*.json`)

```typescript
interface ConditionFile {
  id: ConditionId;
  name: string;
  description: string;
  immediateActions: {
    id: string;
    title: string;
    durationMinutes: number;
    type: 'breathing' | 'grounding' | 'sound' | 'exercise' | 'reflection';
    instructions: string[];
  }[];
  tools: {
    id: string;
    name: string;
    description: string;
    type: string;
  }[];
  recommendedSounds: string[];   // track name keys
  safetyGuidance: string;
}
```

### State Actions

```typescript
type AppAction =
  | { type: 'CREATE_ACCOUNT'; payload: AnonymousAccount }
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'SET_ACTIVE_CONDITION'; payload: ConditionId }
  | { type: 'ADD_PATTERN_MATCH'; payload: ConditionHistoryItem }
  | { type: 'LOG_MOOD_CHECK'; payload: Omit<MoodCheckEntry, 'id'> }
  | { type: 'LOG_COGNITIVE_LOAD'; payload: Omit<CognitiveLoadEntry, 'id'> }
  | { type: 'LOG_LIFESTYLE'; payload: Omit<LifestyleEntry, 'id'> }
  | { type: 'LOG_SLEEP'; payload: Omit<SleepEntry, 'id'> }
  | { type: 'RECORD_CALM_SESSION'; payload: Omit<CalmSession, 'id'> }
  | { type: 'START_ACTIVITY'; payload: Omit<ActivityRecord, 'id' | 'completedAt' | 'feedback'> }
  | { type: 'COMPLETE_ACTIVITY'; payload: { activityId: string; feedback: ActivityFeedbackScores } }
  | { type: 'SUBMIT_FEEDBACK'; payload: { date: string; feedback: ActivityFeedbackScores; progressSignal: ProgressSignal } }
  | { type: 'UPDATE_PROVIDER_PREFS'; payload: Partial<ProviderPreferences> }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'DELETE_DATA' }
  | { type: 'LOAD_STATE'; payload: UserState };
```

---

## Correctness Properties

### Property 1: Local Privacy Filter never forwards raw PII to the AI module

*For any* input string containing a simulated PII token (email pattern, phone pattern, name token), the `localPrivacyFilter` SHALL produce a `StructuredSummary` that does not contain the original PII token.

**Validates: Requirement 3.2, 3.4**

---

### Property 2: AI Engine always returns a valid PatternMatch

*For any* `StructuredSummary`, the AI Engine SHALL return a `PatternMatch` whose `conditionId` is one of the supported `ConditionId` values and whose `similarityPercent` is between 0 and 100 inclusive.

**Validates: Requirement 4.1, 4.2, 4.5**

---

### Property 3: State reducer — mood check round trip

*For any* valid `MoodCheckEntry` payload dispatched via `LOG_MOOD_CHECK`, the resulting state SHALL contain an entry in `moodChecks` with matching `mood`, `energy`, `stress`, and `sleep` values.

**Validates: Requirement 9.2, 19.1**

---

### Property 4: State reducer — journey entry accumulates activities

*For any* sequence of `START_ACTIVITY` then `COMPLETE_ACTIVITY` actions on the same date, the resulting `journeyEntries` entry for that date SHALL contain the completed activity with non-null `completedAt` and the submitted `feedback`.

**Validates: Requirement 10.1, 11.4**

---

### Property 5: State persistence round trip

*For any* valid `UserState`, serialising via `StorageService.save` then loading via `StorageService.load` SHALL produce a value deeply equal to the original.

**Validates: Requirement 19.2, 19.3**

---

### Property 6: Malformed localStorage does not crash the app

*For any* non-JSON string stored in the localStorage key, calling `StorageService.load()` SHALL return a valid `UserState` with empty collections rather than throwing.

**Validates: Requirement 19.4**

---

### Property 7: Dynamic Disorder Tab only renders when activeCondition is set

*For any* `UserState` where `activeCondition` is `null`, the rendered navbar SHALL NOT contain a disorder tab route. *For any* state where `activeCondition` is a valid `ConditionId`, the navbar SHALL contain exactly one disorder tab.

**Validates: Requirement 6.5, 6.7**

---

### Property 8: Condition Library drives all activity content

*For any* `ConditionId`, the activities rendered in the Dynamic_Disorder_Tab SHALL be a subset of the activities defined in the corresponding `conditions/*.json` file.

**Validates: Requirement 5.3, 5.4**

---

## Error Handling

### localStorage Unavailable or Quota Exceeded
- `StorageService.save` wraps `setItem` in `try/catch`; on quota error shows a non-blocking toast.
- On unavailable localStorage, falls back to in-memory state with a one-time banner.

### Malformed Persisted State
- `StorageService.load` validates shape; missing arrays default to `[]`; missing profile fields use defaults; emits `console.warn` per repaired field.

### AI Engine Failure
- If the AI Engine call fails or times out, the app falls back to the Mock AI Engine result.
- The user sees a non-blocking notice: "Using offline analysis."

### Privacy Filter Edge Cases
- If the filter cannot parse the input, it passes an empty `StructuredSummary` with a high stress/low mood default and a generic `contextTags: ['unclear']`.

### Safety Engine False Negatives
- If `SafetyEngine.screen()` throws, it defaults to showing the safety prompt as a fail-safe.

### Confirmation Before Destructive Actions
- Delete Data and Logout each require a two-step confirmation modal.

---

## Testing Strategy

### Property-Based Tests (fast-check, min 100 iterations each)
- Properties 1–8 above, each tagged `// Feature: wellbeing-hub, Property N`

### Unit / Example Tests (Vitest + React Testing Library)
- Auth flow: account creation, login, invalid credentials
- Privacy filter: known PII patterns removed; non-PII preserved
- Dynamic navbar: disorder tab absent before analysis, present after
- Condition Library loading: correct tools render per conditionId
- Journey entry: auto-compilation on activity completion
- Feedback form: before/after fields captured correctly
- Insights charts: empty state per section
- Recommendations: filter combinations produce correct subsets
- Settings: destructive actions require confirmation modal

### Accessibility Tests (jest-axe)
- All page-level components: no WCAG AA automated violations
- Focus order logical on all pages
- ARIA labels on all icon-only controls

---

## Visual Design

### Colour Palette
- Background: deep navy `#0a0f1e` / midnight `#0d1117`
- Surfaces: muted slate `#1a2035` with glassmorphism (`backdrop-filter: blur`)
- Accent: soft lavender `#a78bfa`, cyan `#67e8f9`, warm white `#f0f4ff`
- Danger: muted rose `#f87171`
- Success: soft green `#4ade80`

### Motion
- Page transitions: `framer-motion` `AnimatePresence` with fade + slide
- Card hover: subtle lift (`translateY(-2px)`) + shadow increase
- All decorative animations disabled when `prefers-reduced-motion: reduce`

# Implementation Plan: Wellbeing Hub

## Overview

Build a React 18 + TypeScript + Tailwind CSS SPA following the architecture: **Raw Input → Local Privacy Filter → AI Engine → Condition Library → Dynamic UI**. Implementation proceeds bottom-up: project scaffolding, data models and state, core modules (privacy filter, AI engine, storage, condition library), then the UI shell and each page in dependency order.

The current goal is a **working basic UI structure** — all pages, tabs, and navigation in place with placeholder content — before wiring in real logic.

## Tasks

- [ ] 1. Project setup and core infrastructure
  - Scaffold a Vite + React 18 + TypeScript project with Tailwind CSS
  - Install dependencies: `react-router-dom@6`, `recharts`, `framer-motion`, `fast-check`, `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jest-axe`
  - Configure `vitest` with jsdom environment and `@testing-library/jest-dom` matchers
  - Set up Tailwind theme tokens for the deep navy / lavender / soft-cyan palette
  - Create directory structure: `src/engine`, `src/store`, `src/services`, `src/conditions`, `src/components/ui`, `src/components/layout`, `src/pages`, `src/hooks`, `src/types`
  - _Requirements: 18.1, 19.5_

- [ ] 2. Core TypeScript types and data models
  - [ ] 2.1 Define all shared types
    - `ConditionId`, `SimilarityLevel`, `ProgressSignal`, `MoodScore`, `ActivityFeedbackScores` union/alias types
    - All entity interfaces: `AnonymousAccount`, `StructuredSummary`, `PatternMatch`, `MoodCheckEntry`, `CognitiveLoadEntry`, `LifestyleEntry`, `SleepEntry`, `CalmSession`, `ActivityRecord`, `JourneyEntry`, `ConditionHistoryItem`, `ProviderPreferences`, `UserProfile`, `UserState`
    - Export all from `src/types/index.ts`
    - _Requirements: 19.1_

  - [ ] 2.2 Define `AppAction` discriminated union and initial state
    - Implement all actions: `CREATE_ACCOUNT`, `LOGIN`, `LOGOUT`, `SET_ACTIVE_CONDITION`, `ADD_PATTERN_MATCH`, `LOG_MOOD_CHECK`, `LOG_COGNITIVE_LOAD`, `LOG_LIFESTYLE`, `LOG_SLEEP`, `RECORD_CALM_SESSION`, `START_ACTIVITY`, `COMPLETE_ACTIVITY`, `SUBMIT_FEEDBACK`, `UPDATE_PROVIDER_PREFS`, `UPDATE_PROFILE`, `DELETE_DATA`, `LOAD_STATE`
    - Define `initialState: UserState`
    - _Requirements: 19.1_

- [ ] 3. Condition Library
  - [ ] 3.1 Create condition JSON files
    - Create `src/conditions/anxiety.json`, `depression.json`, `adhd.json`, `ocd.json`, `stress.json`, `anger.json`, `general-wellbeing.json`
    - Each file: `id`, `name`, `description`, `immediateActions[]`, `tools[]`, `recommendedSounds[]`, `safetyGuidance`
    - _Requirements: 5.1, 5.2_

  - [ ] 3.2 Implement `ConditionLibraryService`
    - `getCondition(id: ConditionId): ConditionFile`
    - `getAllConditions(): ConditionFile[]`
    - Typed loader from `src/conditions/*.json`
    - _Requirements: 5.3, 5.4_

- [ ] 4. Storage service
  - [ ] 4.1 Implement `StorageService`
    - `load(): UserState`, `save(state): void`, `clear(): void`, `exportJSON(): string`
    - Quota error → toast; unavailable localStorage → in-memory fallback
    - Shape validation with defaults on load
    - _Requirements: 19.2, 19.3, 19.4, 19.5_

  - [ ] 4.2 Property test — state persistence round trip
    - **Property 5**: `fc.record` → `save` → `load` → deep equal
    - _Requirements: 19.2, 19.3_

  - [ ] 4.3 Property test — malformed localStorage safety
    - **Property 6**: `fc.string()` → store → `load()` → valid UserState, no throw
    - _Requirements: 19.4_

- [ ] 5. App state — reducer and context
  - [ ] 5.1 Implement `appReducer`
    - Handle all `AppAction` cases per design
    - UUID generation for new records
    - Journey entry auto-compilation logic
    - _Requirements: 10.1, 19.1_

  - [ ] 5.2 Property test — mood check round trip
    - **Property 3**: `fc.record` → `LOG_MOOD_CHECK` → state contains matching entry
    - _Requirements: 9.2, 19.1_

  - [ ] 5.3 Property test — journey entry accumulates activities
    - **Property 4**: `START_ACTIVITY` + `COMPLETE_ACTIVITY` → journey entry contains completed record
    - _Requirements: 10.1, 11.4_

  - [ ] 5.4 Implement `AppContext` and `AppProvider`
    - `useReducer(appReducer, initialState)`
    - On mount: `StorageService.load` → `LOAD_STATE`
    - On each change: `StorageService.save`
    - Export `useAppState`, `useAppDispatch`
    - _Requirements: 19.2, 19.3_

- [ ] 6. Local Privacy Filter module
  - [ ] 6.1 Implement `localPrivacyFilter`
    - `filter(rawText: string): StructuredSummary`
    - Detect and redact: email, phone, name tokens, addresses, place names, social handles
    - Produce: moodScore, stressLevel, energyLevel, contextTags, sanitisedDescription
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 6.2 Property test — PII not forwarded
    - **Property 1**: inject known PII tokens → filter → StructuredSummary does not contain them
    - _Requirements: 3.2, 3.4_

- [ ] 7. Mock AI Engine module
  - [ ] 7.1 Implement `MockAIEngine`
    - `analyze(summary: StructuredSummary): PatternMatch`
    - `analyzeFeedback(data): ProgressSignal`
    - `detectConcerning(text: string): boolean`
    - Keyword/context scoring against all ConditionIds; fallback to `general-wellbeing`
    - Feedback analysis: returns `Improving | Unchanged | Worsening`
    - _Requirements: 4.1, 4.2, 4.5, 12.1, 12.2_

  - [ ] 7.2 Property test — AI always returns valid PatternMatch
    - **Property 2**: `fc.record` for StructuredSummary → analyze → valid conditionId + 0–100 similarity
    - _Requirements: 4.1, 4.2_

- [ ] 8. Safety Engine module
  - Implement `SafetyEngine.screen(text: string): { concerning: boolean; urgent: boolean }`
  - Context-based screening, not just keyword matching
  - Fail-safe: if throws, return `{ concerning: true, urgent: false }`
  - _Requirements: 15.1, 15.2, 15.5_

- [ ] 9. Reusable UI component library
  - [ ] 9.1 Implement `Button`, `Card`, `Modal`, `ProgressBar`
    - Button: variants primary/secondary/ghost/danger; min 44×44px touch target; ARIA compliant
    - Card: `glassy` prop; `className` passthrough
    - Modal: focus trapping; accessible dialog role
    - ProgressBar: ARIA progressbar role
    - _Requirements: 18.3, 18.6_

  - [ ] 9.2 Implement `MoodSlider`, `ToastNotification`, `EmptyState`, `BackgroundBlobs`
    - MoodSlider: 1–10 numerical input with label; keyboard accessible
    - ToastNotification: ephemeral, configurable duration
    - EmptyState: title, description, CTA
    - BackgroundBlobs: disabled on `prefers-reduced-motion`
    - _Requirements: 18.5_

  - [ ] 9.3 Implement `ActivityCard`, `ChartCard`, `Timeline`, `ProviderCard`
    - ActivityCard: Start / timer / Complete flow
    - ChartCard: EmptyState when data is empty
    - Timeline: `JourneyEntry[]`; framer-motion entrance; reduced motion aware
    - ProviderCard: name, rating, location, cost, specialisations, View button
    - _Requirements: 7.5, 10.3, 14.3_

  - [ ] 9.4 Implement `SafetyAlert`, `AudioPlayer`, `PatternResultCard`, `FeedbackForm`, `PrivacyReviewPanel`
    - SafetyAlert: full-screen; immediate support steps; crisis links; `onContinue`
    - AudioPlayer: play/pause; timer; volume; track selection; visualiser (reduced-motion aware)
    - PatternResultCard: non-diagnostic display; similarity %; disclaimer
    - FeedbackForm: before/after mood/stress/energy sliders; emoji + text options
    - PrivacyReviewPanel: shows StructuredSummary; Confirm / Cancel
    - _Requirements: 3.5, 4.3, 4.4, 11.1, 12.1, 15.3_

- [ ] 10. Authentication pages
  - [ ] 10.1 Implement `CreateAccountPage`
    - UID generation display (`WB-XXXXXX`)
    - Password field only; no name/email/phone
    - Dispatch `CREATE_ACCOUNT`; redirect to Home
    - _Requirements: 1.1, 1.3, 1.4_

  - [ ] 10.2 Implement `LoginPage`
    - UID + password fields
    - Dispatch `LOGIN`; show error on invalid credentials
    - _Requirements: 1.2, 1.5, 1.6_

- [ ] 11. App layout shell and navigation
  - [ ] 11.1 Implement `AppLayout`
    - `<Outlet />` with `UrgentHelpButton` fixed on every page
    - _Requirements: 15.6_

  - [ ] 11.2 Implement `Navbar` (≥768px) and `MobileTopBar` + `BottomNav` (<768px)
    - Static items: Home, Analysis, Tools, Journal, Insights, Recommendations, Profile
    - Dynamic Disorder Tab injected between Analysis and Tools when `activeCondition` is set
    - Active item highlighting; keyboard navigation; semantic `<nav>` with ARIA labels
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

  - [ ] 11.3 Configure React Router routing structure
    - All routes per design routing structure
    - Auth guard: redirect to `/auth/login` when not authenticated
    - Disorder tab route: dynamic `/:conditionId`; render only when `activeCondition` is set
    - _Requirements: 1.5, 6.5, 17.1_

  - [ ] 11.4 Property test — Dynamic Disorder Tab renders iff activeCondition set
    - **Property 7**: null activeCondition → no disorder tab; valid conditionId → exactly one tab
    - _Requirements: 6.5, 6.7_

- [ ] 12. Home page
  - [ ] 12.1 Implement `HomePage`
    - New user state: greeting + Start Analysis CTA
    - Returning user state: active condition card, today's recommendation, current mood, recent progress, Continue activity button, quick-access buttons (Analysis, Calm, Mood Check)
    - Feedback reminder when activities completed without feedback
    - BackgroundBlobs animated background
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 12.2 Write unit tests for HomePage
    - New user state renders Start Analysis CTA
    - Returning user state renders condition card
    - Feedback reminder renders when appropriate

- [ ] 13. Analysis module
  - [ ] 13.1 Implement `AnalysisInputPage`
    - Free-text textarea; voice input affordance; character count
    - SafetyEngine screens input on change/submit
    - On submit: run `localPrivacyFilter` → show PrivacyReviewPanel
    - _Requirements: 3.1, 3.5, 15.1_

  - [ ] 13.2 Implement `PrivacyReviewPage`
    - Display StructuredSummary; Confirm sends to AI; Cancel returns to input
    - _Requirements: 3.5_

  - [ ] 13.3 Implement `AnalysisLoadingPage`
    - Sequential messages; reduced-motion aware animation
    - _Requirements: 4.1_

  - [ ] 13.4 Implement `AnalysisResultPage`
    - `PatternResultCard` with conditionId, similarity %, non-diagnostic language, disclaimer
    - Buttons: Open [Condition] Tab, View Recommendations
    - Dispatch `ADD_PATTERN_MATCH` and `SET_ACTIVE_CONDITION`
    - _Requirements: 4.3, 4.4, 6.1_

  - [ ] 13.5 Implement `AnalysisHistoryPage`
    - List of all `ConditionHistoryItem` records with date and similarity
    - _Requirements: 6.6_

  - [ ] 13.6 Wire analysis sub-routes with step transitions
    - _Requirements: 4.1_

  - [ ] 13.7 Write unit tests for Analysis flow
    - Privacy review shown before AI call
    - Result dispatches SET_ACTIVE_CONDITION
    - Disclaimer text present

- [ ] 14. Dynamic Disorder Tab
  - [ ] 14.1 Implement `DisorderTabPage` shell
    - Three sub-sections: Immediate Support, Condition Tools, Sounds
    - Reads condition file via `ConditionLibraryService`
    - _Requirements: 6.2, 5.3_

  - [ ] 14.2 Implement Immediate Support section
    - AI-sequenced steps from condition file
    - Each step: `ActivityCard` with Start / timer / Complete ✓
    - Sound step: `AudioPlayer` inline
    - _Requirements: 6.3, 6.4, 7.5_

  - [ ] 14.3 Implement Condition-Specific Tools section
    - `ActivityCard[]` from condition file `tools[]`
    - On complete: dispatch `COMPLETE_ACTIVITY` + prompt feedback
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 14.4 Implement Condition-Specific Sounds section
    - Sound cards filtered to `recommendedSounds` in condition file
    - Play → timer → Complete → dispatch `RECORD_CALM_SESSION`
    - _Requirements: 8.1, 8.4, 8.5_

  - [ ] 14.5 Property test — Condition Library drives activity content
    - **Property 8**: rendered activities ⊆ condition file activities for each conditionId
    - _Requirements: 5.3, 5.4_

  - [ ] 14.6 Write unit tests for DisorderTabPage
    - Correct tool set renders per conditionId
    - Activity completion dispatches COMPLETE_ACTIVITY
    - Sound completion dispatches RECORD_CALM_SESSION

- [ ] 15. Tools page
  - [ ] 15.1 Implement Tools page tabbed shell
    - Tabs: Mood Check, Cognitive Load, Lifestyle, Calm, Sleep
    - Deep linking: `/tools/mood-check`, `/tools/cognitive-load`, `/tools/lifestyle`, `/tools/calm`, `/tools/sleep`
    - _Requirements: 9.1_

  - [ ] 15.2 Implement Mood Check tab
    - MoodSlider fields: mood, energy, stress, sleep (all 1–10)
    - On submit: dispatch `LOG_MOOD_CHECK`
    - Display recent mood check history; EmptyState when none
    - _Requirements: 9.2_

  - [ ] 15.3 Implement Cognitive Load & Caffeine tab
    - Fields: study/work duration, mental workload, screen time, caffeine intake, sleep hours
    - On submit: dispatch `LOG_COGNITIVE_LOAD`
    - Display observed relationships using non-causal language
    - _Requirements: 9.3, 9.7_

  - [ ] 15.4 Implement Lifestyle Tracker tab
    - Fields: sleep hours, activity minutes, hydration, height (optional), weight (optional)
    - On submit: dispatch `LOG_LIFESTYLE`
    - General/educational guidance; no prescriptive targets
    - _Requirements: 9.4, 9.8_

  - [ ] 15.5 Implement Calm (full audio library) tab
    - Full track list: Ocean, Rain, Forest, Wind, Fireplace, White noise, Brown noise, Ambient, Frequency-based
    - Timer options: 5 min, 10 min, 20 min, Custom
    - On complete: dispatch `RECORD_CALM_SESSION`
    - _Requirements: 9.5_

  - [ ] 15.6 Implement Sleep & Routine tab
    - Fields: duration, bedtime, wake time, quality, routine consistency
    - On submit: dispatch `LOG_SLEEP`
    - _Requirements: 9.6_

  - [ ] 15.7 Write unit tests for Tools page
    - Each tab dispatches correct action
    - Empty states render
    - Non-causal language in Cognitive Load observations

- [ ] 16. Journal & Journey page
  - [ ] 16.1 Implement `JournalJourneyPage`
    - Today's Record summary: before-support scores, analysis result, activities, tools used
    - Journey Map: `Timeline` component rendering all `JourneyEntry` records chronologically
    - Node expand/collapse on click or keyboard
    - EmptyState when no entries
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 16.2 Write unit tests for JournalJourneyPage
    - Journey entries render correct node content
    - Expand/collapse works
    - Empty state renders

- [ ] 17. Activity Feedback flow
  - [ ] 17.1 Implement `FeedbackPage`
    - Before/after MoodSlider fields for mood, stress, energy
    - Emoji feedback + optional text note
    - On submit: dispatch `SUBMIT_FEEDBACK`; send structured data to AI → receive ProgressSignal
    - Display result: 🟢 Improving / 🟡 Unchanged / 🔴 Worsening with next-step prompt
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ] 17.2 Write unit tests for FeedbackPage
    - Before/after fields captured correctly
    - Progress signal renders with correct colour indicator
    - Worsening signal shows professional support prompt

- [ ] 18. Insights page
  - [ ] 18.1 Implement `InsightsPage`
    - Progress Overview: trend charts for mood, stress, energy, sleep, activity frequency, cognitive load
    - Activity Effectiveness: before/after change per activity type
    - AI Progress Interpretation: Improving / No significant improvement / Worsening with recommendation
    - All charts use Recharts with hover/selection; EmptyState per chart when no data
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ] 18.2 Write unit tests for InsightsPage
    - Empty state per chart section
    - Non-diagnostic language in all text
    - Worsening interpretation shows professional support prompt

- [ ] 19. Recommendations page
  - [ ] 19.1 Implement `RecommendationsPage`
    - User preference form: city, locality, budget, professional type, mode
    - Mock `ProviderCard[]` grid
    - Filter controls; EmptyState when no match
    - Modular architecture for real API replacement
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 19.2 Write unit tests for RecommendationsPage
    - Filter combinations produce correct card subsets
    - Empty state renders when no match

- [ ] 20. Profile & Privacy page
  - [ ] 20.1 Implement `ProfilePage`
    - Account section: UID display, password change, logout (with confirmation)
    - Privacy section: data explanation, AI permissions toggle, Export Data, Delete Data (with confirmation modal)
    - App settings: notifications, audio, accessibility, theme
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

  - [ ] 20.2 Write unit tests for ProfilePage
    - Delete Data shows confirmation modal before dispatching
    - Logout shows confirmation
    - Export Data calls StorageService.exportJSON

- [ ] 21. Responsive design and visual polish
  - [ ] 21.1 Verify responsive layouts at 320px, 768px, 1280px
    - Vertical card stacking below 768px; charts readable on mobile; all touch targets ≥44×44px
    - _Requirements: 18.1, 18.6_

  - [ ] 21.2 Apply micro-interaction polish
    - Page transitions via framer-motion AnimatePresence
    - Card hover lift; checklist completion animation; mood slider animation
    - All decorative animations disabled on `prefers-reduced-motion`
    - _Requirements: 18.5_

- [ ] 22. Accessibility audit
  - [ ] 22.1 jest-axe assertions on all page-level components
    - No WCAG AA automated violations on all pages
    - _Requirements: 18.2_

  - [ ] 22.2 Write accessibility unit tests
    - ARIA labels on all icon-only buttons
    - Logical focus order on all pages
    - Colour-coded indicators also have text labels
    - _Requirements: 18.3, 18.4_

- [ ] 23. Final checkpoint
  - All tests pass
  - No external API calls at runtime (mock AI engine only)
  - Safety Engine active on all input pages
  - Demo walkthrough: Create account → Analysis → Disorder tab → Activities → Feedback → Journey → Insights

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Property-based tests use `fast-check` with a minimum of 100 iterations
- The Condition Library JSON files are the single source of truth for all activity content
- The Mock AI Engine and Local Privacy Filter are standalone modules — implement and test independently before wiring to UI
- Checkpoints at tasks 5, 9, 15 ensure incremental validation

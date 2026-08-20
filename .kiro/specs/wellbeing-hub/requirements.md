# Requirements Document

## Introduction

Wellbeing Hub is a client-side React/TypeScript SPA that helps users understand their emotional patterns through a local-privacy-first AI analysis pipeline, provides condition-specific guided support, and tracks progress over time. The core philosophy is: **Understand → Support → Track → Evaluate → Next Step**. All raw personal data stays on-device; only a structured, PII-stripped summary is sent to the AI. The app is designed for a hackathon demo and must function end-to-end without a real backend.

## Glossary

- **User**: A person using the Wellbeing Hub application
- **Anonymous_Account**: A user account identified by a generated UID and password only — no name, email, or phone number
- **Local_Privacy_Filter**: A client-side module that detects and removes PII from raw user input before anything is sent to the AI
- **Structured_Summary**: The sanitised, structured representation of user input produced by the Local_Privacy_Filter (mood score, stress level, energy, context tags)
- **AI_Engine**: The AI backend (or mock) that receives a Structured_Summary and returns a Pattern_Match result
- **Pattern_Match**: The result of the AI analysis: a Condition_ID, a similarity percentage, and a confidence level
- **Condition_Library**: The set of predefined JSON files in `conditions/` that drive all condition-specific content
- **Condition_ID**: A string key identifying one of the ~20 supported wellbeing/condition categories (e.g. `anxiety`, `depression`, `adhd`, `ocd`, `stress`, `anger`, …)
- **Dynamic_Disorder_Tab**: The navbar tab created after a condition is first detected; named after the active condition (e.g. 🧠 Anxiety)
- **Active_Condition**: The condition whose tab is currently shown in the navbar
- **Condition_History**: The record of all prior analyses and their Pattern_Match results, stored in the Analysis page
- **Immediate_Support**: AI-personalised immediate steps drawn from the Condition_Library for the current user state
- **Activity**: A structured wellbeing exercise (breathing, grounding, focus timer, etc.) defined in a Condition_Library file
- **Activity_Feedback**: Before/after mood, stress, and energy scores captured after completing activities
- **Journey_Entry**: A single day's automatically-compiled record: mood, analysis result, activities, tools used, and feedback
- **Journey_Map**: The chronological visual timeline of all Journey_Entry records
- **Insight**: An AI-interpreted observation about the user's progress trend (Improving / Unchanged / Worsening)
- **Recommendation**: A matched professional care provider shown in the Recommendations section
- **Safety_Engine**: The always-active background layer that screens input for concerning content and intervenes gently
- **Calm_Session**: A recorded instance of the user using the ambient audio player
- **Mood_Check**: A quick tool recording mood, energy, stress, and sleep
- **Cognitive_Load_Entry**: A record of study/work duration, mental workload, screen time, caffeine intake, and sleep
- **Lifestyle_Entry**: A record of sleep, activity, hydration, height, and weight
- **Sleep_Entry**: A record of sleep duration, bedtime, wake time, quality, and routine consistency

---

## Requirements

### Requirement 1: Anonymous Authentication

**User Story:** As a User, I want to create an account using only a UID and password so that I can use the app without providing any personally identifying information.

#### Acceptance Criteria

1. THE App SHALL provide a Create Account screen with a generated Anonymous UID and a password field only — no name, email, or phone number.
2. THE App SHALL provide a Login screen accepting UID and password.
3. WHEN the User creates an account, THE App SHALL generate a unique UID in the format `WB-XXXXXX`.
4. THE App SHALL store credentials locally; no account data shall be sent to any external server.
5. WHEN the User logs in with correct credentials, THE App SHALL grant access to the main application.
6. WHEN the User logs in with incorrect credentials, THE App SHALL display an appropriate error message.

---

### Requirement 2: Home Page

**User Story:** As a User, I want a simple dashboard that shows my current state and gives me quick access to the most relevant next action, so that I know exactly where I am and what to do next.

#### Acceptance Criteria

1. WHEN the User has no prior analysis, THE Home Page SHALL display a "How are you feeling today?" prompt with a Start Analysis call-to-action.
2. WHEN the User has a prior analysis, THE Home Page SHALL display: current active condition/pattern, today's recommended activity, current mood indicator, recent progress summary, and quick-access buttons for Analysis, Calm, and Mood Check.
3. THE Home Page SHALL display a Continue current activity button when an activity is in progress.
4. THE Home Page SHALL display a feedback reminder when activities were completed today without feedback being recorded.
5. THE Home Page SHALL be intentionally minimal to reduce cognitive load.

---

### Requirement 3: Local Privacy Filter

**User Story:** As a User, I want my raw personal text to stay on my device so that sensitive details are never sent to any AI or external service.

#### Acceptance Criteria

1. WHEN the User submits free-text input in Analysis, THE Local_Privacy_Filter SHALL process the text on-device before any data leaves the client.
2. THE Local_Privacy_Filter SHALL attempt to detect and remove or replace: names, phone numbers, email addresses, physical addresses, place names, school/college/company identifiers, and social media handles.
3. AFTER filtering, THE App SHALL produce a Structured_Summary containing: mood score, stress level, energy level, context tags, and a brief sanitised description.
4. THE App SHALL send only the Structured_Summary to the AI_Engine; the raw input SHALL remain local.
5. THE App SHALL display to the User what will be sent before sending, with an option to review or cancel.

---

### Requirement 4: AI Analysis

**User Story:** As a User, I want the app to identify which wellbeing pattern best matches my current state so that I can receive relevant, personalised support.

#### Acceptance Criteria

1. THE AI_Engine SHALL receive a Structured_Summary and compare it against the set of supported Condition_IDs.
2. THE AI_Engine SHALL return a Pattern_Match containing: a Condition_ID, a similarity percentage (0–100), and a confidence level.
3. THE App SHALL display the result using non-diagnostic language: "Depression-related pattern detected — Pattern similarity: 82%".
4. THE App SHALL display the disclaimer: "This is not a clinical diagnosis. This result is based on pattern similarity only."
5. WHEN the input does not strongly match any condition, THE AI_Engine SHALL return the `general-wellbeing` condition.
6. THE App SHALL call the AI_Engine only with the Structured_Summary, never with raw user text.

---

### Requirement 5: Condition Library

**User Story:** As a developer, I want all condition-specific content defined in local JSON files so that the AI cannot invent interventions and the app can work offline after initial load.

#### Acceptance Criteria

1. THE App SHALL maintain a `conditions/` directory containing one JSON file per supported Condition_ID.
2. EACH condition file SHALL contain: condition name, description, immediate actions list, activities list, recommended sounds list, condition-specific tools list, and safety guidance.
3. THE App SHALL derive all UI content for the Dynamic_Disorder_Tab from the matching condition file.
4. THE AI_Engine SHALL NOT generate activity content; it SHALL only return a Condition_ID and similarity score.
5. THE App SHALL support at minimum the following Condition_IDs: `anxiety`, `depression`, `adhd`, `ocd`, `stress`, `anger`, `general-wellbeing`.

---

### Requirement 6: Dynamic Disorder Tab

**User Story:** As a User, after my first analysis I want a personalised tab in the navbar dedicated to my active condition so that I have a focused space for my support experience.

#### Acceptance Criteria

1. WHEN a Pattern_Match is returned for the first time, THE App SHALL create a Dynamic_Disorder_Tab in the navbar labelled with the condition name (e.g. 🧠 Anxiety).
2. THE Dynamic_Disorder_Tab SHALL contain: Immediate Support section and Condition-Specific Tools section.
3. THE Immediate_Support section SHALL use the AI's interpretation of the current Structured_Summary to select and sequence steps from the Condition_Library.
4. EACH step in Immediate_Support SHALL have a Start button, a completion checkbox, and a timer where applicable.
5. THE Dynamic_Disorder_Tab SHALL NOT be a permanent navbar item before any analysis has been completed.
6. WHEN the User completes a subsequent analysis that yields a different condition with higher similarity, THE App SHALL update the Dynamic_Disorder_Tab to reflect the new Active_Condition and retain the previous condition in Condition_History.
7. AT MOST ONE Dynamic_Disorder_Tab SHALL appear in the navbar at any time.

---

### Requirement 7: Condition-Specific Tools

**User Story:** As a User, I want tools tailored to my active condition so that the exercises I see are relevant to what I am experiencing.

#### Acceptance Criteria

1. WHEN the Active_Condition is `anxiety`, THE Condition-Specific Tools SHALL include: Breathing exercise, Grounding exercise, Relaxation exercise, Thought exercises, and Calming audio.
2. WHEN the Active_Condition is `depression`, THE Condition-Specific Tools SHALL include: Behavioural activation, Small activity prompts, Mood boosters, Self-care, and Thought exercises.
3. WHEN the Active_Condition is `adhd`, THE Condition-Specific Tools SHALL include: Focus timer, Task breakdown, Pomodoro timer, Priority planning, and Distraction management.
4. WHEN the Active_Condition is `ocd`, THE Condition-Specific Tools SHALL include: Thought awareness, Coping strategies, Ritual awareness, and Educational resources.
5. EACH tool SHALL be implemented as an Activity with Start, timer, and Complete flow.
6. WHEN the User completes a tool Activity, THE App SHALL record a Journey_Entry item and prompt for Activity_Feedback.

---

### Requirement 8: Condition-Specific Sounds

**User Story:** As a User, I want the calming sounds surfaced in my disorder tab to be curated for my condition so that I get the most relevant audio support.

#### Acceptance Criteria

1. THE Dynamic_Disorder_Tab SHALL display a Sounds section showing only the sounds recommended for the Active_Condition.
2. WHEN the Active_Condition is `anxiety`, the recommended sounds SHALL include: Ocean, Rain, Brown noise.
3. WHEN the Active_Condition is `stress`, the recommended sounds SHALL include: Forest, Rain, Ambient music.
4. EACH sound item SHALL have Play, timer display, and Complete controls.
5. WHEN the User completes a sound session, THE App SHALL record a Calm_Session in the Journey_Entry.

---

### Requirement 9: Tools — General Purpose

**User Story:** As a User, I want a set of general wellbeing tracking tools available regardless of my active condition so that I can monitor my daily health metrics.

#### Acceptance Criteria

1. THE Tools section SHALL contain: Mood Check, Cognitive Load & Caffeine, Lifestyle Tracker, Calm (full audio library), and Sleep & Routine.
2. THE Mood Check tool SHALL capture: mood (1–10), energy (1–10), stress (1–10), and sleep quality.
3. THE Cognitive Load & Caffeine tool SHALL capture: study/work duration, mental workload level, screen time, caffeine intake, and sleep hours.
4. THE Lifestyle Tracker SHALL capture: sleep hours, physical activity, hydration, height, and weight.
5. THE Calm tool SHALL offer the full audio library: Ocean, Rain, Forest, Wind, Fireplace, White noise, Brown noise, Ambient sounds, Frequency-based sounds; with timer options of 5 min, 10 min, 20 min, and Custom.
6. THE Sleep & Routine tool SHALL capture: sleep duration, bedtime, wake time, sleep quality, and routine consistency.
7. THE App SHALL display observed relationships in the Cognitive Load tool using non-causal, non-diagnostic language (e.g. "Your reported stress has tended to be higher on days when you slept less.").
8. THE Lifestyle Tracker SHALL present weight and hydration guidance as general/educational information, not as prescriptive targets.

---

### Requirement 10: Journal & Journey

**User Story:** As a User, I want a combined Journal and Journey section that automatically compiles my daily wellbeing record so that I can review what I did and how I felt without manual effort.

#### Acceptance Criteria

1. THE Journal & Journey section SHALL automatically compile a Journey_Entry for each day containing: before-support mood/stress/energy, Analysis result (if any), activities completed, tools used, and Activity_Feedback.
2. THE Journey_Map SHALL display a chronological vertical timeline of all Journey_Entry records.
3. EACH Journey_Entry node SHALL display: date, mood change summary, condition result (if any), and activities list.
4. WHEN the User activates a Journey_Entry node, THE App SHALL expand it to show full details.
5. THE App SHALL NOT have a separate Journal feature inside Tools; Journal & Journey is the single dedicated navbar section.
6. WHEN no Journey_Entry records exist, THE App SHALL display a meaningful empty state.

---

### Requirement 11: Activity Feedback

**User Story:** As a User, I want to record how I feel after completing my activities so that my progress can be tracked and evaluated accurately.

#### Acceptance Criteria

1. AFTER the User completes all Immediate_Support activities, THE App SHALL display a Feedback screen.
2. THE Feedback screen SHALL capture Before and After values for: mood (1–10), stress (1–10), and energy (1–10).
3. THE App SHALL support emoji-based, numerical, and optional text feedback inputs.
4. WHEN the User submits feedback, THE App SHALL store the Activity_Feedback alongside the Journey_Entry.
5. THE App SHALL send only the structured before/after data to the AI for feedback analysis; no raw text unless the User opts in.

---

### Requirement 12: AI Feedback Analysis

**User Story:** As a User, I want the app to interpret whether my activities helped so that I know if I am making progress.

#### Acceptance Criteria

1. AFTER Activity_Feedback is submitted, THE AI_Engine SHALL receive the structured before/after scores and activities list.
2. THE AI_Engine SHALL return one of three progress signals: Improving, Unchanged, or Worsening.
3. THE App SHALL display the signal with a colour indicator: 🟢 Improving, 🟡 Unchanged, 🔴 Worsening.
4. WHEN the signal is Unchanged or Worsening, THE App SHALL suggest considering professional support.
5. THE App SHALL display the AI feedback result using non-diagnostic language.

---

### Requirement 13: Insights

**User Story:** As a User, I want a visual summary of my wellbeing trends over time so that I can understand whether I am improving and which activities help most.

#### Acceptance Criteria

1. THE Insights page SHALL display a Progress Overview section with trend charts for: mood, stress, energy, sleep, activity frequency, and cognitive load.
2. THE Insights page SHALL display an Activity Effectiveness section showing before/after changes per activity type.
3. THE Insights page SHALL display an AI Progress Interpretation: Improving, No significant improvement, or Worsening with next-step recommendations.
4. WHEN the AI Progress Interpretation is Worsening or No significant improvement, THE App SHALL display a prompt to consider speaking with a qualified professional.
5. ALL descriptive text in Insights SHALL use non-diagnostic, non-causal language.
6. WHEN no data exists for a chart, THE App SHALL display a meaningful empty state.

---

### Requirement 14: Recommendations

**User Story:** As a User, I want to find relevant professional support based on my location and preferences so that I can take the next step when self-guided tools are not sufficient.

#### Acceptance Criteria

1. THE Recommendations section SHALL be accessible from: Insights (when warranted), the Analysis result screen, and manually at any time via the navbar.
2. THE User SHALL be able to specify preferences: location (city, optional locality), budget, professional type (Therapist, Psychologist, Psychiatrist), and mode (Online, Offline).
3. THE App SHALL display mock Provider Cards each containing: name, rating, location, approximate cost, specialisations, and a View button.
4. WHEN no Provider Cards match the applied filters, THE App SHALL display a meaningful empty state.
5. THE App SHALL be implemented with a modular architecture supporting replacement of mock data with a real provider API.

---

### Requirement 15: Always-On Safety Engine

**User Story:** As a User in distress, I want the app to detect concerning content and gently offer immediate support so that I am never left without help.

#### Acceptance Criteria

1. THE Safety_Engine SHALL run as a background layer screening all user text input across the application.
2. THE Safety_Engine SHALL analyse context rather than only matching individual trigger words.
3. WHEN concerning content is detected, THE App SHALL intervene gently with: "It sounds like you're going through something particularly difficult right now. Would you like some immediate support?"
4. THE App SHALL offer appropriate support options when it intervenes: crisis resources, Safety Screen, and Professional Care link.
5. THE Safety_Engine SHALL NOT display alarming or dramatic UI unless the situation clearly requires urgent intervention.
6. THE App SHALL display a persistently accessible "Need urgent help?" control on every authenticated page.

---

### Requirement 16: Profile & Privacy

**User Story:** As a User, I want full control over my account, data, and what is shared with the AI so that I trust the app with my personal wellbeing information.

#### Acceptance Criteria

1. THE Profile & Privacy page SHALL display: Anonymous UID, password change option, and logout.
2. THE App SHALL show the User a clear explanation of: what data is stored locally, what is sent to the AI, and what AI/cloud permissions are in use.
3. THE User SHALL be able to delete all local data.
4. THE User SHALL be able to export all local data as JSON.
5. THE App SHALL provide a toggle for AI/cloud permissions.
6. THE App SHALL provide notification, audio, accessibility, and theme settings.
7. WHEN the User activates Delete Data, THE App SHALL display a confirmation dialog before executing.

---

### Requirement 17: Navigation Structure

**User Story:** As a User, I want a clear and consistent navigation structure that adapts after my first analysis so that I can always find what I need.

#### Acceptance Criteria

1. BEFORE the first analysis, THE navbar SHALL contain: Home, Analysis, Tools, Journal, Insights, Recommendations, Profile.
2. AFTER the first analysis, THE navbar SHALL insert the Dynamic_Disorder_Tab between Analysis and Tools.
3. THE App SHALL highlight the currently active navigation destination.
4. WHILE the viewport width is below 768px, THE App SHALL display a compact top bar and a bottom navigation bar.
5. WHILE the viewport width is 768px or above, THE App SHALL display a sidebar or top navigation bar.
6. ALL navigation items SHALL be operable via keyboard in a logical focus order.

---

### Requirement 18: Responsive Design and Accessibility

**User Story:** As a User on any device, I want the app to be fully usable and accessible so that I can access support regardless of my device or ability.

#### Acceptance Criteria

1. THE App SHALL render correctly and be fully functional at viewport widths of 320px, 768px, and 1280px.
2. THE App SHALL meet WCAG AA contrast ratio requirements for all text and interactive elements.
3. THE App SHALL provide ARIA labels on all interactive controls that do not have visible text labels.
4. THE App SHALL ensure all interactive elements are reachable via keyboard navigation.
5. WHEN the User's system preference is `prefers-reduced-motion`, THE App SHALL disable or minimise all decorative animations.
6. NO interactive element SHALL be smaller than 44×44px on touch viewports.

---

### Requirement 19: Data Architecture

**User Story:** As a developer, I want a well-defined local data model so that all features share state consistently and the storage layer can be replaced with a backend in the future.

#### Acceptance Criteria

1. THE App SHALL maintain a single UserState model stored in localStorage containing: account, profile, journeyEntries, moodChecks, cognitiveLoadEntries, lifestyleEntries, sleepEntries, calmSessions, analyses, activeCondition, conditionHistory, and recommendations preferences.
2. THE App SHALL persist UserState to localStorage on every state change.
3. THE App SHALL load UserState from localStorage on application startup.
4. WHEN localStorage data is missing or malformed, THE App SHALL initialise with empty collections and default values without throwing an error.
5. THE storage layer SHALL be implemented as a standalone replaceable module with no direct coupling to UI components.

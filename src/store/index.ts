import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  UserState,
  UserProfile,
  ProviderPreferences,
  PatternMatch,
  MoodCheckEntry,
  CognitiveLoadEntry,
  LifestyleEntry,
  SleepEntry,
  CalmSession,
  ActivityRecord,
  JourneyEntry,
  ActivityFeedbackScores,
  ConditionId,
} from '../types';
import type { AnalysisEngineResult, AnalysisEngineError } from '../types/aiAnalysis';
import type { PreprocessorOutput } from '../types/extraction';
import { preprocess } from '../services/preprocessor';
import { analyseExtraction } from '../services/aiEngine';
import { saveAnalysis } from '../services/storage';

// ---------------------------------------------------------------------------
// Auth session shape stored in the Zustand slice.
// We no longer store a password hash — Supabase manages auth state.
// ---------------------------------------------------------------------------

export interface AuthSession {
  /** Supabase auth.users UUID */
  userId: string;
  /** User-visible anonymous UID, e.g. WB-A3F9K2 */
  uid: string;
  /** ISO timestamp of when this session was established client-side */
  sessionStart: string;
  /** True when the user is in read-only demo mode (no Supabase account) */
  isDemo: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getTodayDate = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getDefaultProviderPreferences = (): ProviderPreferences => ({
  preferredTypes: [],
  durationPreferenceMinutes: 10,
  soundEnabled: true,
  defaultVolume: 50,
  notificationsEnabled: true,
});

const getDefaultProfile = (): UserProfile => ({
  displayName: undefined,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  theme: 'system',
  reducedMotion: (() => {
    try {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      }
    } catch {
      /* ignore */
    }
    return false;
  })(),
  aiPermissionsEnabled: true,
  providerPreferences: getDefaultProviderPreferences(),
});

const getDefaultEmptyState = (): UserState => ({
  account: null,
  profile: getDefaultProfile(),
  activeCondition: null,
  moodChecks: [],
  cognitiveLoads: [],
  lifestyleEntries: [],
  sleepEntries: [],
  calmSessions: [],
  activityRecords: [],
  journeyEntries: [],
  patternMatches: [],
  conditionHistory: [],
});

const compileJourneyForDate = (date: string, state: UserState): JourneyEntry => {
  const existing = state.journeyEntries.find((je) => je.date === date);
  const activitiesCompleted = state.activityRecords.filter(
    (a) => a.completedAt && new Date(a.completedAt).toISOString().slice(0, 10) === date
  );
  const calmSessions = state.calmSessions.filter(
    (c) => c.startedAt.slice(0, 10) === date
  );
  const moodCheckBefore = state.moodChecks
    .filter((m) => m.timestamp.slice(0, 10) === date)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0];
  const analysis = state.patternMatches.filter(
    (p) => p.timestamp.slice(0, 10) === date
  );
  const toolsUsed = Array.from(
    new Set(activitiesCompleted.map((a) => a.activityType))
  );
  return {
    date,
    moodCheckBefore,
    analysis,
    activitiesCompleted,
    calmSessions,
    toolsUsed,
    feedback: existing?.feedback,
    progressSignal: existing?.progressSignal,
  };
};

// ---------------------------------------------------------------------------
// Safe localStorage wrapper
// ---------------------------------------------------------------------------

const safeStorage = createJSONStorage<AppStore>(() => ({
  getItem: (name: string) => {
    try {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(name, value);
    } catch (e) {
      console.warn('[store] localStorage write failed', e);
    }
  },
  removeItem: (name: string) => {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(name);
    } catch {
      /* ignore */
    }
  },
}));

// ---------------------------------------------------------------------------
// Store interface
// ---------------------------------------------------------------------------

export interface AppStore extends UserState {
  /** Currently authenticated session. Null when logged out. */
  session: AuthSession | null;

  // ------------------------------------------------------------------
  // Auth actions — called by auth service callbacks, not by UI directly
  // ------------------------------------------------------------------

  /**
   * Called after a successful Supabase sign-in or sign-up.
   * Stores the resolved session so the whole app can read it.
   */
  setSession: (session: AuthSession | null) => void;

  /**
   * Enter a temporary demo/guest mode. No Supabase account is created.
   * Data lives in memory only and is not persisted to the database.
   */
  loginDemo: () => void;

  /**
   * Clear all session + user data from the store.
   * Called on logout or deleteData.
   */
  clearSession: () => void;

  // ------------------------------------------------------------------
  // Legacy compatibility shims — kept so existing components compile
  // without requiring simultaneous UI refactors.
  // These will be cleaned up in Phase 2.
  // ------------------------------------------------------------------

  /** @deprecated Use setSession instead. Kept for component compatibility. */
  createAccount: (account: { uid: string; passwordHash: string; createdAt: string }) => void;
  /** @deprecated Use setSession instead. Kept for component compatibility. */
  login: (uid: string, passwordHash: string) => boolean;

  // ------------------------------------------------------------------
  // Application actions (unchanged from previous implementation)
  // ------------------------------------------------------------------

  // ------------------------------------------------------------------
  // Active Analysis Pipeline State & Actions
  // ------------------------------------------------------------------
  currentAnalysisInput: string;
  currentExtractionOutput: PreprocessorOutput | null;
  currentAnalysisResult: AnalysisEngineResult | null;
  analysisError: AnalysisEngineError | null;
  isAnalysing: boolean;

  setAnalysisInput: (text: string) => void;
  clearAnalysisSession: () => void;
  runAnalysisPipeline: () => Promise<boolean>;

  logout: () => void;
  setActiveCondition: (conditionId: ConditionId | null) => void;
  addPatternMatch: (match: PatternMatch) => void;
  logMoodCheck: (entry: MoodCheckEntry) => void;
  logCognitiveLoad: (entry: CognitiveLoadEntry) => void;
  logLifestyle: (entry: LifestyleEntry) => void;
  logSleep: (entry: SleepEntry) => void;
  recordCalmSession: (session: CalmSession) => void;
  startActivity: (activity: ActivityRecord) => void;
  completeActivity: (activityId: string, completedAt: string, durationMinutes: number) => void;
  submitFeedback: (date: string, scores: ActivityFeedbackScores) => void;
  updateProviderPrefs: (prefs: Partial<ProviderPreferences>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  deleteData: () => void;
  loadState: (state: UserState) => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...getDefaultEmptyState(),
      session: null,
      currentAnalysisInput: '',
      currentExtractionOutput: null,
      currentAnalysisResult: null,
      analysisError: null,
      isAnalysing: false,

      setAnalysisInput: (text) => {
        set({ currentAnalysisInput: text });
      },

      clearAnalysisSession: () => {
        set({
          currentAnalysisInput: '',
          currentExtractionOutput: null,
          currentAnalysisResult: null,
          analysisError: null,
          isAnalysing: false,
        });
      },

      runAnalysisPipeline: async () => {
        const { currentAnalysisInput, session } = get();
        const trimmed = currentAnalysisInput.trim();
        if (!trimmed) return false;

        // 1. Clear previous result before starting new analysis request
        set({
          currentAnalysisResult: null,
          analysisError: null,
          isAnalysing: true,
        });

        try {
          // 2. Local preprocessing (Phase 2)
          const preprocessed = preprocess({ rawText: trimmed });
          set({ currentExtractionOutput: preprocessed });

          // 3. Send sanitized extraction to Phase 3 AI Engine
          const callResult = await analyseExtraction(preprocessed.extraction);

          if (callResult.ok) {
            const res = callResult.result;
            const primaryCondStr = res.primary_condition as string;
            const primaryCond = primaryCondStr !== 'no-clear-match' ? (primaryCondStr as ConditionId) : null;

            set({
              currentAnalysisResult: res,
              activeCondition: primaryCond,
              isAnalysing: false,
            });

            if (primaryCond) {
              get().addPatternMatch({
                conditionId: primaryCond,
                similarityPercent: res.similarity_score,
                similarityLevel: res.similarity_score >= 70 ? 'high' : res.similarity_score >= 40 ? 'medium' : 'low',
                timestamp: new Date().toISOString(),
              });

              if (session?.userId && !session.isDemo) {
                const ext = preprocessed.extraction;
                const mood = ext.severity === 'severe' ? 2 : ext.severity === 'high' ? 3 : ext.severity === 'moderate' ? 5 : 7;
                const stress = ext.severity === 'severe' ? 9 : ext.severity === 'high' ? 8 : ext.severity === 'moderate' ? 6 : 4;
                const energy = (ext.symptoms.includes('fatigue') || ext.symptoms.includes('low energy')) ? 3 : 6;
                const contextTags = Array.from(new Set([...ext.trigger, ...ext.impact]));

                saveAnalysis(session.userId, primaryCond, res.similarity_score, {
                  mood,
                  stress,
                  energy,
                  context_tags: contextTags,
                });
              }
            }
            return true;
          } else {
            set({
              analysisError: callResult.error,
              currentAnalysisResult: null,
              isAnalysing: false,
            });
            return false;
          }
        } catch (err) {
          set({
            analysisError: {
              code: 'UNKNOWN',
              message: err instanceof Error ? err.message : String(err),
            },
            currentAnalysisResult: null,
            isAnalysing: false,
          });
          return false;
        } finally {
          set({ isAnalysing: false });
        }
      },

      // ----------------------------------------------------------------
      // Auth
      // ----------------------------------------------------------------

      setSession: (session) => {
        set({ session });
      },

      loginDemo: () => {
        set({
          session: {
            userId: 'demo-user-id',
            uid: 'WB-DEMO00',
            sessionStart: new Date().toISOString(),
            isDemo: true,
          },
          // Also set legacy account field so existing components that
          // still read `account` don't break during the transition.
          account: {
            uid: 'WB-DEMO00',
            passwordHash: '__demo__',
            createdAt: new Date().toISOString(),
          },
        });
      },

      clearSession: () => {
        set({
          ...getDefaultEmptyState(),
          session: null,
        });
      },

      // ----------------------------------------------------------------
      // Legacy shims (Phase 1 compatibility — removed in Phase 2)
      // ----------------------------------------------------------------

      createAccount: (account) => {
        // Legacy: local-only account creation.
        // In Phase 1+ this is a no-op because Supabase handles creation;
        // setSession is called after auth.createAccount() resolves.
        set({ account });
      },

      login: (_uid, _passwordHash) => {
        // Legacy: local credential check against stored hash.
        // In Phase 1+ auth is handled by Supabase; this shim always
        // returns true so existing component code doesn't break.
        return true;
      },

      // ----------------------------------------------------------------
      // Logout
      // ----------------------------------------------------------------

      logout: () => {
        set({ session: null, account: null });
      },

      // ----------------------------------------------------------------
      // Application state actions (unchanged)
      // ----------------------------------------------------------------

      setActiveCondition: (conditionId) => {
        set({ activeCondition: conditionId });
      },

      addPatternMatch: (match) => {
        set((state) => {
          const patternMatches = [...state.patternMatches, match];
          const existingHistory = state.conditionHistory.find(
            (h) => h.conditionId === match.conditionId
          );
          const conditionHistory = existingHistory
            ? state.conditionHistory.map((h) =>
                h.conditionId === match.conditionId
                  ? {
                      ...h,
                      lastDetectedAt: match.timestamp,
                      matchCount: h.matchCount + 1,
                      highestSimilarity: Math.max(h.highestSimilarity, match.similarityPercent),
                    }
                  : h
              )
            : [
                ...state.conditionHistory,
                {
                  conditionId: match.conditionId,
                  firstDetectedAt: match.timestamp,
                  lastDetectedAt: match.timestamp,
                  matchCount: 1,
                  highestSimilarity: match.similarityPercent,
                },
              ];
          return { patternMatches, conditionHistory };
        });
      },

      logMoodCheck: (entry) => {
        set((state) => {
          const moodChecks = [...state.moodChecks, entry];
          const today = getTodayDate();
          const newJourney = compileJourneyForDate(today, { ...state, moodChecks });
          const journeyEntries = [
            ...state.journeyEntries.filter((je) => je.date !== today),
            newJourney,
          ];
          return { moodChecks, journeyEntries };
        });
      },

      logCognitiveLoad: (entry) => {
        set((state) => ({ cognitiveLoads: [...state.cognitiveLoads, entry] }));
      },

      logLifestyle: (entry) => {
        set((state) => ({ lifestyleEntries: [...state.lifestyleEntries, entry] }));
      },

      logSleep: (entry) => {
        set((state) => ({ sleepEntries: [...state.sleepEntries, entry] }));
      },

      recordCalmSession: (session) => {
        set((state) => {
          const calmSessions = [...state.calmSessions, session];
          const today = getTodayDate();
          const newJourney = compileJourneyForDate(today, { ...state, calmSessions });
          const journeyEntries = [
            ...state.journeyEntries.filter((je) => je.date !== today),
            newJourney,
          ];
          return { calmSessions, journeyEntries };
        });
      },

      startActivity: (activity) => {
        set((state) => {
          const activityRecords = [...state.activityRecords, activity];
          const today = getTodayDate();
          const newJourney = compileJourneyForDate(today, { ...state, activityRecords });
          const journeyEntries = [
            ...state.journeyEntries.filter((je) => je.date !== today),
            newJourney,
          ];
          return { activityRecords, journeyEntries };
        });
      },

      completeActivity: (activityId, completedAt, durationMinutes) => {
        set((state) => {
          const activityRecords = state.activityRecords.map((a) =>
            a.id === activityId ? { ...a, completedAt, durationMinutes } : a
          );
          const today = getTodayDate();
          const newJourney = compileJourneyForDate(today, { ...state, activityRecords });
          const journeyEntries = [
            ...state.journeyEntries.filter((je) => je.date !== today),
            newJourney,
          ];
          return { activityRecords, journeyEntries };
        });
      },

      submitFeedback: (date, scores) => {
        set((state) => {
          const others = state.journeyEntries.filter((je) => je.date !== date);
          const existing = state.journeyEntries.find((je) => je.date === date);
          const updated: JourneyEntry = existing
            ? { ...existing, feedback: scores }
            : { date, activitiesCompleted: [], calmSessions: [], toolsUsed: [], feedback: scores };
          return { journeyEntries: [...others, updated] };
        });
      },

      updateProviderPrefs: (prefs) => {
        set((state) => ({
          profile: {
            ...state.profile,
            providerPreferences: { ...state.profile.providerPreferences, ...prefs },
          },
        }));
      },

      updateProfile: (profile) => {
        set((state) => ({ profile: { ...state.profile, ...profile } }));
      },

      deleteData: () => {
        const fresh = getDefaultEmptyState();
        set({
          ...fresh,
          session: null,
          account: null,
          profile: {
            ...fresh.profile,
            reducedMotion: (() => {
              try {
                if (typeof window !== 'undefined' && window.matchMedia) {
                  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                }
              } catch {
                /* ignore */
              }
              return false;
            })(),
          },
        });
      },

      loadState: (loadedState) => {
        const safe: UserState = {
          ...getDefaultEmptyState(),
          ...loadedState,
          moodChecks: Array.isArray(loadedState.moodChecks) ? loadedState.moodChecks : [],
          cognitiveLoads: Array.isArray(loadedState.cognitiveLoads) ? loadedState.cognitiveLoads : [],
          lifestyleEntries: Array.isArray(loadedState.lifestyleEntries) ? loadedState.lifestyleEntries : [],
          sleepEntries: Array.isArray(loadedState.sleepEntries) ? loadedState.sleepEntries : [],
          calmSessions: Array.isArray(loadedState.calmSessions) ? loadedState.calmSessions : [],
          activityRecords: Array.isArray(loadedState.activityRecords) ? loadedState.activityRecords : [],
          journeyEntries: Array.isArray(loadedState.journeyEntries) ? loadedState.journeyEntries : [],
          patternMatches: Array.isArray(loadedState.patternMatches) ? loadedState.patternMatches : [],
          conditionHistory: Array.isArray(loadedState.conditionHistory) ? loadedState.conditionHistory : [],
          profile: {
            ...getDefaultProfile(),
            ...loadedState.profile,
            providerPreferences: {
              ...getDefaultProviderPreferences(),
              ...(loadedState.profile?.providerPreferences ?? {}),
            },
          },
        };
        set(safe);
      },
    }),
    {
      name: 'wellbeing-hub-state',
      storage: safeStorage,
      // Don't persist the session — Supabase's own localStorage persistence
      // handles session survival across page refreshes. We re-hydrate the
      // session from Supabase in App.tsx on mount.
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { session, ...rest } = state;
        return rest as AppStore;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) console.warn('[store] Rehydration error', error);
        if (!state) return;
        // Ensure array fields are always arrays after rehydration
        const arrays: Array<keyof UserState> = [
          'moodChecks', 'cognitiveLoads', 'lifestyleEntries', 'sleepEntries',
          'calmSessions', 'activityRecords', 'journeyEntries', 'patternMatches',
          'conditionHistory',
        ];
        for (const key of arrays) {
          if (!Array.isArray(state[key])) {
            (state as any)[key] = [];
          }
        }
      },
    }
  )
);

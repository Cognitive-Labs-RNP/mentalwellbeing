import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  UserState,
  UserProfile,
  ProviderPreferences,
  AnonymousAccount,
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

const safeStorage = createJSONStorage<UserState>(() => ({
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
      console.warn('Storage quota or access error while persisting state', e);
    }
  },
  removeItem: (name: string) => {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(name);
    } catch {
    }
  },
}));

interface AppStore extends UserState {
  createAccount: (account: AnonymousAccount) => void;
  login: (uid: string, passwordHash: string) => boolean;
  loginDemo: () => void;
  logout: () => void;
  setActiveCondition: (conditionId: ConditionId | null) => void;
  addPatternMatch: (match: PatternMatch) => void;
  logMoodCheck: (entry: MoodCheckEntry) => void;
  logCognitiveLoad: (entry: CognitiveLoadEntry) => void;
  logLifestyle: (entry: LifestyleEntry) => void;
  logSleep: (entry: SleepEntry) => void;
  recordCalmSession: (session: CalmSession) => void;
  startActivity: (activity: ActivityRecord) => void;
  completeActivity: (
    activityId: string,
    completedAt: string,
    durationMinutes: number
  ) => void;
  submitFeedback: (date: string, scores: ActivityFeedbackScores) => void;
  updateProviderPrefs: (prefs: Partial<ProviderPreferences>) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  deleteData: () => void;
  loadState: (state: UserState) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...getDefaultEmptyState(),

      createAccount: (account) => {
        set({ account });
      },

      login: (uid, passwordHash) => {
        const { account } = get();
        if (!account) return false;
        if (account.uid === uid && account.passwordHash === passwordHash) {
          set({ account: { ...account } });
          return true;
        }
        return false;
      },

      loginDemo: () => {
        set({
          account: {
            uid: 'WB-DEMO00',
            passwordHash: 'demo-mode-no-auth',
            createdAt: new Date().toISOString(),
          },
        });
      },

      logout: () => {
        set({ account: null });
      },

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
                      highestSimilarity: Math.max(
                        h.highestSimilarity,
                        match.similarityPercent
                      ),
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
          const newJourney = compileJourneyForDate(today, {
            ...state,
            moodChecks,
          });
          const journeyEntries = [
            ...state.journeyEntries.filter((je) => je.date !== today),
            newJourney,
          ];
          return { moodChecks, journeyEntries };
        });
      },

      logCognitiveLoad: (entry) => {
        set((state) => ({
          cognitiveLoads: [...state.cognitiveLoads, entry],
        }));
      },

      logLifestyle: (entry) => {
        set((state) => ({
          lifestyleEntries: [...state.lifestyleEntries, entry],
        }));
      },

      logSleep: (entry) => {
        set((state) => ({
          sleepEntries: [...state.sleepEntries, entry],
        }));
      },

      recordCalmSession: (session) => {
        set((state) => {
          const calmSessions = [...state.calmSessions, session];
          const today = getTodayDate();
          const newJourney = compileJourneyForDate(today, {
            ...state,
            calmSessions,
          });
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
          const newJourney = compileJourneyForDate(today, {
            ...state,
            activityRecords,
          });
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
            a.id === activityId
              ? { ...a, completedAt, durationMinutes }
              : a
          );
          const today = getTodayDate();
          const newJourney = compileJourneyForDate(today, {
            ...state,
            activityRecords,
          });
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
            : {
                date,
                activitiesCompleted: [],
                calmSessions: [],
                toolsUsed: [],
                feedback: scores,
              };
          return { journeyEntries: [...others, updated] };
        });
      },

      updateProviderPrefs: (prefs) => {
        set((state) => ({
          profile: {
            ...state.profile,
            providerPreferences: {
              ...state.profile.providerPreferences,
              ...prefs,
            },
          },
        }));
      },

      updateProfile: (profile) => {
        set((state) => ({
          profile: { ...state.profile, ...profile },
        }));
      },

      deleteData: () => {
        const fresh = getDefaultEmptyState();
        set({
          ...fresh,
          profile: {
            ...fresh.profile,
            ...get().profile,
            aiPermissionsEnabled: fresh.profile.aiPermissionsEnabled,
            reducedMotion: (() => {
              try {
                if (typeof window !== 'undefined' && window.matchMedia) {
                  return window.matchMedia(
                    '(prefers-reduced-motion: reduce)'
                  ).matches;
                }
              } catch {
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
          moodChecks: Array.isArray(loadedState.moodChecks)
            ? loadedState.moodChecks
            : [],
          cognitiveLoads: Array.isArray(loadedState.cognitiveLoads)
            ? loadedState.cognitiveLoads
            : [],
          lifestyleEntries: Array.isArray(loadedState.lifestyleEntries)
            ? loadedState.lifestyleEntries
            : [],
          sleepEntries: Array.isArray(loadedState.sleepEntries)
            ? loadedState.sleepEntries
            : [],
          calmSessions: Array.isArray(loadedState.calmSessions)
            ? loadedState.calmSessions
            : [],
          activityRecords: Array.isArray(loadedState.activityRecords)
            ? loadedState.activityRecords
            : [],
          journeyEntries: Array.isArray(loadedState.journeyEntries)
            ? loadedState.journeyEntries
            : [],
          patternMatches: Array.isArray(loadedState.patternMatches)
            ? loadedState.patternMatches
            : [],
          conditionHistory: Array.isArray(loadedState.conditionHistory)
            ? loadedState.conditionHistory
            : [],
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
      partialize: (state) => state,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Rehydration error, using empty collections', error);
        }
        if (state) {
          state.moodChecks = Array.isArray(state.moodChecks)
            ? state.moodChecks
            : [];
          state.cognitiveLoads = Array.isArray(state.cognitiveLoads)
            ? state.cognitiveLoads
            : [];
          state.lifestyleEntries = Array.isArray(state.lifestyleEntries)
            ? state.lifestyleEntries
            : [];
          state.sleepEntries = Array.isArray(state.sleepEntries)
            ? state.sleepEntries
            : [];
          state.calmSessions = Array.isArray(state.calmSessions)
            ? state.calmSessions
            : [];
          state.activityRecords = Array.isArray(state.activityRecords)
            ? state.activityRecords
            : [];
          state.journeyEntries = Array.isArray(state.journeyEntries)
            ? state.journeyEntries
            : [];
          state.patternMatches = Array.isArray(state.patternMatches)
            ? state.patternMatches
            : [];
          state.conditionHistory = Array.isArray(state.conditionHistory)
            ? state.conditionHistory
            : [];
        }
      },
    }
  )
);

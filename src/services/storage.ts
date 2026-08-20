import type { UserState, UserProfile, ProviderPreferences } from '../types';

const STORAGE_KEY = 'wellbeing-hub-state';

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

const getDefaultEmptyUserState = (): UserState => ({
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

export const StorageService = {
  save(userState: UserState): boolean {
    try {
      if (typeof localStorage === 'undefined') {
        return false;
      }
      const serialized = JSON.stringify(userState);
      localStorage.setItem(STORAGE_KEY, serialized);
      return true;
    } catch (err) {
      if (
        err instanceof DOMException &&
        (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
      ) {
        console.warn(
          'StorageService: localStorage quota exceeded; state was not persisted.',
          err
        );
      } else {
        console.warn('StorageService: unable to save state to localStorage.', err);
      }
      return false;
    }
  },

  load(): UserState {
    const empty = getDefaultEmptyUserState();
    try {
      if (typeof localStorage === 'undefined') {
        return empty;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return empty;
      }
      const parsed = JSON.parse(raw) as Partial<UserState>;
      return {
        ...empty,
        ...parsed,
        moodChecks: Array.isArray(parsed.moodChecks) ? parsed.moodChecks : [],
        cognitiveLoads: Array.isArray(parsed.cognitiveLoads)
          ? parsed.cognitiveLoads
          : [],
        lifestyleEntries: Array.isArray(parsed.lifestyleEntries)
          ? parsed.lifestyleEntries
          : [],
        sleepEntries: Array.isArray(parsed.sleepEntries)
          ? parsed.sleepEntries
          : [],
        calmSessions: Array.isArray(parsed.calmSessions) ? parsed.calmSessions : [],
        activityRecords: Array.isArray(parsed.activityRecords)
          ? parsed.activityRecords
          : [],
        journeyEntries: Array.isArray(parsed.journeyEntries)
          ? parsed.journeyEntries
          : [],
        patternMatches: Array.isArray(parsed.patternMatches)
          ? parsed.patternMatches
          : [],
        conditionHistory: Array.isArray(parsed.conditionHistory)
          ? parsed.conditionHistory
          : [],
        profile: {
          ...empty.profile,
          ...(parsed.profile ?? {}),
          providerPreferences: {
            ...empty.profile.providerPreferences,
            ...(parsed.profile?.providerPreferences ?? {}),
          },
        },
      };
    } catch (err) {
      if (err instanceof SyntaxError) {
        console.warn(
          'StorageService: malformed JSON in localStorage; returning empty state.',
          err
        );
      } else {
        console.warn('StorageService: unable to load state from localStorage.', err);
      }
      return empty;
    }
  },

  clear(): boolean {
    try {
      if (typeof localStorage === 'undefined') {
        return false;
      }
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (err) {
      console.warn('StorageService: unable to clear localStorage.', err);
      return false;
    }
  },
};

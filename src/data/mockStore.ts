/**
 * In-memory store for MOCK MODE (no Convex/Clerk keys). Makes every mock interaction
 * work in Expo Go: sign-in, profile setup, register, mandala completion, donations.
 * General demo state resets on reload; v14 account state is restored separately by hooks.mock.
 */
import { useSyncExternalStore } from 'react';

import * as fx from './fixtures';
import type { GunaResult, GunaPromptState, PracticeUnlocks, YakshaState, DonationResult, Mandala, NotificationPrefs, Profile, SessionStatus } from './types';

export type MockState = {
  accountStorageKey: string | null;
  gunaResult: GunaResult | null;
  gunaPrompt: GunaPromptState;
  practiceUnlocks: PracticeUnlocks;
  seriesAccess: string[];
  yakshaAnswers: Record<string, YakshaState>;
  session: SessionStatus;
  pendingPhone: string | null;
  profile: Profile | null;
  prefs: NotificationPrefs;
  registeredEventIds: string[];
  mandala: Mandala | null;
  /** Mock audit dates beyond the legacy first-40-calendar-day grid. */
  mandalaCompletionDays: string[];
  lastCountedSittingDay: string | null;
  groupTodayCount: number;
  groupCycleSittings: number;
  savedVakyamIds: string[];
  readingPositions: Record<string, number>; // episodeId -> 0..1
  lastEpisodeId: string | null;
  donations: DonationResult[];
};

const initialMandala: Mandala = {
  id: 'mandala-1',
  practiceId: 'intro-samatha',
  practiceTitle: 'Samatha meditation',
  startDate: '2026-10-26',
  currentDay: 12,
  days: fx.mandalaDays,
  daysSat: fx.mandalaDays.filter((d) => d === 'sat').length,
  sittingsDone: fx.mandalaDays.filter((d) => d === 'sat').length,
  lastSittingAt: '2026-11-05',
  streak: 5,
  todayComplete: false,
};

let state: MockState = {
  accountStorageKey: null, gunaResult: null, gunaPrompt: 'unseen', practiceUnlocks: { dhyanbhaari: false }, seriesAccess: [], yakshaAnswers: {},
  session: 'signedOut',
  pendingPhone: null,
  profile: null,
  prefs: { practiceReminder: true, dailyVakyam: false, registeredEvents: true },
  registeredEventIds: fx.events.filter((e) => e.registered).map((e) => e.id),
  mandala: initialMandala,
  mandalaCompletionDays: [],
  lastCountedSittingDay: null,
  groupTodayCount: fx.groupCount.todayCount,
  groupCycleSittings: fx.groupCount.cycleSittings,
  savedVakyamIds: [],
  readingPositions: { 'adi-e1': 1, 'adi-e2': 1, 'adi-e3': 0.42 },
  lastEpisodeId: 'adi-e3',
  donations: [],
};

let sessionGeneration = 0;
export const getMockSessionGeneration = () => sessionGeneration;

const listeners = new Set<() => void>();

export function getState() {
  return state;
}

export function setState(updater: (s: MockState) => Partial<MockState>) {
  state = { ...state, ...updater(state) };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useMockState<T>(selector: (s: MockState) => T): T {
  return useSyncExternalStore(subscribe, () => selector(state), () => selector(state));
}

/** Simulated network latency so loading states are exercised. */
export const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

/** Clear account-scoped state; anonymous group totals are deliberately retained. */
export function clearMockUserData() {
  sessionGeneration++;
  setState(() => ({ accountStorageKey: null, gunaResult: null, gunaPrompt: 'unseen', practiceUnlocks: { dhyanbhaari: false }, seriesAccess: [], yakshaAnswers: {}, session: 'signedOut', pendingPhone: null, profile: null,
    prefs: { practiceReminder: false, dailyVakyam: false, registeredEvents: true },
    registeredEventIds: [], mandala: null, mandalaCompletionDays: [], lastCountedSittingDay: null, savedVakyamIds: [], readingPositions: {},
    lastEpisodeId: null, donations: [],
  }));
}

/**
 * In-memory store for MOCK MODE (no Convex/Clerk keys). Makes every mock interaction
 * work in Expo Go: sign-in, profile setup, register, mandala completion, donations.
 * State resets on reload. Backend thread replaces reads/writes with Convex when keys exist.
 */
import { useSyncExternalStore } from 'react';

import * as fx from './fixtures';
import type { DonationResult, Mandala, NotificationPrefs, Profile, SessionStatus } from './types';

export type MockState = {
  session: SessionStatus;
  pendingPhone: string | null;
  profile: Profile | null;
  prefs: NotificationPrefs;
  registeredEventIds: string[];
  mandala: Mandala | null;
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
  practiceTitle: 'Introductory Samatha',
  startDate: '2026-10-26',
  currentDay: 12,
  days: fx.mandalaDays,
  daysSat: fx.mandalaDays.filter((d) => d === 'sat').length,
  streak: 5,
  todayComplete: false,
};

let state: MockState = {
  session: 'signedOut',
  pendingPhone: null,
  profile: null,
  prefs: { practiceReminder: true, dailyVakyam: true, registeredEvents: true },
  registeredEventIds: fx.events.filter((e) => e.registered).map((e) => e.id),
  mandala: initialMandala,
  groupTodayCount: fx.groupCount.todayCount,
  groupCycleSittings: fx.groupCount.cycleSittings,
  savedVakyamIds: [],
  readingPositions: { 'adi-e3': 0.42 },
  lastEpisodeId: 'adi-e3',
  donations: [],
};

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

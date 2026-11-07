/**
 * THE DATA CONTRACT. Screens import ONLY from '@/data' (this file + types).
 *
 * Semantics mirror Convex `useQuery` / `useMutation`:
 *   - query hooks return `undefined` while loading, then the value (or `null` = none).
 *   - action hooks return async functions that resolve when the write is confirmed.
 *
 * Current implementation: MOCK MODE (in-memory, see mockStore.ts) so the app runs in Expo Go
 * with no keys. The backend thread swaps each hook body for Convex + Clerk when
 * EXPO_PUBLIC_CONVEX_URL / EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY are set — signatures must not change.
 *
 * Every selector passed to useMockState must return a STABLE reference (a stored field),
 * never a freshly built object/array — derive with useMemo afterwards.
 */
import { useCallback, useMemo } from 'react';

import * as fx from './fixtures';
import { clearMockUserData, getMockSessionGeneration, delay, getState, setState, useMockState } from './mockStore';
import type {
  AgeBand,
  DonationResult,
  Episode,
  EventItem,
  GroupCount,
  Mandala,
  NotificationPrefs,
  Practice,
  Profile,
  ReadingProgress,
  Role,
  Season,
  Session,
  Vakyam,
  VakyamTheme,
  WisdomSearchResult,
  VolunteerSignup,
} from './types';
import { isMinor, THEME_LABELS } from './types';
import { foldForSearch, matchesFolded } from './search';
import { canUsePersonalFeatures } from './session';
import { phoneWithCountryCode } from './phone';
import { istDay, useClock } from './clock';
import { Linking } from 'react-native';

async function personalDelay(ms = 350) {
  const generation = getMockSessionGeneration();
  requirePersonalAccess();
  await delay(ms);
  if (getMockSessionGeneration() !== generation) throw new Error('Session changed.');
  requirePersonalAccess();
}

function requirePersonalAccess() {
  const s = getState();
  if (!canUsePersonalFeatures(s.session, s.profile)) throw new Error('Finish setup and guardian consent first.');
}


// ───────────────────────────── Session / auth (Clerk later) ─────────────────────────────

export function useSession(): Session {
  const status = useMockState((s) => s.session);
  const profile = useMockState(s => s.profile);
  const sendOtp = useCallback(async (phone: string) => {
    await delay();
    setState(() => ({ pendingPhone: phoneWithCountryCode(phone) }));
  }, []);
  const verifyOtp = useCallback(async (code: string) => {
    await delay();
    if (!/^\d{6}$/.test(code)) return false;
    const phone = getState().pendingPhone ?? '+910000000210';
    const last3 = phone.slice(-3);
    setState((s) => ({
      session: 'signedIn',
      profile: s.profile ?? {
        id: 'me',
        displayName: '',
        phoneMasked: `+91 ••••• ••${last3}`,
        ageBand: null,
        roles: [],
        language: 'en',
        reminderTime: '06:00',
        guardianConsent: 'notRequired',
        enrolled: false,
      },
    }));
    return true;
  }, []);
  const continueAsGuest = useCallback(() => setState(() => ({ session: 'guest' })), []);
  const signOut = useCallback(async () => {
    await delay(150);
    clearMockUserData();
  }, []);
  return { status, isSignedIn: status === 'signedIn', canUsePersonalFeatures: canUsePersonalFeatures(status, profile), sendOtp, verifyOtp, continueAsGuest, signOut };
}

// ───────────────────────────── Profile ─────────────────────────────

/** null = guest/signed out. A profile with empty displayName/ageBand needs setup (P-03). */
export function useProfile(): Profile | null | undefined {
  return useMockState((s) => s.profile);
}

export function useUpdateProfile() {
  return useCallback(
    async (
      patch: Partial<Pick<Profile, 'displayName' | 'ageBand' | 'roles' | 'language' | 'reminderTime'>>,
    ) => {
      await delay();
      setState((s) => {
        if (!s.profile) return {};
        const next = { ...s.profile, ...patch };
        if (s.profile.ageBand && isMinor(s.profile.ageBand) && patch.ageBand && patch.ageBand !== s.profile.ageBand) throw new Error('Contact support to correct your age band.');
        if (patch.ageBand) next.guardianConsent = isMinor(patch.ageBand) ? s.profile.guardianConsent : 'notRequired';
        if (!next.ageBand || (isMinor(next.ageBand) && next.guardianConsent !== 'granted')) {
          return { profile: { ...next, displayName: '', roles: [], reminderTime: null, guardianConsent: 'pending' } };
        }
        return { profile: next };
      });
    },
    [],
  );
}

/**
 * P-04 / T-02: a user under 18 picked an age band. Ask a guardian to consent. Stores ONLY the
 * age band and marks consent `pending`: no name or other data is saved until the guardian agrees.
 * Mock: records the band and `pending`. Real: creates a Guardian record + sends the consent link.
 */
export function useRequestGuardianConsent() {
  return useCallback(async (input: { ageBand: AgeBand; guardianPhone: string }) => {
    await delay();
    phoneWithCountryCode(input.guardianPhone);
    if (!isMinor(input.ageBand)) throw new Error('Choose a minor age band.');
    const previous = getState().profile;
    if (previous?.ageBand && isMinor(previous.ageBand) && previous.ageBand !== input.ageBand) throw new Error('Contact support to correct your age band.');
    clearMockUserData();
    setState(() => {
      if (!previous) return {};
      return {
        session: 'signedIn',
        profile: { ...previous, ageBand: input.ageBand, displayName: '', roles: [], reminderTime: null, guardianConsent: 'pending' },
      };
    });
  }, []);
}

export function useNotificationPrefs(): NotificationPrefs | undefined {
  return useMockState((s) => s.prefs);
}

export function useSetNotificationPref() {
  return useCallback(async (key: keyof NotificationPrefs, value: boolean) => {
    requirePersonalAccess();
    setState((s) => ({ prefs: { ...s.prefs, [key]: value } }));
  }, []);
}

/** P-08 stubs. */
export function useAccountActions() {
  return {
    requestDataExport: async () => {
      requirePersonalAccess();
      await delay();
    },
    deleteAccount: async () => {
      await delay();
      clearMockUserData();
    },
  };
}

export const ROLE_LABELS: Record<Role, string> = {
  sadhaka: 'Sādhaka',
  student: 'Student',
  parent: 'Parent',
  volunteer: 'Volunteer',
  donor: 'Donor',
};

// ───────────────────────────── Wisdom: Guru Vākyam ─────────────────────────────

export function useTodayVakyam(): Vakyam | undefined {
  const day = istDay(useClock());
  return fx.vakyams.find(v => v.date === day) ?? fx.vakyams[0];
}

export function useVakyam(id: string | undefined): Vakyam | null | undefined {
  return useMemo(() => fx.vakyams.find((v) => v.id === id) ?? null, [id]);
}

export function useVakyamThemes() {
  return fx.themeSummaries;
}

export function useVakyamsByTheme(theme: VakyamTheme): Vakyam[] | undefined {
  return useMemo(() => fx.vakyams.filter((v) => v.theme === theme), [theme]);
}

export function useSavedVakyam(id: string) {
  const saved = useMockState((s) => s.savedVakyamIds);
  const isSaved = saved.includes(id);
  const toggle = useCallback(
    () => {
      requirePersonalAccess();
      setState((s) => ({
        savedVakyamIds: s.savedVakyamIds.includes(id)
          ? s.savedVakyamIds.filter((x) => x !== id)
          : [...s.savedVakyamIds, id],
      }));
    },
    [id],
  );
  return { isSaved, toggle };
}

/** W-05 */
export function useReportContent() {
  return useCallback(async (_input: { contentId: string; reason: string }) => {
    await personalDelay();
  }, []);
}

/**
 * W-14: search published Vākyams and episodes. Accepts spelling/transliteration variants.
 * Mock implementation filters fixtures on the client; the backend may use Convex search.
 * Returns empty lists for an empty query.
 */
export function useWisdomSearch(query: string): WisdomSearchResult | undefined {
  return useMemo(() => {
    const q = query.trim();
    if (!q) return { vakyams: [], episodes: [] };
    return {
      vakyams: fx.vakyams.filter((v) =>
        matchesFolded(foldForSearch(`${v.text} ${v.meaning} ${THEME_LABELS[v.theme]} vakyam guru`), q),
      ),
      episodes: fx.episodes
        .filter((e) =>
          matchesFolded(
            foldForSearch(`${e.title} ${e.seasonTitle} ${e.boriRange} ${e.paragraphs.join(' ')} episode mahabharata`),
            q,
          ),
        )
        .map(({ id, seasonId, number, title, readMinutes, seasonTitle, boriRange }) => ({
          id,
          seasonId,
          number,
          title,
          readMinutes,
          seasonTitle,
          boriRange,
        })),
    };
  }, [query]);
}

export function useSmallStep() {
  return fx.smallSteps[0];
}

// ───────────────────────────── Sādhanā ─────────────────────────────

export function usePractices(): (Practice & { locked: boolean })[] | undefined {
  const enrolled = useMockState((s) => s.profile?.enrolled ?? false);
  return useMemo(
    () =>
      fx.practices.map((p) => {
        const locked = p.access === 'enrolled' && !enrolled;
        return { ...p, locked, audioUrl: locked ? undefined : p.audioUrl };
      }),
    [enrolled],
  );
}

export function useTodayPractice(): Practice | undefined {
  return fx.practices[0];
}

export function usePractice(id: string | undefined): (Practice & { locked: boolean }) | null | undefined {
  const list = usePractices();
  return useMemo(() => list?.find((p) => p.id === id) ?? null, [list, id]);
}

/** Active Mandala, or null when none is running (H-03 hides the Home row). */
export function useMandala(): Mandala | null | undefined {
  const mandala = useMockState(s => s.mandala);
  const day = istDay(useClock());
  return useMemo(() => {
    if (!mandala) return null;
    const currentDay = Math.floor((Date.parse(day) - Date.parse(mandala.startDate)) / 86400000) + 1;
    if (currentDay < 1 || currentDay > 40) return null;
    const days = mandala.days.map((d, i) => d === 'sat' ? d : i + 1 < currentDay ? 'missed' : i + 1 === currentDay ? 'today' : 'future') as Mandala['days'];
    let streak = 0;
    let i = days[currentDay - 1] === 'sat' ? currentDay - 1 : currentDay - 2;
    for (; i >= 0 && days[i] === 'sat'; i--) streak++;
    return { ...mandala, currentDay, days, streak, todayComplete: days[currentDay - 1] === 'sat' };
  }, [mandala, day]);
}

export function useGroupCount(): GroupCount | undefined {
  const todayCount = useMockState((s) => s.groupTodayCount);
  const cycleSittings = useMockState((s) => s.groupCycleSittings);
  return useMemo(() => ({ todayCount, cycleSittings }), [todayCount, cycleSittings]);
}

/** S-09 / T-05: idempotent — completing twice records once. */
export function useCompleteMandalaDay() {
  return useCallback(async () => {
    await personalDelay();
    setState((s) => {
      const base = s.mandala;
      const currentDay = base ? Math.floor((Date.parse(istDay(Date.now())) - Date.parse(base.startDate)) / 86400000) + 1 : 0;
      const m = base && currentDay >= 1 && currentDay <= 40 ? { ...base, currentDay, todayComplete: base.days[currentDay - 1] === 'sat' } : null;
      if (!m || m.todayComplete) return {};
      const days = m.days.slice();
      days[m.currentDay - 1] = 'sat';
      return {
        mandala: { ...m, days, daysSat: m.daysSat + 1, streak: m.streak + 1, todayComplete: true },
        groupTodayCount: s.groupTodayCount + 1,
        groupCycleSittings: s.groupCycleSittings + 1,
      };
    });
  }, []);
}

/** S-08 */
export function useStartMandala() {
  return useCallback(async (practiceId: string) => {
    await personalDelay();
    const p = fx.practices.find((x) => x.id === practiceId) ?? fx.practices[0];
    const days = Array.from({ length: 40 }, (_, i) => (i === 0 ? 'today' : 'future')) as Mandala['days'];
    setState(() => ({
      mandala: {
        id: `mandala-${Date.now()}`,
        practiceId: p.id,
        practiceTitle: p.title,
        startDate: istDay(Date.now()),
        currentDay: 1,
        days,
        daysSat: 0,
        streak: 0,
        todayComplete: false,
      },
    }));
  }, []);
}

// ───────────────────────────── Itihāsa (Mahabharata) ─────────────────────────────

export function useSeasons(): Season[] | undefined {
  return fx.seasons;
}

export function useSeasonEpisodes(seasonId: string) {
  return useMemo(() => fx.episodes.filter((e) => e.seasonId === seasonId), [seasonId]);
}

export function useEpisode(id: string | undefined): Episode | null | undefined {
  return useMemo(() => fx.episodes.find((e) => e.id === id) ?? null, [id]);
}

/** H-07: resume card. null when nothing unfinished. */
export function useContinueReading(): ReadingProgress | null | undefined {
  const lastId = useMockState((s) => s.lastEpisodeId);
  const positions = useMockState((s) => s.readingPositions);
  return useMemo(() => {
    if (!lastId) return null;
    const e = fx.episodes.find((x) => x.id === lastId);
    const season = fx.seasons.find((x) => x.id === e?.seasonId);
    if (!e || !season) return null;
    const progress = positions[lastId] ?? 0;
    if (progress >= 1) return null;
    return {
      episode: {
        id: e.id,
        seasonId: e.seasonId,
        number: e.number,
        title: e.title,
        readMinutes: e.readMinutes,
        seasonTitle: season.title,
        seasonDevanagari: season.devanagari,
        seasonRoman: season.roman,
      },
      progress,
      minutesLeft: Math.max(1, Math.round(e.readMinutes * (1 - progress))),
    };
  }, [lastId, positions]);
}

/**
 * W-08: furthest saved read position for one episode, 0..1 (0 = never opened).
 * `undefined` while loading (live backend) — callers must wait for a number before restoring.
 */
export function useReadingPosition(episodeId: string | undefined): number | undefined {
  return useMockState((s) => (episodeId ? (s.readingPositions[episodeId] ?? 0) : 0));
}

/** W-08 */
export function useSaveReadingPosition() {
  return useCallback(async (episodeId: string, progress: number) => {
    const s = getState();
    if (!canUsePersonalFeatures(s.session, s.profile)) return;
    setState((s) => ({
      lastEpisodeId: episodeId,
      readingPositions: { ...s.readingPositions, [episodeId]: Math.max(s.readingPositions[episodeId] ?? 0, progress) },
    }));
  }, []);
}

// ───────────────────────────── Sangha: events, vibhagas, paramparā ─────────────────────────────

export function useEvents(limit?: number): EventItem[] | undefined {
  const now = useClock();
  const registered = useMockState((s) => s.registeredEventIds);
  return useMemo(() => {
    const list = fx.events
      .filter(e => Date.parse(e.startsAt) > now)
      .map((e) => ({ ...e, registered: registered.includes(e.id) }))
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    return limit ? list.slice(0, limit) : list;
  }, [registered, limit, now]);
}

/** T-12. Requires sign-in: callers route guests to Welcome first. */
export function useRegisterForEvent() {
  return useCallback(async (eventId: string, register = true) => {
    requirePersonalAccess();
    if (register && !fx.events.some(e => e.id === eventId && Date.parse(e.startsAt) > Date.now())) throw new Error('This event has ended.');
    await personalDelay();
    setState((s) => ({
      registeredEventIds: register
        ? Array.from(new Set([...s.registeredEventIds, eventId]))
        : s.registeredEventIds.filter((x) => x !== eventId),
    }));
  }, []);
}

export function useVibhagas() {
  return fx.vibhagas;
}

export function usePathways() {
  return fx.pathways;
}

/** null = unknown id. */
export function useVibhaga(id: string | undefined) {
  return useMemo(() => fx.vibhagas.find((v) => v.id === id) ?? null, [id]);
}

/** null = unknown id. */
export function usePathway(id: string | undefined) {
  return useMemo(() => fx.pathways.find((p) => p.id === id) ?? null, [id]);
}

/** G-06: resolves when the sign-up is stored. Callers must have collected explicit consent. */
export function useVolunteerSignup() {
  return useCallback(async (input: VolunteerSignup) => {
    requirePersonalAccess();
    if (!input.consent) throw new Error('Consent is required');
    await personalDelay(600);
  }, []);
}

/** Official contact for the About sheet. */
export function useContactInfo() {
  return fx.contact;
}

export function useParampara() {
  return fx.parampara;
}

// ───────────────────────────── Dāna (UPI) ─────────────────────────────

export function useDonationOptions() {
  return { purposes: fx.donationPurposes, presets: fx.donationPresets, currency: 'INR' as const };
}

/** G-07: mock resolves success after a short delay. Real: UPI intent via payment provider. */
export function useCreateDonation() {
  return useCallback(async (input: { amount: number; purposeId: string }): Promise<DonationResult> => {
    await personalDelay(900);
    const purpose = fx.donationPurposes.find((p) => p.id === input.purposeId);
    const result: DonationResult = {
      id: `don-${Date.now()}`,
      status: 'success',
      amount: input.amount,
      purposeName: purpose?.name ?? '',
      receiptRef: `MGF-${Math.floor(Math.random() * 1e6)}`,
    };
    setState((s) => ({ donations: [result, ...s.donations] }));
    return result;
  }, []);
}

export const externalLinks = fx.links;

export function usePracticeAudio() {
  return useCallback(async (id: string) => { requirePersonalAccess(); return fx.practices.find(p => p.id === id)?.audioUrl ?? null; }, []);
}
export function useExternalLinks() { return fx.links; }
export function useOpenWhatsApp() { return useCallback(async () => { await Linking.openURL(fx.links.whatsapp); }, []); }

export function useCurrentTime() { return useClock(); }

export function useDonationResult(id: string | undefined) { return useMockState(s => s.donations.find(d => d.id === id) ?? null); }

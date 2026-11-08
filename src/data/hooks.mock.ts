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
import { mandalaRule } from '../../convex/lib/logic';

import * as fx from './fixtures';
import { mockAccountKey, readMockV14, persistMockV14, eraseMockV14 } from './mockV14Persistence';
import { groupVakyams, gunaResultFromAnswers } from './v14';
import { useGuestYakshaAnswers, saveGuestYakshaAnswer } from './yakshaDeviceStore';
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
import { semanticScore } from './search';
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
    const generation = getMockSessionGeneration();
    await delay();
    if (!/^\d{6}$/.test(code)) return false;
    const phone = getState().pendingPhone ?? '+910000000210';
    const last3 = phone.slice(-3);
    const savedV14 = await readMockV14(phone);
    if (generation !== getMockSessionGeneration()) return false;
    setState((s) => ({
      ...savedV14, accountStorageKey: mockAccountKey(phone),
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
          return { gunaResult: null, gunaPrompt: 'unseen', practiceUnlocks: { dhyanbhaari: false }, seriesAccess: [], yakshaAnswers: {}, profile: { ...next, displayName: '', roles: [], reminderTime: null, guardianConsent: 'pending' } };
        }
        return { profile: next };
      });
      if (!canUsePersonalFeatures(getState().session, getState().profile)) await eraseMockV14();
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
    await eraseMockV14();
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
      await eraseMockV14();
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
        semanticScore(`${v.text} ${v.meaning} ${THEME_LABELS[v.theme]} vakyam mahamuni`, q) > 0,
      ).sort((a, b) => semanticScore(`${b.text} ${b.meaning}`, q) - semanticScore(`${a.text} ${a.meaning}`, q)),
      episodes: fx.episodes
        .filter((e) =>
          semanticScore(`${e.title} ${e.seasonTitle} ${e.boriRange} ${e.paragraphs.join(' ')} episode mahabharata`, q) > 0,
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
  const enrolled = useMockState((s) => s.practiceUnlocks.dhyanbhaari);
  return useMemo(
    () =>
      fx.practices.map((p) => {
        const locked = p.access === 'enrolled' && !enrolled;
        return { ...p, locked, description: locked ? '' : p.description, preparation: locked ? [] : p.preparation, audioUrl: locked ? undefined : p.audioUrl };
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

/** Preserve the old grid as audit history; count sittings across all calendar dates. */
function mockCompletionDays(mandala: Mandala, audit: readonly string[]) {
  const historical = mandala.days.flatMap((state, index) => state === 'sat'
    ? [new Date(Date.parse(mandala.startDate) + index * 86400000).toISOString().slice(0, 10)] : []);
  return [...new Set([...historical, ...audit])].sort();
}

export function useMandala(): Mandala | null | undefined {
  const mandala = useMockState(s => s.mandala);
  const audit = useMockState(s => s.mandalaCompletionDays);
  const day = istDay(useClock());
  return useMemo(() => {
    if (!mandala) return null;
    const dates = mockCompletionDays(mandala, audit);
    const rule = mandalaRule(mandala.startDate, day, dates);
    const elapsed = Math.floor((Date.parse(day) - Date.parse(mandala.startDate)) / 86400000) + 1;
    const days = mandala.days.map((state, i) => state === 'sat' ? state : i + 1 < elapsed ? 'missed' : i + 1 === elapsed ? 'today' : 'future') as Mandala['days'];
    return { ...mandala, currentDay: Math.min(40, Math.max(1, elapsed)), days, daysSat: rule.sittingsDone,
      sittingsDone: rule.sittingsDone, lastSittingAt: dates.filter(date => date <= day).at(-1) ?? null,
      todayComplete: rule.todayComplete };
  }, [mandala, audit, day]);
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
      if (!base) throw new Error('No active Mandala was found.');
      const day = istDay(Date.now());
      const dates = mockCompletionDays(base, s.mandalaCompletionDays);
      const rule = mandalaRule(base.startDate, day, dates, s.lastCountedSittingDay === day);
      if (rule.decision === 'existing') return {};
      if (rule.decision === 'dailyLimit') throw new Error('Only one sitting can count per IST day.');
      if (rule.decision !== 'insert') throw new Error('This Mandala has no sittings remaining.');
      const elapsed = Math.floor((Date.parse(day) - Date.parse(base.startDate)) / 86400000);
      const days = base.days.slice();
      if (elapsed < 40) days[elapsed] = 'sat';
      return {
        mandala: { ...base, days, daysSat: rule.sittingsDone + 1, sittingsDone: rule.sittingsDone + 1, lastSittingAt: day, todayComplete: true },
        mandalaCompletionDays: [...s.mandalaCompletionDays, day],
        lastCountedSittingDay: day,
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
    if (p.access === 'enrolled' && !getState().practiceUnlocks.dhyanbhaari) throw new Error('Attend the Dhyanbhaari class first.');
    const days = Array.from({ length: 40 }, (_, i) => (i === 0 ? 'today' : 'future')) as Mandala['days'];
    const previous = getState();
    if (previous.mandala && !mandalaRule(previous.mandala.startDate, istDay(Date.now()), mockCompletionDays(previous.mandala, previous.mandalaCompletionDays)).complete) {
      if (previous.mandala.practiceId !== p.id) throw new Error('Finish your active Mandala before starting another.');
      return;
    }
    setState(() => ({
      mandalaCompletionDays: [],
      mandala: {
        id: `mandala-${Date.now()}`,
        practiceId: p.id,
        practiceTitle: p.title,
        startDate: istDay(Date.now()),
        currentDay: 1,
        days,
        sittingsDone: 0,
        lastSittingAt: null,
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

export const externalLinks = { ...fx.links, saptagita: 'saptagita://' };

export function usePracticeAudio() {
  return useCallback(async (id: string) => { requirePersonalAccess(); const p = fx.practices.find(p => p.id === id); if (p?.access === 'enrolled' && !getState().practiceUnlocks.dhyanbhaari) throw new Error('Attend the Dhyanbhaari class first.'); return p?.audioUrl ?? null; }, []);
}
export function useExternalLinks(): import('./types').ExternalLinks { return externalLinks; }
export function useOpenWhatsApp() { return useCallback(async () => { await Linking.openURL(fx.links.whatsapp); }, []); }

export function useCurrentTime() { return useClock(); }

export function useDonationResult(id: string | undefined) { return useMockState(s => s.donations.find(d => d.id === id) ?? null); }

// ───────────────────────────── v14 foundation ─────────────────────────────
export function useTodayYaksha(): import('./types').TodayYaksha | null | undefined {
  const dayKey = istDay(useClock());
  const session = useMockState(s => s.session);
  const answers = useMockState(s => s.yakshaAnswers);
  const guestAnswers = useGuestYakshaAnswers();
  return useMemo(() => {
    const candidates = fx.yakshaQuestions.filter(q => q.approved);
    // The single, explicitly unapproved demo is visible with review copy.
    const item = candidates[Number(dayKey.replaceAll('-', '')) % candidates.length] ?? fx.yakshaQuestions[0];
    if (!item) return null;
    const state = (session === 'signedIn' ? answers : guestAnswers)[dayKey];
    return { question: { ...item, dayKey }, state: state?.questionId === item.id ? state : { questionId: item.id, choice: null, revealed: false, correct: null } };
  }, [dayKey, session, answers, guestAnswers]);
}
export function useAnswerYaksha() {
  return useCallback(async (choice: string | null) => {
    const day = istDay(Date.now());
    const approved = fx.yakshaQuestions.filter(q => q.approved);
    const q = approved[Number(day.replaceAll('-', '')) % approved.length] ?? fx.yakshaQuestions[0];
    if (!q) throw new Error('No question today.');
    if (choice !== null && ![q.answer, ...q.distractors].includes(choice)) throw new Error('Choose one of today’s answers.');
    const value = { questionId: q.id, choice, revealed: true, correct: choice === null ? null : choice === q.answer };
    const s = getState();
    if (s.session === 'signedIn') { requirePersonalAccess(); setState(s => ({ yakshaAnswers: { ...s.yakshaAnswers, [day]: s.yakshaAnswers[day] ?? value } })); await persistMockV14(); }
    else { await saveGuestYakshaAnswer(day, value); }
  }, []);
}
export function useGunaResult(): import('./types').GunaResult | null | undefined {
  const result = useMockState(s => s.gunaResult); const session = useSession();
  return session.canUsePersonalFeatures ? result : null;
}
export function useSaveGunaResult() {
  return useCallback(async (input: import('./types').GunaResult) => {
    requirePersonalAccess();
    const result = gunaResultFromAnswers(input.answers, Date.now());
    setState(() => ({ gunaResult: result, gunaPrompt: 'done' }));
    await persistMockV14();
  }, []);
}
export function useGunaPrompt(): import('./types').GunaPrompt | undefined {
  const stored = useMockState(s => s.gunaPrompt);
  const { canUsePersonalFeatures: allowed } = useSession();
  const state = allowed ? stored : 'unseen';
  const setPrompt = useCallback(async (state: import('./types').GunaPromptState) => { requirePersonalAccess(); setState(() => ({ gunaPrompt: state })); await persistMockV14(); }, []);
  return useMemo(() => ({ state, setState: setPrompt, markLater: () => setPrompt('later'), markDone: () => setPrompt('done') }), [state, setPrompt]);
}
export function useSeries(): import('./types').Series[] | undefined { return fx.series; }
export function useSeriesById(id: string | undefined): import('./types').Series | null | undefined { return useMemo(() => fx.series.find(s => s.id === id) ?? null, [id]); }
export function useSeriesAccess(seriesId: string): boolean | undefined {
  const ids = useMockState(s => s.seriesAccess); const session = useSession();
  return session.canUsePersonalFeatures && ids.includes(seriesId);
}
export function usePracticeUnlocks(): import('./types').PracticeUnlocks | undefined { return useMockState(s => s.practiceUnlocks); }
/** Dev-only mock switch; live implementation always rejects. Never grants production access. */
export function useSetMockPracticeUnlock() {
  return useCallback(async (unlocked: boolean) => { requirePersonalAccess(); setState(() => ({ practiceUnlocks: { dhyanbhaari: unlocked } })); await persistMockV14(); }, []);
}
export function useVakyamCatalogue(theme?: VakyamTheme): import('./types').VakyamMonth[] | undefined {
  return useMemo(() => groupVakyams(fx.vakyams.filter(v => !theme || v.theme === theme)), [theme]);
}

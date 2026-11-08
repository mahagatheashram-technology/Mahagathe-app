/** Live implementation of the screen data contract. Never imports mock fixtures. */
import { useConvex, useMutation, useQuery } from 'convex/react';
import { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import { Linking, Platform, Share } from 'react-native';

import type { Id } from '../../convex/_generated/dataModel';
import { useGuestYakshaAnswers, saveGuestYakshaAnswer } from './yakshaDeviceStore';
import { api } from '../../convex/_generated/api';
import { useLiveSession } from '../providers/LiveSessionProvider';
import { useClock } from './clock';
import { phoneWithCountryCode } from './phone';
import type { Profile, VakyamTheme, VolunteerSignup } from './types';

export const useSession = useLiveSession;
export function useProfile() { return useLiveSession().profile; }
export function useUpdateProfile() {
  const update = useMutation(api.profiles.updateProfile);
  return useCallback(async (patch: Partial<Pick<Profile, 'displayName' | 'ageBand' | 'roles' | 'language' | 'reminderTime'>>) => { await update({ patch }); }, [update]);
}
export function useRequestGuardianConsent() {
  const request = useMutation(api.profiles.requestGuardianConsent);
  return useCallback(async (input: Parameters<typeof request>[0]) => { await request({ ...input, guardianPhone: phoneWithCountryCode(input.guardianPhone) }); }, [request]);
}
export function useNotificationPrefs() {
  const { canUsePersonalFeatures: allowed } = useSession();
  const prefs = useQuery(api.profiles.notificationPrefs, allowed ? {} : 'skip');
  return allowed ? prefs : undefined;
}
export function useSetNotificationPref() {
  const update = useMutation(api.profiles.setNotificationPref);
  return useCallback(async (key: 'practiceReminder' | 'dailyVakyam' | 'registeredEvents', value: boolean) => { await update({ key, value }); }, [update]);
}
export function useAccountActions() {
  const client = useConvex();
  const remove = useMutation(api.profiles.deleteAccount);
  const { signOut } = useSession();
  return {
    requestDataExport: async () => {
      const result = await client.query(api.profiles.requestDataExport, {});
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(new Blob([result.json], { type: 'application/json' }));
        const anchor = document.createElement('a');
        anchor.href = url; anchor.download = result.filename; anchor.click();
        URL.revokeObjectURL(url);
      } else await Share.share({ title: result.filename, message: result.json });
    },
    deleteAccount: async () => { await remove({}); await signOut(); },
  };
}
export function useTodayVakyam() { return useQuery(api.wisdom.today, {}); }
export function useVakyam(id: string | undefined) { const result = useQuery(api.wisdom.byId, id ? { id } : 'skip'); return id ? result : null; }
export function useVakyamThemes() { return useQuery(api.wisdom.themes, {}); }
export function useVakyamsByTheme(theme: VakyamTheme) { return useQuery(api.wisdom.byTheme, { theme }); }
export function useSavedVakyam(id: string) {
  const { canUsePersonalFeatures: allowed } = useSession();
  const saved = useQuery(api.wisdom.isSaved, allowed && id ? { id } : 'skip');
  const toggleSaved = useMutation(api.wisdom.toggleSaved);
  const toggle = useCallback(async () => { if (!allowed) throw new Error('Finish account setup first.'); await toggleSaved({ id }); }, [allowed, toggleSaved, id]);
  return { isSaved: saved ?? false, toggle };
}
export function useReportContent() {
  const report = useMutation(api.wisdom.report);
  return useCallback(async (input: { contentId: string; reason: string }) => { await report(input); }, [report]);
}
export function useWisdomSearch(query: string): import('./types').WisdomSearchResult | undefined {
  const client = useConvex();
  const exact = useQuery(api.wisdom.search, { text: query });
  const [semantic, setSemantic] = useState<{ query: string; result: import('./types').WisdomSearchResult } | null>(null);
  useEffect(() => {
    let active = true;
    if (!query.trim()) return;
    const timer = setTimeout(() => { void client.action(api.embeddings.search, { text: query }).then(result => { if (active) setSemantic({ query, result }); }).catch(() => { /* Reactive text result stays available. */ }); }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [client, query, exact]);
  return semantic?.query === query ? semantic.result : exact;
}
export function useSmallStep() { return useQuery(api.wisdom.smallStep, {}); }
export function usePractices() { return useQuery(api.sadhana.practices, {}); }
export function useTodayPractice() { return useQuery(api.sadhana.todayPractice, {}); }
export function usePractice(id: string | undefined) { const result = useQuery(api.sadhana.practice, id ? { id } : 'skip'); return id ? result : null; }
/** Fetch on an explicit play action: storage URLs never enter catalogue subscriptions. */
export function usePracticeAudio() {
  const request = useMutation(api.sadhana.getPracticeAudioUrl);
  return useCallback((id: string) => request({ id }), [request]);
}
export function useMandala() {
  const { canUsePersonalFeatures: allowed } = useSession();
  const value = useQuery(api.mandala.active, allowed ? {} : 'skip');
  return useMemo(() => !allowed ? null : value == null ? value : ({ ...value, sittingsDone: value.sittingsDone, lastSittingAt: value.lastSittingAt }), [allowed, value]);
}
export function useGroupCount() { return useQuery(api.mandala.groupCount, {}); }
export function useCompleteMandalaDay() {
  const complete = useMutation(api.mandala.completeToday);
  return useCallback(async () => { await complete({}); }, [complete]);
}
export function useStartMandala() {
  const start = useMutation(api.mandala.start);
  return useCallback(async (practiceId: string) => { await start({ practiceId, rulesAccepted: true }); }, [start]);
}
export function useSeasons() { return useQuery(api.itihasa.seasons, {}); }
export function useSeasonEpisodes(seasonId: string) { return useQuery(api.itihasa.seasonEpisodes, { seasonId }); }
export function useEpisode(id: string | undefined) { return useQuery(api.itihasa.episode, id ? { id } : 'skip'); }
export function useContinueReading() {
  const { canUsePersonalFeatures: allowed } = useSession();
  const value = useQuery(api.itihasa.continueReading, allowed ? {} : 'skip');
  return allowed ? value : null;
}
export function useReadingPosition(episodeId: string | undefined) {
  const { canUsePersonalFeatures: allowed } = useSession();
  const value = useQuery(api.itihasa.readingPosition, allowed && episodeId ? { episodeId } : 'skip');
  return allowed ? value : 0;
}
export function useSaveReadingPosition() {
  const save = useMutation(api.itihasa.saveReadingPosition);
  const { canUsePersonalFeatures: allowed } = useSession();
  return useCallback(async (episodeId: string, progress: number) => { if (allowed) await save({ episodeId, progress }); }, [save, allowed]);
}
export function useEvents(limit?: number) { return useQuery(api.sangha.events, { limit }); }
export function useRegisterForEvent() {
  const register = useMutation(api.sangha.register);
  const unregister = useMutation(api.sangha.unregister);
  return useCallback(async (eventId: string, going = true) => { await (going ? register : unregister)({ eventId }); }, [register, unregister]);
}
export function useVibhagas() { return useQuery(api.sangha.vibhagas, {}); }
export function usePathways() { return useQuery(api.sangha.pathways, {}); }
export function useVibhaga(id: string | undefined) { return useQuery(api.sangha.vibhaga, id ? { id } : 'skip'); }
export function usePathway(id: string | undefined) { return useQuery(api.sangha.pathway, id ? { id } : 'skip'); }
export function useVolunteerSignup() {
  const apply = useMutation(api.sangha.volunteerApply);
  return useCallback(async (input: VolunteerSignup) => { await apply({ ...input, phone: phoneWithCountryCode(input.phone), message: '', consentVersion: 'volunteer-v1' }); }, [apply]);
}
export function useContactInfo() { return useQuery(api.sangha.contactInfo, {}); }
export function useParampara() { return useQuery(api.sangha.parampara, {}); }
export function useDonationOptions() { return useQuery(api.dana.purposes, {}); }
export function useCreateDonation() {
  const create = useMutation(api.dana.createDonation);
  const attempt = useRef<{ key: string; id: string } | null>(null);
  return useCallback(async (input: { amount: number; purposeId: string }) => {
    const key = JSON.stringify(input);
    if (!attempt.current || attempt.current.key !== key) attempt.current = { key, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
    const result = await create({ ...input, clientRequestId: attempt.current.id });
    if (result.status !== 'pending') attempt.current = null;
    return result;
  }, [create]);
}
export function useExternalLinks(): import('./types').ExternalLinks | null | undefined {
  const links = useQuery(api.wisdom.externalLinks, {});
  // The sibling app declares this scheme; published links may add a chapter deep link later.
  return useMemo(() => links ? { ...links, saptagita: 'saptagita://' } : links, [links]);
}
export function useOpenWhatsApp() {
  const links = useExternalLinks();
  return useMemo(() => async () => { if (links?.whatsapp) await Linking.openURL(links.whatsapp); }, [links]);
}

export function useCurrentTime() { return useClock(); }

export function useDonationResult(id: string | undefined) {
  const { canUsePersonalFeatures: allowed } = useSession();
  return useQuery(api.dana.donation, allowed && id ? { id: id as Id<'donations'> } : 'skip');
}

// v14 contract. Guests keep the daily answer on this device; account state is server-owned.
export function useTodayYaksha(): import('./types').TodayYaksha | null | undefined {
  const result = useQuery(api.v14.todayYaksha, {});
  const { isSignedIn } = useSession();
  const guest = useGuestYakshaAnswers();
  return useMemo(() => !result ? result : ({ question: { ...result.question, distractors: result.question.distractors as [string, string] }, state: !isSignedIn && guest[result.question.dayKey]?.questionId === result.question.id ? guest[result.question.dayKey] : result.state }), [result, isSignedIn, guest]);
}
export function useAnswerYaksha() {
  const save = useMutation(api.v14.answerYaksha); const today = useTodayYaksha(); const { isSignedIn } = useSession();
  return useCallback(async (choice: string | null) => {
    if (isSignedIn) { await save({ choice }); return; }
    if (!today) throw new Error('No question today.');
    const q = today.question;
    if (choice !== null && ![q.answer, ...q.distractors].includes(choice)) throw new Error('Choose one of today’s answers.');
    await saveGuestYakshaAnswer(q.dayKey, { questionId: q.id, choice, revealed: true, correct: choice === null ? null : choice === q.answer });
  }, [save, today, isSignedIn]);
}
export function useGunaResult() {
  const { canUsePersonalFeatures: allowed } = useSession(); const result = useQuery(api.v14.gunaResult, allowed ? {} : 'skip'); return allowed ? result : null;
}
export function useSaveGunaResult() {
  const save = useMutation(api.v14.saveGunaResult); return useCallback(async (result: import('./types').GunaResult) => { await save({ result }); }, [save]);
}
export function useGunaPrompt(): import('./types').GunaPrompt | undefined {
  const { canUsePersonalFeatures: allowed } = useSession();
  const state = useQuery(api.v14.gunaPrompt, allowed ? {} : 'skip'); const save = useMutation(api.v14.setGunaPrompt);
  const setState = useCallback(async (state: import('./types').GunaPromptState) => { await save({ state }); }, [save]);
  return useMemo(() => allowed && state === undefined ? undefined : { state: state ?? 'unseen', setState, markLater: () => setState('later'), markDone: () => setState('done') }, [allowed, state, setState]);
}
export function useSeries() { return useQuery(api.v14.series, {}); }
export function useSeriesById(id: string | undefined) { const result = useQuery(api.v14.seriesById, id ? { id } : 'skip'); return id ? result : null; }
export function useSeriesAccess(seriesId: string) {
  const { canUsePersonalFeatures: allowed } = useSession(); const result = useQuery(api.v14.seriesAccess, allowed ? { seriesId } : 'skip'); return allowed ? result : false;
}
export function usePracticeUnlocks() { return useQuery(api.v14.practiceUnlocks, {}); }
export function useSetMockPracticeUnlock() { return useCallback(async (_unlocked: boolean) => { throw new Error('Practice unlock toggles are available only in mock mode.'); }, []); }
export function useVakyamCatalogue(theme?: VakyamTheme) { return useQuery(api.wisdom.catalogue, { theme }); }

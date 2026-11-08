/* eslint-disable @typescript-eslint/no-require-imports -- avoid evaluating auth SDKs in zero-key mode */
/** Backend selection is fixed for the bundle; hooks never switch at runtime. */
import { isLiveBackend } from './backend';
import * as mock from './hooks.mock';
export { ROLE_LABELS, externalLinks } from './hooks.mock';

const live = isLiveBackend ? require('./hooks.live') as typeof import('./hooks.live') : null;

export const useSession = live?.useSession ?? mock.useSession;
export const useProfile = live?.useProfile ?? mock.useProfile;
export const useUpdateProfile = live?.useUpdateProfile ?? mock.useUpdateProfile;
export const useRequestGuardianConsent = live?.useRequestGuardianConsent ?? mock.useRequestGuardianConsent;
export const useNotificationPrefs = live?.useNotificationPrefs ?? mock.useNotificationPrefs;
export const useSetNotificationPref = live?.useSetNotificationPref ?? mock.useSetNotificationPref;
export const useAccountActions = live?.useAccountActions ?? mock.useAccountActions;
export const useTodayVakyam = live?.useTodayVakyam ?? mock.useTodayVakyam;
export const useVakyam = live?.useVakyam ?? mock.useVakyam;
export const useVakyamThemes = live?.useVakyamThemes ?? mock.useVakyamThemes;
export const useVakyamsByTheme = live?.useVakyamsByTheme ?? mock.useVakyamsByTheme;
export const useSavedVakyam = live?.useSavedVakyam ?? mock.useSavedVakyam;
export const useReportContent = live?.useReportContent ?? mock.useReportContent;
export const useWisdomSearch = live?.useWisdomSearch ?? mock.useWisdomSearch;
export const useSmallStep = live?.useSmallStep ?? mock.useSmallStep;
export const usePractices = live?.usePractices ?? mock.usePractices;
export const useTodayPractice = live?.useTodayPractice ?? mock.useTodayPractice;
export const usePractice = live?.usePractice ?? mock.usePractice;
export const useMandala = live?.useMandala ?? mock.useMandala;
export const useGroupCount = live?.useGroupCount ?? mock.useGroupCount;
export const useCompleteMandalaDay = live?.useCompleteMandalaDay ?? mock.useCompleteMandalaDay;
export const useStartMandala = live?.useStartMandala ?? mock.useStartMandala;
export const useSeasons = live?.useSeasons ?? mock.useSeasons;
export const useSeasonEpisodes = live?.useSeasonEpisodes ?? mock.useSeasonEpisodes;
export const useEpisode = live?.useEpisode ?? mock.useEpisode;
export const useContinueReading = live?.useContinueReading ?? mock.useContinueReading;
export const useReadingPosition = live?.useReadingPosition ?? mock.useReadingPosition;
export const useSaveReadingPosition = live?.useSaveReadingPosition ?? mock.useSaveReadingPosition;
export const useEvents = live?.useEvents ?? mock.useEvents;
export const useRegisterForEvent = live?.useRegisterForEvent ?? mock.useRegisterForEvent;
export const useVibhagas = live?.useVibhagas ?? mock.useVibhagas;
export const usePathways = live?.usePathways ?? mock.usePathways;
export const useVibhaga = live?.useVibhaga ?? mock.useVibhaga;
export const usePathway = live?.usePathway ?? mock.usePathway;
export const useVolunteerSignup = live?.useVolunteerSignup ?? mock.useVolunteerSignup;
export const useContactInfo = live?.useContactInfo ?? mock.useContactInfo;
export const useParampara = live?.useParampara ?? mock.useParampara;
export const useDonationOptions = live?.useDonationOptions ?? mock.useDonationOptions;
export const useCreateDonation = live?.useCreateDonation ?? mock.useCreateDonation;
export const usePracticeAudio = live?.usePracticeAudio ?? mock.usePracticeAudio;
export const useExternalLinks = live?.useExternalLinks ?? mock.useExternalLinks;
export const useOpenWhatsApp = live?.useOpenWhatsApp ?? mock.useOpenWhatsApp;

export const useCurrentTime = live?.useCurrentTime ?? mock.useCurrentTime;

export const useDonationResult = live?.useDonationResult ?? mock.useDonationResult;

export const useTodayYaksha = live?.useTodayYaksha ?? mock.useTodayYaksha;
export const useAnswerYaksha = live?.useAnswerYaksha ?? mock.useAnswerYaksha;
export const useGunaResult = live?.useGunaResult ?? mock.useGunaResult;
export const useSaveGunaResult = live?.useSaveGunaResult ?? mock.useSaveGunaResult;
export const useGunaPrompt = live?.useGunaPrompt ?? mock.useGunaPrompt;
export const useSeries = live?.useSeries ?? mock.useSeries;
export const useSeriesById = live?.useSeriesById ?? mock.useSeriesById;
export const useSeriesAccess = live?.useSeriesAccess ?? mock.useSeriesAccess;
export const usePracticeUnlocks = live?.usePracticeUnlocks ?? mock.usePracticeUnlocks;
export const useSetMockPracticeUnlock = live?.useSetMockPracticeUnlock ?? mock.useSetMockPracticeUnlock;
export const useVakyamCatalogue = live?.useVakyamCatalogue ?? mock.useVakyamCatalogue;
export const useSeriesNotification = live?.useSeriesNotification ?? mock.useSeriesNotification;

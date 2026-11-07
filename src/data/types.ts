/**
 * Domain types: the contract between screens (src/app, src/features) and the data layer.
 * Shapes follow PRD v0.3 "Data entities and permissions" plus what the v3 mocks display.
 * Changing a type here is a cross-team change: call it out in your PR.
 */

export type Id = string;

export type AgeBand = 'under13' | '13-17' | '18-24' | '25-44' | '45-64' | '65plus' | 'unspecified';
export const AGE_BANDS: { value: AgeBand; label: string }[] = [
  { value: 'under13', label: 'Under 13' },
  { value: '13-17', label: '13–17' },
  { value: '18-24', label: '18–24' },
  { value: '25-44', label: '25–44' },
  { value: '45-64', label: '45–64' },
  { value: '65plus', label: '65+' },
  { value: 'unspecified', label: 'Prefer not to say' },
];
export const isMinor = (b: AgeBand) => b === 'under13' || b === '13-17';

export type Role = 'sadhaka' | 'student' | 'parent' | 'volunteer' | 'donor';
export type Language = 'en' | 'te' | 'hi';

export type SessionStatus = 'loading' | 'signedOut' | 'guest' | 'signedIn';

/** Authentication and consent are separate permissions in both backends. */
export type Session = {
  status: SessionStatus;
  isSignedIn: boolean;
  canUsePersonalFeatures: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (code: string) => Promise<boolean>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
};

export type Profile = {
  id: Id;
  displayName: string;
  phoneMasked: string; // "+91 ••••• ••210"
  ageBand: AgeBand | null;
  roles: Role[];
  language: Language;
  reminderTime: string | null; // "06:00" local
  /** P-04: minors need guardian consent before any data is stored. */
  guardianConsent: 'notRequired' | 'pending' | 'granted';
  enrolled: boolean; // Samatha / Dhyānbāri enrollment (server-checked, S-04)
};

export type NotificationPrefs = {
  practiceReminder: boolean;
  dailyVakyam: boolean;
  registeredEvents: boolean;
};

export type VakyamTheme = 'inner-life' | 'work' | 'family' | 'conduct';
export const THEME_LABELS: Record<VakyamTheme, string> = {
  'inner-life': 'Inner life',
  work: 'Work',
  family: 'Family',
  conduct: 'Conduct',
};

export type Vakyam = {
  id: Id;
  text: string;
  meaning: string; // "In simple words"
  theme: VakyamTheme;
  verbatim: boolean; // false = paraphrase (W-03, C-4)
  attribution: string; // shown only when source verified
  source: { title: string; detail: string };
  date: string; // ISO date it is the "Vākyam of the day"
};

export type ThemeSummary = { theme: VakyamTheme; label: string; count: number };

export type PracticeAccess = 'free' | 'enrolled';
export type Practice = {
  id: Id;
  title: string;
  subtitle: string; // "Preparation · guide and audio"
  description: string;
  durationSec: number;
  access: PracticeAccess;
  /** Undefined for restricted practices when the user is not enrolled (T-04: never expose URL). */
  audioUrl?: string;
  preparation: string[];
  order: number;
};

export type MandalaDayState = 'sat' | 'missed' | 'today' | 'future';
export type Mandala = {
  id: Id;
  practiceId: Id;
  practiceTitle: string;
  startDate: string; // ISO
  currentDay: number; // 1..40
  days: MandalaDayState[]; // length 40
  /** Completed sittings, independent of elapsed calendar days (0–40). */
  sittingsDone: number;
  /** ISO timestamp or calendar date of the most recent sitting; null before the first. */
  lastSittingAt: string | null;
  daysSat: number;
  streak: number;
  todayComplete: boolean;
};

export type GroupCount = {
  todayCount: number; // "318 sādhakas have sat today"
  cycleSittings: number; // "14,206 sittings in this Mandala cycle"
};

export type Season = {
  id: Id;
  number: number; // parva number 1..18
  roman: string; // "I"
  name: string; // "Ādi"
  devanagari: string; // "आदि"
  title: string; // "Ādi Parva"
  blurb: string;
  episodeCount: number;
  status: 'published' | 'coming';
};

export type EpisodeSummary = { id: Id; seasonId: Id; number: number; title: string; readMinutes: number };

export type Episode = EpisodeSummary & {
  seasonTitle: string;
  totalInSeason: number;
  boriRange: string; // "Ādi 1.1–15"
  paragraphs: string[];
  reflection: string;
  questions: { id: Id; prompt: string; options: string[]; answerIndex: number; explanation: string }[];
  nextEpisodeId: Id | null;
};

export type ReadingProgress = {
  episode: EpisodeSummary & { seasonTitle: string; seasonDevanagari: string; seasonRoman: string };
  progress: number; // 0..1
  minutesLeft: number;
};

export type EventItem = {
  id: Id;
  title: string;
  startsAt: string; // ISO
  place: string; // "Mahagate Ashram" | "Online"
  timeLabel: string; // "All day" | "6:30 AM IST"
  eligibility: string; // "Open to all" | "Enrolled sādhakas" | "Ages 13–24"
  placesLeft: number | null;
  imageKey?: PhotoKey;
  vibhagaId?: Id;
  registered: boolean;
};

export type PhotoKey = 'abhyudaya' | 'adhyaya' | 'ayuri' | 'bhandara' | 'samriddhi';

export type Vibhaga = { id: Id; name: string; tagline: string; photo: PhotoKey; about: string };
export type Pathway = { id: Id; name: string; about: string };

export type Parampara = {
  guru: { name: string; title: string; lineage: string; bio: string };
  lineage: { label: string; name: string; present?: boolean }[];
  milestones: { year: string; text: string }[];
};

export type DonationPurpose = { id: Id; name: string; tagline: string };
export type DonationResult = { id: Id; status: 'success' | 'failed' | 'pending'; amount: number; purposeName: string; receiptRef?: string };

export type SmallStep = { text: string };

/** W-14: result of searching published Wisdom content. */
export type WisdomSearchResult = {
  vakyams: Vakyam[];
  episodes: (EpisodeSummary & { seasonTitle: string; boriRange: string })[];
};

/** G-06: consent-first volunteer sign-up for a vibhaga. `consent` must be true. */
export type VolunteerSignup = { vibhagaId: Id; name: string; phone: string; consent: boolean };

/** Official contact shown in the About sheet. Placeholder until approved (D-21). */
export type ContactInfo = { legalName: string; address: string; phone: string; email: string };

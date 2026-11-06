/**
 * Sample content from the v3 mocks. ALL text here is placeholder until the content
 * authority approves it (PRD D-21, C-1). Lineage names stay as [placeholders] on purpose.
 * Used by the mock data layer and as Convex seed data.
 */
import type {
  DonationPurpose,
  Episode,
  EventItem,
  GroupCount,
  MandalaDayState,
  Parampara,
  Pathway,
  Practice,
  Season,
  SmallStep,
  ThemeSummary,
  Vakyam,
  Vibhaga,
  ContactInfo,
} from './types';

const GURU = 'Ven. Mahāmuni Sritha Mahāgatha';

export const vakyams: Vakyam[] = [
  {
    id: 'vk-001',
    text: 'Steadiness in practice gives clarity in life.',
    meaning:
      'When you return to your practice every day, even briefly, the mind slowly settles. A settled mind sees choices in work and family more clearly.',
    theme: 'inner-life',
    verbatim: true,
    attribution: GURU,
    source: { title: 'Mahagathe Wisdom archive', detail: '[Talk title, date] · Reviewed [date] by the content authority' },
    date: '2026-11-06',
  },
  {
    id: 'vk-002',
    text: 'Do your work as an offering, and the work itself becomes your teacher.',
    meaning: 'Treat each task, small or large, with care. Doing it well and without grudge is already practice.',
    theme: 'work',
    verbatim: false,
    attribution: GURU,
    source: { title: 'Mahagathe Wisdom archive', detail: '[Talk title, date] · Reviewed [date] by the content authority' },
    date: '2026-11-05',
  },
  {
    id: 'vk-003',
    text: 'A home is held together by patience more than by walls.',
    meaning: 'Listening before reacting keeps a family close. Patience is a daily choice, not a mood.',
    theme: 'family',
    verbatim: true,
    attribution: GURU,
    source: { title: 'Mahagathe Wisdom archive', detail: '[Talk title, date] · Reviewed [date] by the content authority' },
    date: '2026-11-04',
  },
  {
    id: 'vk-004',
    text: 'Speak the truth, walk in dharma.',
    meaning: 'Satyaṁ vada, dharmaṁ cara. Honest words and right conduct are the ground of every practice.',
    theme: 'conduct',
    verbatim: false,
    attribution: GURU,
    source: { title: 'Mahagathe Wisdom archive', detail: '[Talk title, date] · Reviewed [date] by the content authority' },
    date: '2026-11-03',
  },
];

export const themeSummaries: ThemeSummary[] = [
  { theme: 'inner-life', label: 'Inner life', count: 31 },
  { theme: 'work', label: 'Work', count: 24 },
  { theme: 'family', label: 'Family', count: 19 },
  { theme: 'conduct', label: 'Conduct', count: 22 },
];

export const practices: Practice[] = [
  {
    id: 'intro-samatha',
    title: 'Introductory Samatha',
    subtitle: 'Guided audio',
    description: 'A short guided sitting to settle the breath and the mind.',
    durationSec: 432,
    access: 'free',
    audioUrl: undefined, // approved audio not yet supplied; player runs a silent timer in mock mode
    preparation: [
      'Sit upright, on a chair or on the floor.',
      'Silence your phone. The screen can stay off.',
      'Rest your eyes and follow the voice.',
    ],
    order: 0,
  },
  { id: 'attahasa', title: 'Attahasa', subtitle: 'Preparation · guide and audio', description: '', durationSec: 0, access: 'enrolled', preparation: [], order: 1 },
  { id: 'nischara-dhyana', title: 'Nischara Dhyana', subtitle: 'Silent sitting · guide and audio', description: '', durationSec: 0, access: 'enrolled', preparation: [], order: 2 },
  { id: 'samatha-kriya', title: 'Samatha Kriya', subtitle: 'Core practice · guide and audio', description: '', durationSec: 0, access: 'enrolled', preparation: [], order: 3 },
  { id: 'mahagathe-mantra', title: 'Mahagathe Mantra', subtitle: 'Mantra · guide and audio', description: '', durationSec: 0, access: 'enrolled', preparation: [], order: 4 },
];

/** Mandala as drawn in MandalaV3: day 12, day 6 missed, days 1–5 & 7–11 sat. */
export const mandalaDays: MandalaDayState[] = Array.from({ length: 40 }, (_, i) => {
  const d = i + 1;
  if (d === 6) return 'missed';
  if (d < 12) return 'sat';
  if (d === 12) return 'today';
  return 'future';
});

export const groupCount: GroupCount = { todayCount: 318, cycleSittings: 14206 };

export const seasons: Season[] = [
  { id: 'adi', number: 1, roman: 'I', name: 'Ādi', devanagari: 'आदि', title: 'Ādi Parva', blurb: 'The bard at Naimiṣa, the serpent sacrifice, the Kuru line.', episodeCount: 10, status: 'published' },
  { id: 'sabha', number: 2, roman: 'II', name: 'Sabhā', devanagari: 'सभा', title: 'Sabhā Parva', blurb: '', episodeCount: 0, status: 'coming' },
  { id: 'aranyaka', number: 3, roman: 'III', name: 'Āraṇyaka', devanagari: 'आरण्यक', title: 'Āraṇyaka Parva', blurb: '', episodeCount: 0, status: 'coming' },
  { id: 'virata', number: 4, roman: 'IV', name: 'Virāṭa', devanagari: 'विराट', title: 'Virāṭa Parva', blurb: '', episodeCount: 0, status: 'coming' },
  { id: 'udyoga', number: 5, roman: 'V', name: 'Udyoga', devanagari: 'उद्योग', title: 'Udyoga Parva', blurb: '', episodeCount: 0, status: 'coming' },
];

const ADI_TITLES = [
  'The Bard at Naimiṣa',
  'The Serpent Sacrifice',
  'The Churning of the Ocean',
  'Garuḍa and the Nectar',
  'The Kuru Line',
  'Śantanu and Gaṅgā',
  'The Vow of Bhīṣma',
  'Satyavatī',
  'The Birth of the Princes',
  'The House of Lac',
];

export const episodes: Episode[] = ADI_TITLES.map((title, i) => ({
  id: `adi-e${i + 1}`,
  seasonId: 'adi',
  number: i + 1,
  title,
  readMinutes: 8,
  seasonTitle: 'Ādi Parva',
  totalInSeason: 10,
  boriRange: i === 0 ? 'Ādi 1.1–15' : `Ādi [range]`,
  paragraphs:
    i === 0
      ? [
          'In the forest of Naimiṣa, the sage Śaunaka and his companions had gathered for a sacrifice that would last twelve years. One morning a traveller walked into their clearing: Ugraśravas, the son of Lomaharṣaṇa, a bard who had learned the old stories by heart.',
          'The sages welcomed him and gave him a seat. When he had rested, they asked him where he had come from. He told them he had just heard a great telling — the story of the Bhāratas, first sung by Vyāsa — at the serpent sacrifice of King Janamejaya.',
          '“Tell it to us,” they said, “just as you heard it.” And so the story begins with a listener asking, and a teller willing to give.',
        ]
      : ['[Episode text, written by Mahagathe from the BORI critical edition, pending review.]'],
  reflection:
    i === 0
      ? 'The sages listen before they speak. When did you last listen to someone fully, without planning your reply?'
      : '[Reflection prompt pending review.]',
  questions:
    i === 0
      ? [
          { id: 'q1', prompt: 'Where had the sages gathered?', options: ['Naimiṣa forest', 'Hastināpura', 'Kurukṣetra'], answerIndex: 0, explanation: 'Śaunaka and the sages were at Naimiṣa for a twelve-year sacrifice.' },
          { id: 'q2', prompt: 'Who arrived to tell the story?', options: ['Vyāsa', 'Ugraśravas', 'Janamejaya'], answerIndex: 1, explanation: 'Ugraśravas, son of Lomaharṣaṇa, a bard who knew the stories by heart.' },
          { id: 'q3', prompt: 'Where had he heard the great telling?', options: ['At a royal wedding', 'At the serpent sacrifice of Janamejaya', 'In a forest hermitage'], answerIndex: 1, explanation: 'He had heard it at King Janamejaya’s serpent sacrifice.' },
        ]
      : [],
  nextEpisodeId: i < ADI_TITLES.length - 1 ? `adi-e${i + 2}` : null,
}));

const day = (d: string) => new Date(d).toISOString();
export const events: EventItem[] = [
  { id: 'ev-sunday-sitting', title: 'Sunday group sitting', startsAt: day('2026-11-09T01:00:00Z'), place: 'Online', timeLabel: '6:30 AM IST', eligibility: 'Enrolled sādhakas', placesLeft: null, registered: false },
  { id: 'ev-yuva-class', title: 'Yuva Chetana class', startsAt: day('2026-11-15T10:30:00Z'), place: 'Mahagate Ashram', timeLabel: '4 PM', eligibility: 'Ages 13–24', placesLeft: 22, registered: true },
  { id: 'ev-abhyudaya', title: 'Abhyudaya 2026', startsAt: day('2026-12-20T03:30:00Z'), place: 'Mahagate Ashram', timeLabel: 'All day', eligibility: 'Open to all', placesLeft: 140, imageKey: 'abhyudaya', registered: false },
];

export const vibhagas: Vibhaga[] = [
  { id: 'adhyaya', name: 'Adhyaya', tagline: 'Learning for children', photo: 'adhyaya', about: '[About Adhyaya, as approved by the vibhaga head]' },
  { id: 'ayuri', name: 'Āyuri', tagline: 'Care for elders', photo: 'ayuri', about: '[About Āyuri, as approved by the vibhaga head]' },
  { id: 'bhandara', name: 'Bhaṇḍāra', tagline: 'Food for all', photo: 'bhandara', about: '[About Bhaṇḍāra, as approved by the vibhaga head]' },
  { id: 'samriddhi', name: 'Samṛddhi', tagline: 'Skills and livelihood', photo: 'samriddhi', about: '[About Samṛddhi, as approved by the vibhaga head]' },
];

export const pathways: Pathway[] = [
  { id: 'bala', name: 'Bala Chetana', about: '[Program page pending]' },
  { id: 'yuva', name: 'Yuva Chetana', about: '[Program page pending]' },
  { id: 'dhyanodaya', name: 'Dhyanodaya', about: '[Program page pending]' },
];

export const parampara: Parampara = {
  guru: {
    name: GURU,
    title: 'Seventieth Mahādhibhū',
    lineage: '70th Mahādhibhū · Rudra Sampradāya',
    bio: 'Of the Rudra Sampradāya of the Mahāpāśupata mata. Every teaching in this app comes from this living lineage, with its source shown.',
  },
  lineage: [
    { label: 'Founding ācārya', name: '[Name, as approved]' },
    { label: '69th Mahādhibhū', name: '[Name, as approved]' },
    { label: '70th Mahādhibhū · present', name: GURU, present: true },
  ],
  milestones: [
    { year: '[Year]', text: '[Milestone, as approved]' },
    { year: '[Year]', text: '[Milestone, as approved]' },
    { year: '[Year]', text: '[Milestone, as approved]' },
  ],
};

export const donationPurposes: DonationPurpose[] = [
  { id: 'most-needed', name: 'Where it is most needed', tagline: 'The Trust decides' },
  { id: 'bhandara', name: 'Bhaṇḍāra', tagline: 'Food for all' },
  { id: 'adhyaya', name: 'Adhyaya', tagline: 'Learning for children' },
  { id: 'ayuri', name: 'Āyuri', tagline: 'Care for elders' },
  { id: 'samriddhi', name: 'Samṛddhi', tagline: 'Skills and livelihood' },
];
export const donationPresets = [101, 501, 1001, 2501];

export const smallSteps: SmallStep[] = [{ text: 'sit quietly for two minutes before your first meal.' }];

export const contact: ContactInfo = {
  legalName: 'Mahagathe Foundation Public Charitable Trust',
  address: '[Address, as approved]',
  phone: '[Phone, as approved]',
  email: '[Email, as approved]',
};

export const links = {
  youtube: 'https://www.youtube.com/',
  podcast: 'https://www.youtube.com/',
  whatsapp: 'https://wa.me/',
};

import { v } from "convex/values";

export const ageBand = v.union(
  v.literal("under13"),
  v.literal("13-17"),
  v.literal("18-24"),
  v.literal("25-44"),
  v.literal("45-64"),
  v.literal("65plus"),
  v.literal("unspecified"),
);
export const role = v.union(
  v.literal("sadhaka"),
  v.literal("student"),
  v.literal("parent"),
  v.literal("volunteer"),
  v.literal("donor"),
);
export const staffRole = v.union(
  v.literal("editor"),
  v.literal("reviewer"),
  v.literal("admin"),
);
export const language = v.union(
  v.literal("en"),
  v.literal("te"),
  v.literal("hi"),
);
export const consent = v.union(
  v.literal("notRequired"),
  v.literal("pending"),
  v.literal("granted"),
);
export const contentStatus = v.union(
  v.literal("draft"),
  v.literal("in_review"),
  v.literal("approved"),
  v.literal("published"),
  v.literal("archived"),
);
export const theme = v.union(
  v.literal("inner-life"),
  v.literal("work"),
  v.literal("family"),
  v.literal("conduct"),
);
export const access = v.union(v.literal("free"), v.literal("enrolled"));
export const photo = v.union(
  v.literal("abhyudaya"),
  v.literal("adhyaya"),
  v.literal("ayuri"),
  v.literal("bhandara"),
  v.literal("samriddhi"),
);
export const question = v.object({
  id: v.string(),
  prompt: v.string(),
  options: v.array(v.string()),
  answerIndex: v.number(),
  explanation: v.string(),
});
export const prefs = v.object({
  practiceReminder: v.boolean(),
  dailyVakyam: v.boolean(),
  registeredEvents: v.boolean(),
});
export const profilePatch = {
  displayName: v.optional(v.string()),
  ageBand: v.optional(v.union(ageBand, v.null())),
  roles: v.optional(v.array(role)),
  language: v.optional(language),
  reminderTime: v.optional(v.union(v.string(), v.null())),
};
export const profileResult = v.object({
  id: v.string(),
  displayName: v.string(),
  phoneMasked: v.string(),
  ageBand: v.union(ageBand, v.null()),
  roles: v.array(role),
  language,
  reminderTime: v.union(v.string(), v.null()),
  guardianConsent: consent,
  enrolled: v.boolean(),
});

/** Shared editorial lifecycle. User IDs are absent only on explicitly marked demo seeds. */
export const editorialFields = {
  slug: v.string(),
  status: contentStatus,
  authorId: v.optional(v.id("users")),
  reviewerId: v.optional(v.id("users")),
  editorIds: v.optional(v.array(v.id("users"))),
  publishAt: v.optional(v.number()),
  unpublishAt: v.optional(v.number()),
  demo: v.optional(v.boolean()),
};
export const sourceFields = {
  book: v.string(),
  edition: v.string(),
  range: v.string(),
  licenceStatus: v.union(
    v.literal("pending"),
    v.literal("permitted"),
    v.literal("public_domain"),
    v.literal("restricted"),
  ),
  reviewDate: v.string(),
  detail: v.string(),
  canon: v.union(
    v.literal("bori-critical-edition"),
    v.literal("valmiki-critical-edition"),
    v.literal("teaching"),
    v.literal("other"),
  ),
};
export const vakyamFields = {
  text: v.string(),
  meaning: v.string(),
  theme,
  verbatim: v.boolean(),
  attribution: v.string(),
  sourceId: v.id("sources"),
  publishDate: v.string(),
};
export const practiceFields = {
  title: v.string(),
  subtitle: v.string(),
  description: v.string(),
  durationSec: v.number(),
  access,
  audioStorageId: v.optional(v.id("_storage")),
  preparation: v.array(v.string()),
  order: v.number(),
  sourceId: v.optional(v.id("sources")),
  programId: v.string(),
};
export const seasonFields = {
  number: v.number(),
  roman: v.string(),
  name: v.string(),
  devanagari: v.string(),
  title: v.string(),
  blurb: v.string(),
  availability: v.union(v.literal("published"), v.literal("coming")),
};
export const episodeFields = {
  seasonId: v.id("seasons"),
  number: v.number(),
  title: v.string(),
  readMinutes: v.number(),
  boriRange: v.string(),
  paragraphs: v.array(v.string()),
  reflection: v.string(),
  questions: v.array(question),
  sourceId: v.optional(v.id("sources")),
  ownWordsConfirmed: v.boolean(),
  paragraphRanges: v.array(v.string()),
};
export const eventFields = {
  vibhagaId: v.optional(v.id("vibhagas")),
  title: v.string(),
  startsAt: v.number(),
  place: v.string(),
  timeLabel: v.string(),
  eligibility: v.string(),
  capacity: v.union(v.number(), v.null()),
  imageKey: v.optional(photo),
  ownerId: v.optional(v.id("users")),
  enrollmentRequired: v.boolean(),
  programId: v.optional(v.string()),
};
export const vibhagaFields = {
  name: v.string(),
  tagline: v.string(),
  photo,
  about: v.string(),
  vibhaga: v.optional(v.string()),
  headId: v.optional(v.id("users")),
};
export const pathwayFields = { name: v.string(), about: v.string(), titleDev: v.optional(v.string()), tagline: v.optional(v.string()), featured: v.optional(v.boolean()), ageRange: v.optional(v.string()) };
export const programResult = v.object({ id: v.string(), name: v.string(), about: v.string(), titleDev: v.string(), tagline: v.string(), featured: v.boolean(), ageRange: v.optional(v.string()) });
export const paramparaFields = {
  guru: v.object({
    name: v.string(),
    title: v.string(),
    lineage: v.string(),
    bio: v.string(),
  }),
  lineage: v.array(
    v.object({
      label: v.string(),
      name: v.string(),
      present: v.optional(v.boolean()),
    }),
  ),
  milestones: v.array(v.object({ year: v.string(), text: v.string() })),
  sourceId: v.optional(v.id("sources")),
};
export const purposeFields = { name: v.string(), tagline: v.string() };
export const contactInfo = v.object({ legalName: v.string(), address: v.string(), phone: v.string(), email: v.string() });
export const settingsFields = {
  contact: v.optional(contactInfo),
  demoMandalaDays: v.optional(
    v.array(
      v.union(
        v.literal("sat"),
        v.literal("missed"),
        v.literal("today"),
        v.literal("future"),
      ),
    ),
  ),
  demoGroupCount: v.optional(
    v.object({ todayCount: v.number(), cycleSittings: v.number() }),
  ),
  demoThemeSummaries: v.optional(
    v.array(v.object({ theme, label: v.string(), count: v.number() })),
  ),
  smallSteps: v.array(v.object({ text: v.string() })),
  donationPresets: v.array(v.number()),
  links: v.object({
    youtube: v.string(),
    podcast: v.string(),
    whatsapp: v.string(),
  }),
};

/** A discriminated, fully validated CMS payload, also used by immutable versions. */
export const contentPayload = v.union(
  v.object({ table: v.literal("sources"), data: v.object(sourceFields) }),
  v.object({ table: v.literal("vakyams"), data: v.object(vakyamFields) }),
  v.object({ table: v.literal("practices"), data: v.object(practiceFields) }),
  v.object({ table: v.literal("seasons"), data: v.object(seasonFields) }),
  v.object({ table: v.literal("episodes"), data: v.object(episodeFields) }),
  v.object({ table: v.literal("events"), data: v.object(eventFields) }),
  v.object({ table: v.literal("vibhagas"), data: v.object(vibhagaFields) }),
  v.object({ table: v.literal("pathways"), data: v.object(pathwayFields) }),
  v.object({ table: v.literal("parampara"), data: v.object(paramparaFields) }),
  v.object({
    table: v.literal("donationPurposes"),
    data: v.object(purposeFields),
  }),
  v.object({ table: v.literal("appSettings"), data: v.object(settingsFields) }),
);
export const contentTable = v.union(
  v.literal("sources"),
  v.literal("vakyams"),
  v.literal("practices"),
  v.literal("seasons"),
  v.literal("episodes"),
  v.literal("events"),
  v.literal("vibhagas"),
  v.literal("pathways"),
  v.literal("parampara"),
  v.literal("donationPurposes"),
  v.literal("appSettings"),
);
export const contentRef = { table: contentTable, slug: v.string() };

export const vakyamResult = v.object({
  id: v.string(),
  text: v.string(),
  meaning: v.string(),
  theme,
  verbatim: v.boolean(),
  attribution: v.string(),
  source: v.object({ title: v.string(), detail: v.string() }),
  date: v.string(),
});
export const practiceResult = v.object({
  id: v.string(),
  title: v.string(),
  subtitle: v.string(),
  description: v.string(),
  durationSec: v.number(),
  access,
  audioUrl: v.optional(v.string()),
  preparation: v.array(v.string()),
  order: v.number(),
  locked: v.boolean(),
});
export const mandalaResult = v.object({
  id: v.string(),
  practiceId: v.string(),
  practiceTitle: v.string(),
  startDate: v.string(),
  currentDay: v.number(),
  days: v.array(
    v.union(
      v.literal("sat"),
      v.literal("missed"),
      v.literal("today"),
      v.literal("future"),
    ),
  ),
  sittingsDone: v.number(),
  lastSittingAt: v.union(v.string(), v.null()),
  daysSat: v.number(),
  streak: v.number(),
  todayComplete: v.boolean(),
});
export const seasonResult = v.object({
  id: v.string(),
  number: v.number(),
  roman: v.string(),
  name: v.string(),
  devanagari: v.string(),
  title: v.string(),
  blurb: v.string(),
  episodeCount: v.number(),
  status: v.union(v.literal("published"), v.literal("coming")),
});
export const episodeSummary = {
  id: v.string(),
  seasonId: v.string(),
  number: v.number(),
  title: v.string(),
  readMinutes: v.number(),
};
export const episodeResult = v.object({
  ...episodeSummary,
  seasonTitle: v.string(),
  totalInSeason: v.number(),
  boriRange: v.string(),
  paragraphs: v.array(v.string()),
  reflection: v.string(),
  questions: v.array(question),
  nextEpisodeId: v.union(v.string(), v.null()),
});
export const readingResult = v.object({
  episode: v.object({
    ...episodeSummary,
    seasonTitle: v.string(),
    seasonDevanagari: v.string(),
    seasonRoman: v.string(),
  }),
  progress: v.number(),
  minutesLeft: v.number(),
});
export const eventResult = v.object({
  id: v.string(),
  title: v.string(),
  startsAt: v.string(),
  place: v.string(),
  timeLabel: v.string(),
  eligibility: v.string(),
  placesLeft: v.union(v.number(), v.null()),
  imageKey: v.optional(photo),
  vibhagaId: v.optional(v.string()),
  registered: v.boolean(),
});
export const donationResult = v.object({
  id: v.string(),
  status: v.union(
    v.literal("pending"),
    v.literal("success"),
    v.literal("failed"),
  ),
  amount: v.number(),
  purposeName: v.string(),
  receiptRef: v.optional(v.string()),
});

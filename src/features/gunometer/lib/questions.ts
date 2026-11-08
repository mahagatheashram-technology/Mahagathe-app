/** Source: https://github.com/mahagatheashram-technology/guna-profile
 * Commit: 2f6b99d99df53073f1c920ad1e65a0d015ac2a1b; src/data/questions.ts. Logic and content unchanged; imports localized.
 */
export type Guna = "sattva" | "rajas" | "tamas";

export interface QuestionMapping {
  primary: { guna: Guna; weight: number };
  secondary: { guna: Guna | null; weight: number };
}

export interface Question {
  id: string;
  tier: "core" | "backup";
  text: string;
  reverseScored: boolean;
  mapping: QuestionMapping;
  domainTags: string[];
}

export const questions: Question[] = [
  // ── Sattva-primary (Q01–Q08) ──
  {
    id: "Q01", tier: "core",
    text: "My baseline mood felt steady and calm.",
    reverseScored: false,
    mapping: { primary: { guna: "sattva", weight: 1.0 }, secondary: { guna: "rajas", weight: 0.1 } },
    domainTags: ["state", "emotion_regulation"],
  },
  {
    id: "Q02", tier: "core",
    text: "I stayed focused on one task without needing to switch, check, or chase something else.",
    reverseScored: false,
    mapping: { primary: { guna: "sattva", weight: 1.0 }, secondary: { guna: "rajas", weight: 0.2 } },
    domainTags: ["state", "context", "attention"],
  },
  {
    id: "Q03", tier: "core",
    text: "I acted on impulse without thinking through longer-term consequences.",
    reverseScored: true,
    mapping: { primary: { guna: "sattva", weight: 1.0 }, secondary: { guna: "rajas", weight: 0.15 } },
    domainTags: ["temperament", "impulsivity"],
  },
  {
    id: "Q04", tier: "core",
    text: "When I spoke, I tried to be clear and not unnecessarily irritate or hurt others.",
    reverseScored: false,
    mapping: { primary: { guna: "sattva", weight: 1.0 }, secondary: { guna: null, weight: 0.0 } },
    domainTags: ["temperament", "context", "speech"],
  },
  {
    id: "Q05", tier: "core",
    text: "I completed responsibilities even when the outcome was uncertain or not in my control.",
    reverseScored: false,
    mapping: { primary: { guna: "sattva", weight: 1.0 }, secondary: { guna: "rajas", weight: 0.15 } },
    domainTags: ["temperament", "context", "duty"],
  },
  {
    id: "Q06", tier: "core",
    text: "I felt satisfied with my life, without needing more achievements or possessions to feel okay.",
    reverseScored: false,
    mapping: { primary: { guna: "sattva", weight: 1.0 }, secondary: { guna: null, weight: 0.0 } },
    domainTags: ["temperament", "state", "contentment"],
  },
  {
    id: "Q07", tier: "core",
    text: "I kept my living and work spaces reasonably clean and orderly.",
    reverseScored: false,
    mapping: { primary: { guna: "sattva", weight: 1.0 }, secondary: { guna: null, weight: 0.0 } },
    domainTags: ["context", "cleanliness"],
  },
  {
    id: "Q08", tier: "core",
    text: "I chose my actions based on principles or values I respect, even when no one was watching.",
    reverseScored: false,
    mapping: { primary: { guna: "sattva", weight: 1.0 }, secondary: { guna: null, weight: 0.0 } },
    domainTags: ["temperament", "values"],
  },

  // ── Rajas-primary (Q09–Q16) ──
  {
    id: "Q09", tier: "core",
    text: "I felt restless or guilty when I was not being productive.",
    reverseScored: false,
    mapping: { primary: { guna: "rajas", weight: 1.0 }, secondary: { guna: "tamas", weight: 0.1 } },
    domainTags: ["state", "temperament", "restlessness"],
  },
  {
    id: "Q10", tier: "core",
    text: "I multitasked and jumped between tasks, even when single-task focus was possible.",
    reverseScored: false,
    mapping: { primary: { guna: "rajas", weight: 1.0 }, secondary: { guna: "tamas", weight: 0.15 } },
    domainTags: ["context", "state", "multitasking"],
  },
  {
    id: "Q11", tier: "core",
    text: "I felt urgency and impatience when things moved slowly or plans changed.",
    reverseScored: false,
    mapping: { primary: { guna: "rajas", weight: 1.0 }, secondary: { guna: null, weight: 0.0 } },
    domainTags: ["state", "temperament", "impatience"],
  },
  {
    id: "Q12", tier: "core",
    text: "My mood rose and fell based on results, feedback, or recognition.",
    reverseScored: false,
    mapping: { primary: { guna: "rajas", weight: 1.0 }, secondary: { guna: "tamas", weight: 0.15 } },
    domainTags: ["state", "outcome_attachment"],
  },
  {
    id: "Q13", tier: "core",
    text: "I said yes to commitments even when my schedule was already full.",
    reverseScored: false,
    mapping: { primary: { guna: "rajas", weight: 1.0 }, secondary: { guna: "tamas", weight: 0.1 } },
    domainTags: ["context", "overcommitment"],
  },
  {
    id: "Q14", tier: "core",
    text: "Status, achievement, or being the best strongly influenced my choices.",
    reverseScored: false,
    mapping: { primary: { guna: "rajas", weight: 1.0 }, secondary: { guna: null, weight: 0.0 } },
    domainTags: ["temperament", "status_drive"],
  },
  {
    id: "Q15", tier: "core",
    text: "I sought intense stimulation (strong flavors, loud media, late nights) to feel satisfied.",
    reverseScored: false,
    mapping: { primary: { guna: "rajas", weight: 1.0 }, secondary: { guna: "tamas", weight: 0.15 } },
    domainTags: ["context", "stimulation_seeking"],
  },
  {
    id: "Q16", tier: "core",
    text: "I was able to relax without feeling behind, guilty, or missing out.",
    reverseScored: true,
    mapping: { primary: { guna: "rajas", weight: 1.0 }, secondary: { guna: "sattva", weight: 0.1 } },
    domainTags: ["state", "restlessness"],
  },

  // ── Tamas-primary (Q17–Q24) ──
  {
    id: "Q17", tier: "core",
    text: "I put off important tasks even when I knew they mattered.",
    reverseScored: false,
    mapping: { primary: { guna: "tamas", weight: 1.0 }, secondary: { guna: null, weight: 0.0 } },
    domainTags: ["temperament", "context", "procrastination"],
  },
  {
    id: "Q18", tier: "core",
    text: "I felt mentally foggy, heavy, or confused for long stretches.",
    reverseScored: false,
    mapping: { primary: { guna: "tamas", weight: 1.0 }, secondary: { guna: null, weight: 0.0 } },
    domainTags: ["state", "mental_fog"],
  },
  {
    id: "Q19", tier: "core",
    text: "Under pressure, I tended to withdraw or avoid dealing with things.",
    reverseScored: false,
    mapping: { primary: { guna: "tamas", weight: 1.0 }, secondary: { guna: "rajas", weight: 0.1 } },
    domainTags: ["state", "context", "withdrawal"],
  },
  {
    id: "Q20", tier: "core",
    text: "I woke up feeling refreshed after a normal night's sleep.",
    reverseScored: true,
    mapping: { primary: { guna: "tamas", weight: 1.0 }, secondary: { guna: null, weight: 0.0 } },
    domainTags: ["state", "sleep_quality"],
  },
  {
    id: "Q21", tier: "core",
    text: "I relied on passive escape (endless scrolling, binge watching, zoning out) more than I wanted.",
    reverseScored: false,
    mapping: { primary: { guna: "tamas", weight: 1.0 }, secondary: { guna: "rajas", weight: 0.1 } },
    domainTags: ["context", "state", "avoidant_coping"],
  },
  {
    id: "Q22", tier: "core",
    text: "My days lacked a steady routine, and I struggled to stay consistent.",
    reverseScored: false,
    mapping: { primary: { guna: "tamas", weight: 1.0 }, secondary: { guna: null, weight: 0.0 } },
    domainTags: ["context", "temperament", "routine"],
  },
  {
    id: "Q23", tier: "core",
    text: "I felt stuck and had trouble initiating changes, even small ones.",
    reverseScored: false,
    mapping: { primary: { guna: "tamas", weight: 1.0 }, secondary: { guna: null, weight: 0.0 } },
    domainTags: ["temperament", "state", "inertia"],
  },
  {
    id: "Q24", tier: "core",
    text: "I felt pulled toward numbing habits (alcohol, substances, or overusing stimulants) when stressed.",
    reverseScored: false,
    mapping: { primary: { guna: "tamas", weight: 1.0 }, secondary: { guna: "rajas", weight: 0.15 } },
    domainTags: ["context", "intoxicants"],
  },
];

export const coreQuestions = questions.filter((q) => q.tier === "core");

export const likertOptions = [
  { value: 1, label: "Never" },
  { value: 2, label: "Rarely" },
  { value: 3, label: "Sometimes" },
  { value: 4, label: "Often" },
  { value: 5, label: "Almost always" },
];

export const LIKERT_MIN = 1;
export const LIKERT_MAX = 5;

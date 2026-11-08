# Mahagathe App PRD v0.5: v14 design and scope update

**Status:** Approved by the user for build, 8 Nov 2026. **Replaces:** the screen layout, visual
language and copy guidance of v0.4 (`docs/PRD-v0.4-experience.md`). v0.4's navigation (4 tabs,
Profile behind the avatar), principles E-1, E-3, E-4, E-5, E-6 and the Mandala model (section 5)
still apply. v0.3's decisions, content rules C-1…C-8, requirement IDs and data entities still apply
unless changed here.
**Design source:** `docs/design/v14/screenshots/*.png` (rendered at 2×, 390pt wide) and
`docs/design/v14/mocks/*.html` (inline styles: copy sizes, colours and spacing from them).
Screens named `V13*` were drawn in round one and corrected in round two; `V131*` are new in round two.
Both sets together are v14.

## 1. Brand and naming rules (from the foundation, binding)

| Rule | Detail |
|---|---|
| N-1 | Never write "Gurudev" anywhere in the app, data or notifications. |
| N-2 | The first introduction (Welcome, Lineage page, About) says **"Most Venerable Mahamuni"**. Everywhere else: **"Mahamuni"** ("Mahamuni's word for today", "Mahamuni's words", "Mahamuni's own words"). |
| N-3 | The ashram is **"Mahagathe Ashram"**. Never "Mahagate". |
| N-4 | Teachings are counted as **Vākyams** ("96 Vākyams"), never "words" as a count. Theme chips show no counts. |
| N-5 | Portrait: `assets/photos/mahamuni-portrait.jpg` (900×1600). Used only as a small round face crop beside Mahamuni's word (Home, Wisdom, Vākyam, lineage card) and as the Lineage page header (face clear, sunset space above, robe visible). Nowhere else. |

## 2. Visual language: four places of the ashram

Each tab is a place with its own ground, from Indian natural dyes. Colour tells you where you are.

| Place | Tab / screens | Ground | Notes |
|---|---|---|---|
| Today | Home, Profile | limewash `#FBFAF7` | Home is a map: each block wears the colour of the place it leads to |
| The hall | Practice, Mandala, Player, Welcome | indigo `#1F2347`, raised `#2B3160`, lamp `#F2B544`, on-dark text `#B9BCD9` | Tab bar is indigo on these screens |
| The library | Wisdom, catalogue, search, series, episode, Vākyam, Gunometer | palm leaf `#E7D3A8` with 7px ruled lines `rgba(120,90,40,.07)`, edge `#C9AE78`, ink `#2A1E14`, dark leaf text `#5B4628` | Leaf strips have two string holes |
| The village | Sangha, programs, Give | laterite `#9C3D22`, soft `#F3E2D9` | Real photos |

- Action red `#C20000`: one primary button per screen. Series colours: Mahabharata laterite, Rāmāyaṇa `#4C6639`, Pāśupata `#5E5A57`, IKS turmeric `#9A6B12`.
- Gunas: sattva `#FFFDF6` (outlined `#C9AE78`), rajas `#B5341F`, tamas ink `#2A1E14`.
- Type: **Eczar** (titles, teachings, numerals, Devanagari display) and **Mukta** (UI). Both via `@expo-google-fonts/*`. Lora and Poppins are retired.
- Scale: 13 / 15 / 17 / 21 / 26 / 33 / 41. Body Mukta 16/1.55; reading Eczar 18.5/1.72.
- Radii by meaning: leaves 16, photos 12, buttons 14, cards 20.
- Cut: no ALL-CAPS eyebrows, no "A · B · C" strings, no identical cards, no date header on Home.
- Contrast: all text WCAG AA. Grey text on palm leaf uses `#5B4628` or darker. Inactive tab label `#75685E`.
- **Review tag**: a dashed amber pill (light `#7A5200` on `#FFF4D6`; dark `#F2B544`) marks content awaiting sign-off. Ship it in the build; it is removed when the item is approved.

## 3. Screens (route → mock)

| Screen | Route | Mock | Notes |
|---|---|---|---|
| Welcome | `/welcome` | V13Welcome | Emblem in the 40-lamp ring on indigo |
| Gunometer invite | `/gunometer/intro` | V131GunaInvite | Shown **once** after first sign-in (Begin / Later). Later → Profile shows "Take the Gunometer" |
| Gunometer question | `/gunometer/quiz` | V131GunaQuestion | 25 items, one per screen, Never…Almost always, back allowed |
| Gunometer result | `/gunometer` | V131GunaResult | Latest result only; Take it again (replaces); share card V131GunaCard |
| Home | `/(tabs)` | V13Home, V131HomeAnswer | Sitting card; Yakṣa's question leaf with continue-reading row; Mahamuni's word. **No events on Home.** |
| Yakṣa share card | (share image) | V131YakshaCard | 9:16 story card, rendered with react-native-view-shot if available in Expo Go, else system share of text |
| Practice | `/(tabs)/practice` | V13Practice | Path: 1 Samatha meditation (open), 2 Dhyanbhaari (locked until class attended) + next class card; review tags |
| Mandala | `/mandala` | V13Mandala | Three rules on screen + review tag (D-23) |
| Player | `/player/[id]` | V13Player | Single lamp |
| Wisdom | `/(tabs)/wisdom` | V13Wisdom | Search field, today's word with portrait, continue reading, 2 latest words + "All 96 Vākyams", series shelf (2×2 covers), Saptagita row, lineage card |
| Mahamuni's words | `/teachings` | V13Words | Catalogue, newest first, grouped by month, theme filter chips, save |
| Search | `/search` | V13Search | Exact + by-meaning; Vākyams then series episodes; "Nothing is written by AI" note |
| Series page | `/series/[id]` | V13Series | Generic: header in series colour, motif, Devanagari title, parts list, notify button if not started |
| IKS series | `/series/iks` | V131IKS | Session 1 free, sessions 2+ locked, "Get access to the full series" (action TBD, review tag) |
| Mahabharata | `/series/mahabharata` | V13Mahabharata | Episodes with read/current states |
| Episode | `/episode/[id]` | V13Episode | |
| Guru Vākyam | `/vakyam/[id]` | V13Vakyam | Attribution with portrait |
| Lineage | `/parampara` | V131Lineage | Portrait header, "Most Venerable Mahamuni" |
| Sangha | `/(tabs)/sangha` | V13Sangha | Photo slot (placeholder until supplied), next gathering, coming up (weekday computed), Programs, seva with vibhāga line, Give |
| Program | `/pathway/[id]` | V131Program | Yuva Chetana first; placeholders |
| Give | `/donate` | V13Donate | |
| Profile | `/profile` | V13Profile | Guna card under the name; "Gatherings I'm going to" **on by default** |

Old v12 routes not listed (e.g. `/wisdom-theme/*`, `/events`, `/seva`, `/vibhaga/*`) may stay if still linked, restyled in the new language; remove dead ones.

## 4. Features and rules

### 4.1 Yakṣa's question (Home)
- One question per IST day from an approved set (Āraṇyaka Parva, BORI edition). Each item: question, answer, two distractors, verse reference, one-line meaning, `approved` flag.
- States: ask (three choices + "Just show me") → answered (correct/incorrect mark, answer, reference, meaning, Share as a story, "New question tomorrow").
- The day's answer state persists per user (or device, for guests).
- Seed with the single example in the mock; mark the meaning `[draft, to approve]` and the verse `[verse to confirm]`.

### 4.2 Gunometer
- Port `guna-profile` (github.com/mahagatheashram-technology/guna-profile): `src/data/questions.ts` (25 core items, Likert 1–5) and `src/lib/scoring.ts` unchanged, plus `src/data/recommendations.ts` text. Keep a source comment.
- Prompted once after first sign-in; never tied to the Mandala; no daily check-in.
- Stores the latest result (scores, percents, dominant/secondary, profile type, answers, takenAt) on the profile. Retake replaces it.
- Guests may not take it (sign-in prompt).
- Question and result text carry review tags until the content authority signs off. Known issue: the instruction asks about "the last four weeks", which measures state, not nature.

### 4.3 Practice
- Practice is meditation only: Samatha meditation, then Dhyanbhaari.
- Dhyanbhaari is locked until the person has attended the class. Unlock mechanism is an open decision (teacher marks attendance vs one-time code); build the data flag `practiceUnlocks` and a mock toggle only.

### 4.4 Wisdom search
- Retrieval only over approved Vākyams and published episodes. Never generated text.
- Mock mode: local keyword + simple synonym ranking. Live mode: Convex vector index over embeddings created at publish time; the embedding provider key is server-side only and optional (fall back to text search when absent).

### 4.5 Series and IKS access
- Series are content entries (id, Devanagari title, English title, colour, motif, description, parts, status).
- IKS: session 1 free; later sessions require `seriesAccess` on the account. How access is bought is undecided (options in the v13.1 review); the button opens a placeholder sheet for now. No prices, no external purchase links in the app.

### 4.6 Programs
- Programs (pathways): Yuva Chetana (featured, "Gen Z guides", ages 13–24), Bala Chetana, Dhyanodaya. Copy and photos are placeholders until supplied.

## 5. Data contract additions (src/data, mirrored in Convex)

```ts
type YakshaQuestion = { id; dayKey; question; answer; distractors: [string, string]; reference; meaning; approved: boolean };
type YakshaState = { questionId; choice: string | null; revealed: boolean; correct: boolean | null };
type Guna = 'sattva' | 'rajas' | 'tamas';
type GunaResult = { scores: Record<Guna, number>; percents: Record<Guna, number>; dominant: Guna; secondary: Guna;
                    profileType: 'dominant' | 'dual' | 'balanced'; answers: Record<string, number>; takenAt: number };
type Series = { id; titleDev; title; color; motif: 'wheel' | 'bow' | 'ash' | 'yantra'; description; status: 'reading' | 'upcoming' | 'free-first';
                parts: { number; title; when?: string; locked?: boolean; free?: boolean }[] };
type Program = Pathway & { titleDev; tagline; featured: boolean; ageRange?: string };
// hooks: useTodayYaksha, useAnswerYaksha, useGunaResult, useSaveGunaResult, useGunaPrompt (seen/later),
//        useSeries, useSeriesById, useSeriesAccess, usePracticeUnlocks, useVakyamCatalogue (grouped by month, theme filter)
```

## 6. Open items (shown with review tags)
D-23 Mandala rule; practice path labels/order and Dhyanbhaari spelling; Gunometer text; Yakṣa set and meanings;
IKS payment option (A recommended: web + in-app purchase, needs an EAS dev build, later milestone); Dhyanbhaari unlock method;
seva → vibhāga mapping; Sangha header photo; program copy and photos; IKS sessions; Mahamuni introduction and Paramparā names.

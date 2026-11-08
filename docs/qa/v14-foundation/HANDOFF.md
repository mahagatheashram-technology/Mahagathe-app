# v14 foundation handoff

Worktree: `/Users/sameer/.t3/worktrees/Mahgate(app)/t3-fd62f869`.
All changes are uncommitted, for the orchestrator. No git writes were made in this
checkout, no PR was created, and no `.env` file was read or edited.

## Shared UI

Import the new primitives from `@/components/ui`; screen agents should not need
to edit the shared files. The unlinked `/dev/primitives` route demonstrates each
primitive and exposes the account-gated mock Dhyanbhaari toggle. It is public for
visual inspection; ordinary account/setup gates still apply when signed in.

- `LampRing({done, size=236, center?, label?, sub='lamps lit', ...ViewProps})`:
  forty lamps clockwise from twelve. `center={false}` hides its default centre;
  a string/number is wrapped in Eczar; an element can supply the Welcome emblem.
- `Leaf({holes=false, holeTop='50%', ...ViewProps})` and `LeafBand(ViewProps)`:
  SVG rules at 7pt, edge and optional string holes. Use `holes` for leaf strips.
- `BackPill({destination, dark?, onPress?, ...PressableProps})`: names where it
  goes. Its target is 44pt to satisfy the accessibility requirement (mock: 40).
- `PrimaryButton`, `OutlineButton`, `TextLink`: `label`, `onPress`, optional
  `icon`, `trailingIcon`, `disabled`, `loading`, accessibility props and style.
  Outline/link also accept `color`. Primary is 54pt/r14; outline is 44pt/r14.
- `ProgressSegments({done,total,current?,color?,offColor?,...ViewProps})`:
  `current` is zero-based, as in `segs(cur)` in the generator.
- `ReviewTag({label,dark?,...ViewProps})`: small dashed amber review marker.
- `Portrait({size=34,ringColor?,...ViewProps})`: specified 560px face crop.
- `PortraitHeader({width?,height=470,title?,titleSlot?,children?,...ViewProps})`:
  width defaults to the window; image offset scales from -26px at 390pt. Put the
  back control in children and text in the title slot. Portraits remain limited
  to the placements specified by N-5, apart from this dev gallery.
- `SeriesCover({titleDev,title,color,motif,state,active?,height=196,titleDevSize=27,
  ...PressableProps})` and `SeriesMotif({motif,size=32,color?})`:
  wheel/bow/ash/yantra, two leaves, 44% cord and knot. IKS uses titleDevSize 23
  in its Wisdom shelf mock.
- `GunaRope({percents,width=300,height=70,amplitude?,...ViewProps})` and
  `GunaBar({percents,labels=true,...ViewProps})`: three phase-shifted strands and
  labelled proportions, with sattva outlined.
- `PhotoPlaceholder({label,height=200,radius=12,...ViewProps})`: laterite,
  diagonal stripes and emblem. Real photos remain available through `@/data`.
- `TabBar(BottomTabBarProps)`: wired in the existing tabs layout. Four place
  colours and active top marker; Practice selects the indigo/lamp variant.
  Native accessibility state and web ARIA state are both supplied.
- Exact v14 icon paths are available as `home`, `lamp`/`lampi`, `leafi`/
  `open-book`, `people`, `back`, `play`, `lock`, `check`, `share`, `save`, `pin`,
  `bell`, `globe`, `search`, `close`, `down`, `chevronRight`, `waves`.

## Tokens and fonts

Root layout already calls `useAppFonts`; that hook now loads Eczar and Mukta
400/500/600/700. Old `serif*`, `sans*`, and Devanagari aliases all remain exported
and point to Eczar/Mukta. Eczar has no italic face; the historical `serifItalic`
alias resolves to Eczar regular.

New work should use `v14Colors` from `@/theme/tokens`. It exposes canonical v14
`ink` and `tabInactive`. To preserve old values as requested, historical
`colors.ink`/`colors.tabInactive` were not changed; their new values are also
available as `colors.v14Ink`/`colors.v14TabInactive`. Other palette additions
include `limewash`, `indigo`, `indigo2`, `lamp`, `onDark2`, `leaf`, `leafEdge`,
`darkLeaf`, `laterite`, `lateriteSoft`, `text2`, `line`, series/guna/review colours.
`actionRed` already matched. `v14Radii` exposes leaf16/photo12/button14/card20.
`typeScale` exposes 13/15/17/21/26/33/41; `typography` supplies body16/24.8 and
reading18.5/31.82. Clear font names are `fonts.display[Medium|Semibold|Bold]`
and `fonts.ui[Medium|Semibold|Bold]`. AppText adds `v14Title`, `v14Section`,
`v14Body`, and `reading`; historical variants remain available.

## Public data contract

Screens import only `@/data`. Every added hook is selected through `hooks.ts`
and implemented in both `hooks.mock.ts` and `hooks.live.ts`. Query `undefined`
means loading; `null` means no singleton. An empty catalogue/series list is `[]`.

```ts
useTodayYaksha(): TodayYaksha | null | undefined
// TodayYaksha = { question: YakshaQuestion; state: YakshaState }
useAnswerYaksha(): (choice: string | null) => Promise<void>
// null means “Just show me”; first reveal per account/device/IST day wins.

useGunaResult(): GunaResult | null | undefined
useSaveGunaResult(): (result: GunaResult) => Promise<void>
// Both implementations recompute from answers and replace takenAt with current time.
useGunaPrompt(): GunaPrompt | undefined
// { state: 'unseen'|'later'|'done', setState(state): Promise<void>,
//   markLater(): Promise<void>, markDone(): Promise<void> }
// Guests see unseen; writes require account setup/consent. Saving sets done.

gunaResultFromAnswers(answers: Record<string, number>, takenAt: number): GunaResult
// Pure helper, also exported from @/data; validates complete 1–5 responses.

useSeries(): Series[] | undefined
useSeriesById(id: string | undefined): Series | null | undefined
useSeriesAccess(seriesId: string): boolean | undefined
// Unknown or unauthorized series access is false. IKS session 1 is always free.
// Mahabharata parts include seasonId and episodeIds linking existing routes.

usePracticeUnlocks(): PracticeUnlocks | undefined
// PracticeUnlocks = { dhyanbhaari: boolean }
useSetMockPracticeUnlock(): (unlocked: boolean) => Promise<void>
// Mock only, requires personal access; live always rejects.

useVakyamCatalogue(theme?: VakyamTheme): VakyamMonth[] | undefined
// VakyamMonth = { month: 'YYYY-MM', label: string, vakyams: Vakyam[] }
// Month groups and their entries are newest first; theme is optional.

usePathways(): Program[] | undefined
usePathway(id: string | undefined): Program | null | undefined
// Program extends Pathway: titleDev, tagline, featured, ageRange?.
```

Other changed shapes/behaviour:

- Practice catalogue is exactly `intro-samatha` (“Samatha meditation”, free),
  then `dhyanbhaari` (attendance flag). Do not rename the preserved Samatha ID.
  General enrollment does not unlock Dhyanbhaari. Restricted instructions and
  media remain hidden until unlocked. Mandala counting/rules are unchanged;
  its authorization predicate now recognizes the attendance flag.
- Yuva (`yuva`) is first/featured: “Gen Z guides”, ages `13–24`. Bala (`bala`)
  and Dhyanodaya (`dhyanodaya`) follow. Copy remains bracketed placeholders.
- `Vibhaga` adds `vibhaga: string` with `[Vibhāga, to confirm]` for seva cards.
- `NotificationPrefs.registeredEvents` defaults to true. Existing explicit
  server preferences are preserved.
- The mock catalogue includes the two October placeholders drawn in the mock.
  Search uses deterministic keyword/synonym ranking without generated content.
- Guest Yakṣa state persists in localStorage on web and SecureStore on native.
  Mock account v14 state persists separately, keyed to the mock phone identity.
  Sign-out clears in-memory account state; another account cannot see it.
  Account deletion/consent removal erases persisted mock state. The mock still
  uses the existing nonpersistent demo auth/setup flow after an app reload.
- Live endpoints and private data erasure/export are documented in
  `convex/README.md`. Optional embeddings require a server-only key; no key is
  needed for the mock app or text search. No provider-backed request was tested.

## Source discrepancy requiring content review

Gunometer questions, recommendations and scoring were copied from
https://github.com/mahagatheashram-technology/guna-profile at commit
`2f6b99d99df53073f1c920ad1e65a0d015ac2a1b`, cloned into
`/tmp/mg-v14-guna-source`. Each file cites the source path and commit.
Only the scoring import alias was localized; logic and content are unchanged.
**The upstream file has 24 core questions (Q01–Q24), despite the PRD/mock saying
25.** Quiz progress and result submission must use `coreQuestions.length`.
No question was invented. The state-versus-nature wording remains a review item.

## Verification

All required commands ran with Node 22.18.0 (the default Node 20.17 is below
SDK 58's dependency requirements) and `EXPO_NO_DOTENV=1`.

- `npx tsc --noEmit`: exit 0, no diagnostics (`typecheck.txt`).
- `npx expo lint`: exit 0, no diagnostics (`lint.txt`).
- `npm test`: 45 tests, 45 pass, 0 fail (`tests.txt`). Existing enrollment
  security tests now create a separate test practice; v14 tests cover the two
  actual practices and dedicated attendance flag. Mandala tests are retained.
- `CI=1 npx expo export --platform web --output-dir /tmp/mg-v14-foundation`:
  exit 0 (`export.txt`). That literal temporary folder was removed after QA.
- `grep -rn "Gurudev\|Mahagate[^h]" src convex`: no output, expected exit 1
  (`naming.txt`). `git diff --check`: exit 0.
- Offline Convex codegen: `No CONVEX_DEPLOYMENT set`; API declaration updated
  by hand using the repository's existing pattern. No deployment was attempted.
- Chrome gallery QA used a 390×844 CSS viewport with 2× capture, matching the
  design screenshot convention (PNG 780×1688). `primitives.png` is the initial
  viewport; `primitives-library.png` and `primitives-lineage.png` show the rest.
  No console errors. Lamp action changed 10 to 11; selecting Practice switched
  the tab bar to indigo. Final ARIA selected/value state was checked on web.

The complete added/changed file inventory is in `FILES.txt` beside this handoff.

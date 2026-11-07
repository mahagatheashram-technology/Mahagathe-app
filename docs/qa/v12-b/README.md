# v12 implementation B — handoff and visual QA

All implementation changes are uncommitted. No git write commands, subagents, commits, pushes, or PR creation were used. The orchestrator owns the commit and PR into `release/0.1.0`.

## Shared APIs

```tsx
<DetailHeader backLabel="Wisdom" backHref="/(tabs)/wisdom" />
<ListRow icon="lamp" title="Our lineage" subtitle="The Paramparā" onPress={openLineage} last />
```

`DetailHeader` adds optional `backLabel?: string` and `backHref?: string`. The default label is `Back`. `onBack` takes precedence; otherwise `backHref` dismisses to the named route; without either it uses navigation history, then `/`. Existing `label`, `onBack`, `backIcon`, `trailing`, `tint`, and `labelColor` props remain available. The sand pill is 40pt high with 2pt hit slop, an 18pt `‹`, and a 15pt semibold label.

`ListRow` exports `ListRowProps`: `icon: IconName`, `title: string`, `subtitle?: string`, `onPress: () => void`, `last?: boolean`. It uses a 40pt sand circle, 19pt dark-gold icon, 16pt semibold title, 14pt muted subtitle, muted chevron, and divider unless `last`. The row includes 20pt vertical padding around the mock's 64pt minimum content area (84pt overall). Both components are exported from the shared index.

New icon names: `lamp`, `offering-hands`, `globe`, `grid`, with exact v12 SVG path data. The existing `info` icon already matches v12. `LineOrnament` shares the exact gold ornament between Welcome and Paramparā. New colours live in additive `src/theme/v12.ts`; `src/theme/tokens.ts` was untouched.

## Data contract

The only domain type change is the additive `AgeBand` member `'unspecified'`, exposed in `AGE_BANDS` as “Prefer not to say.” `isMinor('unspecified')` is false. The existing mock update hook stores it with `guardianConsent: 'notRequired'`, and the Convex validator accepts it. Frontend contract and backend regression tests cover this choice. Hook names and signatures are unchanged.

Fixture meaning, episode prose/reflection, and lineage bio now copy the locked v12 mock text. Existing bracketed editorial placeholders remain. No other data fields were added.

The onboarding route gate now permits returning from incomplete Setup to Welcome; protected destinations still require completed setup and any required guardian consent.

## Validation

Node 22.18.0; no Clerk or Convex keys. `npm install` completed during setup. Final required checks passed:

```sh
npx tsc --noEmit
npx tsc --noEmit -p convex/tsconfig.json
npx expo lint
npm test
CI=1 npx expo export --platform web --output-dir /Volumes/NithinSameer/Personal/Mahagathe/.agent-work/v12b/web
```

`npm test`: 35 passed, zero failures. Lint: zero errors or warnings. `git diff --check` also passed.

Headless Google Chrome used an explicit CDP `Emulation.setDeviceMetricsOverride` with **390×844 CSS pixels, DPR 2, mobile true**, plus touch emulation. The script asserts the runtime viewport and captures 780×1688 PNGs. Raw captures, browser results, export, and logs remain under `/Volumes/NithinSameer/Personal/Mahagathe/.agent-work/v12b/`. The script starts and stops its own local static server and closes Chrome.

The browser checks cover phone/OTP setup; returning to Welcome; unspecified age without guardian routing; episode selection, unfinished reading restoration, text sizing, questions, and Next; teaching Save; Source details → existing report sheet → successful report; sitting-player navigation; lineage and milestone sheets; teaching and seva hubs; gathering registration; donation purpose and abroad sheets, no default amount, custom amount validation, payment success, Give again; and guest guards. No browser runtime errors were observed. The mock payment hook always resolves success, so the unchanged failure/retry outcome was not forced in browser QA.

Reproduce after exporting:

```sh
V12_PLAYWRIGHT=/path/to/installed/playwright \
TMPDIR=/Volumes/NithinSameer/Personal/Mahagathe/.agent-work/v12b/tmp \
node docs/qa/v12-b/capture.cjs
python3 docs/qa/v12-b/compare.py
```

## Visual comparisons

Each comparison has the locked mock at left and implementation at right, both at 1× (390×844). The taller Episode reference is cropped to its first viewport; the supporting end capture shows the dynamic BORI source line and Next action.

| Screen | Comparison |
| --- | --- |
| Welcome | [Welcome](Welcome-comparison.png) |
| Setup | [Setup](Setup-comparison.png) |
| Wisdom | [Wisdom](Wisdom-comparison.png) |
| Guru Vākyam | [Guru Vākyam](Vakyam-comparison.png) |
| Episode | [Episode](Episode-comparison.png) |
| Sangha | [Sangha](Sangha-comparison.png) |
| Paramparā | [Paramparā](Parampara-comparison.png) |
| Give | [Give](Donate-comparison.png) |

Supporting captures: [Episode end/source](Episode-end.png), [Vākyam source](Vakyam-source.png), [Report confirmation](Vakyam-report.png), [Gathering registration](Sangha-gathering.png), [Selected donation](Donate-selected.png), [Donation receipt](Donate-success.png).

Known comparison differences: the five-tab navigator is still the older implementation owned by the parallel thread; it was not edited here. List rows intentionally follow the requested shared API's 16/14pt text, while mock HTML uses 15/13pt. Back controls use the explicitly requested `‹` glyph; mock screenshots use an SVG arrow. The reader's All episodes target is 44pt for accessibility. Sangha says “3 upcoming” rather than “3 this month” because fixtures span November and December. The Episode source line follows the updated PRD even though the locked screenshot predates it.

No blocking open questions. Integration still needs the parallel tab-bar/screen changes and the orchestrator's normal review. A native Expo Go device was not exercised in this environment.

## Changed files

- Shared UI: `src/components/ui/Screen.tsx`, `ListRow.tsx`, `LineOrnament.tsx`, `Icon.tsx`, `index.ts`.
- Routes: `src/app/welcome.tsx`, `setup.tsx`, `donate.tsx`, `parampara.tsx`, `vakyam/[id].tsx`, `(tabs)/wisdom.tsx`, `(tabs)/sangha.tsx`, `teachings.tsx`, `seva.tsx`, `events.tsx`, `pathway/[id].tsx`, `vibhaga/[id].tsx`, `wisdom-theme/[theme].tsx`.
- Onboarding: `src/features/onboarding/LanguagePill.tsx`, `SetupForm.tsx`.
- Wisdom: `src/features/wisdom/WisdomScreen.tsx`, `TodayVakyamCard.tsx`, `VakyamScreen.tsx`, `EpisodeReader.tsx`.
- Sangha: `src/features/sangha/SanghaScreen.tsx`, `ParamparaScreen.tsx`, `AmountPicker.tsx`.
- Contract/data: `src/data/types.ts`, `hooks.mock.ts`, `fixtures.ts`; `convex/lib/validators.ts`.
- Support: `src/theme/v12.ts`, `src/providers/AccountRouteGate.tsx`, `convex/tests/app-contract.test.ts`, `convex/tests/backend.test.ts`.
- QA/handoff: this directory's capture/comparison scripts, README, suggested PR body, and PNGs.

# v14 Gunometer + Profile implementation handoff

Worktree: `/Users/sameer/.t3/worktrees/Mahgate(app)/t3-14712bf4`.
All changes are uncommitted for the orchestrator. No git write commands, commits,
branches, PRs, merges, `.env` reads, or provider-backed requests were made.

## Implemented

- `/gunometer/intro`: full ruled palm leaf, three facts, source question count,
  Later → `markLater` → Home, Begin → quiz. Guests see “Sign in to begin”.
- `/gunometer/quiz`: exactly the **24 exported core questions**, the source
  four-week instruction, five radio answers, checked ink selection, 260ms
  auto-advance, back with answer restoration, progress, review tag. Final answer
  computes via `gunaResultFromAnswers`, saves through `useSaveGunaResult`, marks
  done, and replaces the route with the result. Completion time reaches the
  upstream scorer through the helper's optional new argument. Failed saves
  retain answers and expose retry. Double taps are guarded; timers are cleaned up.
- `/gunometer`: latest result with date, dominant/secondary and Devanagari,
  rope/bar/percentages, unchanged source interpretation, four expandable source
  recommendation groups, review tag, Saptagita app link and replace-on-retake copy.
  With no result it displays the invite; `undefined` displays loading.
- Share: reusable 330 × 586⅔pt (9:16) `GunaShareCard` and accessible modal preview.
  Native capture produces a 1080 × 1920 PNG and opens the system image share
  sheet. Temporary capture files are released. Web/unavailable native sharing
  falls back to React Native `Share` text; unsupported browsers get an error.
- `/profile`: indigo name card/small LampRing, latest-result leaf or “Take the
  Gunometer”, v14 reminder labels, indigo switches, Settings, Sign out. Existing
  edit-name, reminder-time, language, data export, deletion and sign-out handlers
  and sheets remain. The gathering preference is read from the contract and is
  on by default, while explicit choices are preserved.
- Minimal post-sign-in integration in both `src/app/setup.tsx` and
  `src/app/sign-in.tsx`: wait for consent/profile/prompt, route unseen to invite,
  otherwise Home. Both locations are needed for new and existing accounts.

## Contract additions / shared changes

1. `ExternalLinks` in `src/data/types.ts`; `useExternalLinks` (mock and live) and
   the preserved mock `externalLinks` export add `saptagita: 'saptagita://'`.
   This is the registered scheme read from the sibling app's `app.json`.
   It opens the app; no supported chapter-14 deep link was present to use.
   The live hook preserves `undefined`/`null`; its addition is client-side and
   does not require changing the existing Convex links validator/seed.
2. `gunaResultFromAnswers(answers, takenAt, completionTimeSeconds?)` is backwards
   compatible; it forwards optional elapsed time to the unchanged scorer. The
   saved result shape is unchanged (confidence/quality flags are not contract
   fields; saves still recompute scores and authoritative `takenAt`).
3. Additive `retake` icon with the exact invite mock SVG paths.
4. Additive tokens `shareBackdrop` and `v14SwitchOff`.
5. `npx expo install` added `react-native-view-shot` 6.1.1 and `expo-sharing`
   ~58.0.22 to package.json/package-lock.json. `npm test` now includes the two
   feature tests in addition to the existing backend tests. No native project
   or app-config changes are needed for outgoing sharing.

The source logic/content in `src/features/gunometer/lib` is unchanged.

SDK 58 references checked before implementation:
- https://docs.expo.dev/versions/v58.0.0/sdk/captureRef/
- https://docs.expo.dev/versions/v58.0.0/sdk/sharing/
Both list Expo Go support. Native device image-sharing and opening another
installed app require device QA; this run verified web rendering and flows.

## Verification outputs

Node 22.18.0, with `EXPO_NO_DOTENV=1` for Expo commands:

```text
npx tsc --noEmit
exit 0; no diagnostics

npx expo lint
exit 0; no diagnostics

npm test
1..47
# tests 47
# pass 47
# fail 0
# cancelled 0
# skipped 0
# todo 0

CI=1 npx expo export --platform web --output-dir /tmp/mg-v14-guna
Exported: /tmp/mg-v14-guna
exit 0

git diff --check
exit 0
```

Raw logs: `typecheck.txt`, `lint.txt`, `tests.txt`, `export.txt`.
`quiz-tests.txt` also records the standalone feature tests. Those tests verify
complete-answer save ordering, replacement, validation, and rejected saves.
The literal `/tmp/mg-v14-guna` export folder was deleted after QA.

`browser-qa.cjs` is the reproducible headless-Chrome flow/capture script. It uses
Playwright at the requested path, the requested Google Chrome executable,
390 × 844 CSS viewport and 2× captures. It exercises real mock sign-in/setup
and the complete quiz twice; it does not inject authentication or result state.
It finds valid source answers with reference percentages for visual comparison.
See `browser-results.txt` / `browser-run.txt` for all ten PASS lines. No browser
runtime errors occurred. Checks include guest gating; first invite; Later;
gatherings on; previous-answer selection; persisted answer/result/prompt;
accordion; story rendering; Profile edits/toggles; retake; returning-account
prompt suppression.

## Screenshots and comparison

All five named screens have `*-comparison.png` with mock on the left and build
on the right. Rendered and inspected, then adjusted padding/spacing to match:

| Screenshot | Final pixels | Notes |
|---|---|---|
| `V131GunaInvite.png` | 780 × 1688 | Signed-in invite, Begin |
| `V131GunaQuestion.png` | 780 × 1688 | Actual Q12, Often selected |
| `V131GunaResult.png` | 780 × 2518 | Full scroll content; mock 780 × 2522 |
| `V131GunaCard.png` | 780 × 1688 | Exact component centred on mock-sized dark ground |
| `V13Profile.png` | 780 × 1860 | Full scroll content; matches mock dimensions |

`GunaSharePreview.png` is the real share modal including accessible close/share
controls. `GunaStory.png` captures only the 9:16 component. The named Card
comparison centres a DOM clone of that same component on the reference ground;
it is a QA presentation of the share artifact, not another app route. Other
captures: `ProfileNoResult.png`, `GunaQuestionUnanswered.png`, and
`GunaQuestionSelected.png`. Scroll content captures expand the viewport only
for the screenshot because native-style ScrollViews otherwise clip fullPage.

Known intentional differences:
- 24 actual source questions, rather than the mock/PRD's incorrect 25. The
  invite says “24 short questions”; progress uses `coreQuestions.length`.
- Q12 retains the source “based on results, feedback, or recognition” wording.
  Result interpretation retains the longer source recommendation text. All
  review tags remain. No source question/scoring/recommendation edits.
- Dates reflect the actual saved timestamp (8 November in these captures),
  rather than the mock's fixed 12 November.
- BackPill is 44pt accessible rather than the mock's 40pt. Other interactive
  targets reach 44pt, including Edit via hit slop and reminder switches.
- Sattva strand remains white with outline; its display name uses dark-leaf
  ink for readable contrast on palm leaf. Rajas/tamas use their guna colours.
- Native share and app-to-app opening remain device-only QA; no live keys used.

See `FILES.txt` for the complete changed/added file inventory.

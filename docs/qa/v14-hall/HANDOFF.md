# v14 hall implementation handoff

Worktree: `/Users/sameer/.t3/worktrees/Mahgate(app)/t3-c4eef5d3`.
All source changes are uncommitted for the orchestrator. No git write commands,
PR creation, `.env` reads, or deployments were performed.

## Changed source files

- `src/features/sadhana/PracticeScreen.tsx`: v14 indigo screen, shared LampRing,
  progress-dependent copy, review tags, Begin sitting, Samatha/Dhyanbhaari path,
  attendance-based unlock, next-class placeholder/card, Events link, notification
  preference switch, and the existing reminder time picker.
- `src/features/sadhana/MandalaScreen.tsx`: destination-named back pill, real
  start/last-sitting dates, large LampRing, the three mock rules with lamp icons,
  review tag, and existing start/continue/daily-limit behavior. A completed
  Mandala offers another cycle through the existing `useStartMandala` hook.
- `src/features/sadhana/PlayerScreen.tsx`: indigo player with the mock's exact
  single-lamp paths and radial glow, stable sitting ordinal, title, instruction,
  gold Play/Pause button, existing real-audio acquisition and silent mock timer,
  loading/guest/locked/missing/unrecorded/error states, and completion/marking.
- `src/features/sadhana/Scrubber.tsx`: v14 track, thumb, fill and time styles;
  preserved drag, tap, keyboard and accessibility actions.
- `src/theme/tokens.ts`: additive `lampFlame`, `hallTrack`, `hallRule`,
  `hallReminderLine`, and `hallNodeLine`. No existing tokens were changed.

Existing thin routes in `src/app/(tabs)/practice.tsx`, `src/app/mandala.tsx`, and
`src/app/player/[id].tsx` already point to these features and required no edits.
The existing shared TabBar selects its indigo variant for Practice.

Removed unreferenced v12 feature files after checking imports across `src`:
`EnrolSheet.tsx`, `MandalaGrid.tsx`, `MandalaStrip.tsx`, `RulesSheet.tsx`, and
`SadhanaScreen.tsx`, all under `src/features/sadhana/`.

## Data contract

**No contract additions or changes.** Screens use only `@/data`; the existing
Mandala, practice unlock, notification, profile and player hooks were sufficient.
`usePracticePlayer.ts` and all Mandala counting/backend logic are unchanged.

## Required verification

Node `v22.18.0`; exports/lint used `EXPO_NO_DOTENV=1`. Both backend keys were
confirmed absent without reading their values or any `.env` file.

```text
$ npx tsc --noEmit
(no diagnostics)
exit 0

$ npx expo lint
(no diagnostics)
exit 0

$ npm test
# tests 45
# suites 0
# pass 45
# fail 0
# cancelled 0
# skipped 0
# todo 0
exit 0

$ CI=1 npx expo export --platform web --output-dir /tmp/mg-v14-hall
Exported: /tmp/mg-v14-hall
exit 0

$ git diff --check
(no diagnostics)
exit 0
```

Complete command output is in `typecheck.txt`, `lint.txt`, `tests.txt`, and
`export.txt`. `typecheck.txt` and `lint.txt` are empty because both commands
succeeded without diagnostics. The literal directory `/tmp/mg-v14-hall` was
removed after screenshot QA, and the localhost server and Chrome were closed.

This worktree initially had no dependencies. The offline lockfile install lacked
one font tarball, so the foundation checkout's installed dependencies were copied
into this checkout's ignored `node_modules`. No package/lockfile changes resulted.

## Screenshots and visual verification

Chrome executable: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
Playwright: `/Users/sameer/.npm/_npx/9833c18b2d85bc59/node_modules/playwright`.
Navigation/interaction viewport was 390 × 844 CSS pixels, device scale factor 2.
`Practice-viewport.png` and `Mandala-viewport.png` preserve that exact viewport.
For full-height capture of React Native Web's internal ScrollViews, the viewport
height was expanded to the measured content height after inspection, preserving
390 CSS pixels in width and 2× resolution. Stack transitions settled before capture.

| Screen | Mock | App | Comparison |
| --- | --- | --- | --- |
| Practice | 780×2526 | 780×2524 | Primary button y=972–1079px and class card y=1728–2001px match exactly. |
| Mandala | 780×1814 | 780×1812 | Primary button y=1624–1731px matches exactly. |
| Player | 780×1688 | 780×1688 | Mean absolute RGB difference 0.1648 / 0.1582 / 0.1519 on a 0–255 scale. |

See `Practice.png`, `Mandala.png`, `Player.png`, and `visual-comparison.txt`.
All three final screenshots were visually inspected against the locked mocks.

## Interaction checks

All 13 browser assertions passed; details in `interactions.txt`. Covered:

- No autostart, Play/Pause, and accessible keyboard seeking.
- End of sitting, explicit marking, ring count changing 10→11, duplicate marking
  disabled, and the daily limit reflected on Mandala and Practice.
- Reminder switch in both directions and saving 7:30 AM with the time picker.
- See classes opening the existing Events route.
- Dhyanbhaari changing from locked to playable through the existing gallery's
  mock attendance toggle, and its labelled mock timer starting on Play.
- Guest progress shows zero personal lamps; Begin on Practice/Mandala routes to
  Welcome; a guest player deep link shows sign-in without playback controls.

Zero browser page errors. External network requests were blocked during QA.
Mock sign-in used invented demo phone/code values, explicitly authorized by the
user after an automatic approval block. No real phone numbers or SMS were used.

## Known differences and limits

- The fixture's last sitting is 5 November, so Mandala renders that real date
  instead of the mock's fixed “yesterday”.
- BackPill keeps the shared accessible 44pt target (mock drawing: 40pt). Hero
  spacing compensates so the title and ring remain aligned. Practice and Mandala
  full-height captures are 1pt shorter overall than the static mocks.
- The unrecorded Dhyanbhaari catalogue entry has duration 0. In mock mode only,
  its unlocked player uses the existing Samatha demo timer duration and clearly
  says `[Approved guide and audio to come. Mock sitting timer.]`. Live mode still
  shows audio unavailable until approved duration/media are supplied.
- Samatha retains the existing silent timer in zero-key mode. No live audio,
  Clerk/Convex request, device audio, or native notification delivery was tested.
  Reminder controls update the existing preferences; notification scheduling
  remains the existing application behavior.
- Automatic approval review rejected an optional bulk UI simulation of the
  remaining sittings as exceeding its interpreted QA scope. No bulk marking was
  performed. The passing suite covers forty counted sittings, the fortieth
  completion, prevention of a forty-first, no expiry, and the daily limit. The
  browser directly verified one completed and marked sitting.
- Linked legacy Events and the reused time-picker sheet keep their existing
  styling; both are outside this screen redesign's assigned scope (the picker
  itself was retained unchanged).

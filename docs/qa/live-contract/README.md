# Live contract completion — milestone QA

Recovered 22 unfinished files from the separate `t3-bdf66b4b` worktree, whose base
was the merged release head `281d967`. Its original files and the other worktrees
were left untouched. GitHub had no open PRs; PRs 1–5 were merged. Implementation
continues on `feature/live-contract-completion`, based on `release/0.1.0`.

## Checks

Using Node 22.18.0:

- `npx tsc --noEmit` — pass.
- `npx tsc --noEmit -p convex/tsconfig.json` — pass.
- `npx expo lint` — pass, no warnings.
- `npm test` — 33 passing tests. Covers private writes, minor consent, evidence
  permissions, original author and revision retention, approved rollback, source
  visibility, episode search, private/nonregressing read position, event cutoffs,
  IST rollover, enrollment expiry, idempotent completion and donation settlement,
  concurrent registration/completion, and mock sign-out isolation.
- `CI=1 npx expo export --platform web --output-dir /tmp/mg-web` — pass.
- `git diff --check` — pass.
- `npx convex codegen --typecheck enable` — not run to completion: CLI requires
  `CONVEX_DEPLOYMENT`. Checked-in typed bootstrap bindings derive the new endpoints
  from the schema/modules; regenerate them when provisioning a development project.

## Phone-size visual and interaction QA

Shared T3 browser, 390×844 CSS pixels, 2× PNG. Each `*-comparison.png` places the
**top 844pt of the v3 mock on the left** and the **app viewport on the right**.
Raw `*-build.png` images are supplied too. The mock's long browsing frames have
no tab bar in this crop; the app correctly pins the real tab bar in the viewport.
The comparison is visual evidence, not a pixel-equality assertion.

| Screen | Mock beside build |
| --- | --- |
| Welcome | [Comparison](welcome-comparison.png) |
| Setup | [Comparison](setup-comparison.png) |
| Home | [Comparison](home-comparison.png) |
| Wisdom | [Comparison](wisdom-comparison.png) |
| Sādhanā | [Comparison](sadhana-comparison.png) |
| Mandala | [Comparison](mandala-comparison.png) |
| Player | [Comparison](player-comparison.png) |
| Profile | [Comparison](profile-comparison.png) |
| Sangha | [Comparison](sangha-comparison.png) |
| Paramparā | [Comparison](parampara-comparison.png) |
| Donate | [Comparison](donate-comparison.png) |
| Episode | [Comparison](episode-comparison.png) |
| Guru Vākyam | [Comparison](vakyam-comparison.png) |

No runtime errors were reported during these checks. Corrected web status-bar
spacing across screens; native layouts continue using device safe-area insets.
Shared sheets scroll, avoid the keyboard on iOS, expose a visible 44pt Close
button, and support backdrop/Back/Escape dismissal. Checked the language sheet's
disabled Hindi/Telugu options and coming-soon explanation.

Exercised phone → OTP → adult setup; player keyboard `End` → sitting complete →
mark once (318→319); sign-out → a different phone → blank setup; minor selection
→ guardian request → pending wording → guest browsing with no old name/resume;
guest `/donate` deep link → Welcome. Backend tests separately cover trusted consent
approval and age-band bypass rejection. See [pending consent](guardian-pending.png)
and [language sheet](language-sheet.png).

Expected visual/content differences: current IST date and Mandala day replace the
mock's frozen November 6/day 12; profile name/roles/preferences reflect actual
setup; Sign out is an additional working row; donation purposes include the full
fixture list; the episode uses existing approved-pending placeholder content rather
than copying unapproved narrative from the mock. Minor typography/spacing variations
remain in inherited screens (notably Sādhanā). Full pixel equality and physical
Expo Go device validation remain outstanding.

## Contract changes

All prior data exports remain. Added `Session` with `canUsePersonalFeatures`,
`usePracticeAudio`, `useExternalLinks`, `useOpenWhatsApp`, `useCurrentTime`, and
`useDonationResult`. Reading-position saves are asynchronous. Live query hooks
retain `undefined` for loading and `null` for an absent singleton. Screens handle
previously synchronous fixture reads as loading/empty states.

Backend adds episode search in `{vakyams, episodes}`, single-episode read position,
explicit volunteer name/phone, contact settings, vibhaga/pathway detail endpoints,
a minimal guardian-request outbox, and independently approved staged revisions.
New schema fields on existing tables are optional. Mock mode clears account data
and prevents delayed private writes from a signed-out session.

## Hosted/device limitations

No Clerk/Convex environment keys were available. Hosted OTP delivery, restored
native sessions, SecureStore persistence, scheduler reactivity, physical Expo Go,
and live playback therefore need deployment/device smoke tests before release.
Both public keys must be present to activate live mode; partial configuration
stays in mock mode. SDK 58 dependencies were installed through `expo install`.

Guardian requests queue minimal contact/age data; SMS delivery and trusted evidence
verification are not integrated. Only restricted verifier/admin APIs grant consent.
Live donations create a pending record and subscribe for verified settlement; UPI
checkout and authenticated provider webhook infrastructure remain unconfigured.
Approved audio/storage must be supplied. Account deletion removes Convex records
and signs out; deleting the Clerk identity still needs account-service integration.
Clerk Expo 2.20.1 is pinned for the recovered API and deprecated upstream; migrate
to Core 3 with hosted tests before production. Dependency installation reported
26 moderate transitive advisories; no blanket dependency upgrades were attempted.
Search streams published indexes for accent/prefix matching and needs bounded
indexing at larger corpus sizes. Rerun the idempotent seed on an existing dev
deployment to initialize the stored clock and seeded event boundary jobs.

No deployment or merge was performed. Required Opus review is pending.

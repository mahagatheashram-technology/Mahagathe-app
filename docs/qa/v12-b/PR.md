Suggested title: **feat: apply v12 onboarding, Wisdom, Sangha, lineage, and giving designs**

Base: `release/0.1.0`

Replace the v3 layouts for Welcome, Setup, Wisdom, Guru Vākyam, Episode, Sangha, Paramparā, and Give with the locked v12 designs. Add destination back pills and reusable icon list rows, and move search/themes and seva destinations into quiet hubs. Preserve phone OTP, minor consent, reading position, questions, registration, and donation outcomes.

Guru Vākyam's Source sheet includes the existing report action and report sheet. Episode retains its source at the end using `episode.boriRange`. Give starts with no selected amount, reveals purpose/custom-amount/abroad details on request, and labels the UPI action with the selected amount.

**Contract change:** add `AgeBand = 'unspecified'` (“Prefer not to say”), treated as not a minor by the existing mock hook and accepted by Convex. Hook names/signatures are unchanged. Two regression tests cover the new age option. Fixture copy matches the v12 design and keeps editorial placeholders.

**Screenshots:** eight side-by-side 1× comparisons plus source, report, episode-end, registration, and donation captures are in `docs/qa/v12-b/`; see its README. The tab navigator and five screens owned by the parallel implementation were untouched, so those tab-bar differences remain visible pending integration.

**Validation:** Node 22, zero keys. App and Convex typechecks pass; Expo lint passes without warnings; all 35 tests pass; web export passes. Headless Chrome CDP at 390×844 DPR 2 verifies navigation, setup, reading restoration, Source → Report, registration, amount selection/payment, and guest guards without runtime errors. Native Expo Go device verification remains for integration.

```sh
npx tsc --noEmit
npx tsc --noEmit -p convex/tsconfig.json
npx expo lint
npm test
CI=1 npx expo export --platform web --output-dir /Volumes/NithinSameer/Personal/Mahagathe/.agent-work/v12b/web
```

No blocking open questions. Changes are uncommitted for the orchestrator to commit, open, and review; no PR was opened by the implementation agent.

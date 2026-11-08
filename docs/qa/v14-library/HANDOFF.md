# v14 library implementation handoff

Worktree: `/Users/sameer/.t3/worktrees/Mahgate(app)/t3-49a2e528`.
Changes are uncommitted for the orchestrator. No git write commands or PR operations were performed. No environment file was read or edited. No new dependencies were added.

## Implemented

- Wisdom: palm-leaf header and search entry, today's word and portrait, reading leaf, latest two Vākyams, data-derived total, all four series covers, Saptagita link, lineage card.
- `/teachings`: newest-first month groups, theme radios without counts, independent accessible save controls, loading and empty states. Old `/wisdom-theme/[theme]` links now open the same catalogue with the theme selected.
- `/search`: live input, clear and no-results states, Vākyams before episode leaves, meaning-ranking example, required retrieval-only note and theme link. Mock retrieval ignores stop words and bracket-only placeholders. The Bhīṣma example uses explicit fixture retrieval tags, without generated text.
- `/series/[id]`: generic coloured header, motif, Devanagari title, descriptions, part schedules, persistent/cancellable local interest flag. Mahabharata has per-episode read/current states, actual completion count, Continue, Start again, and future parvas. IKS has a free first session, access-controlled later sessions, recording placeholders, and the review-marked access sheet without prices or purchase links.
- Episode: v14 reading layout, 18.5pt Eczar default, existing size control, saved position restoration, reflection/questions sheet, next episode completion, and episode selection. Back to Ādi Parva opens the series list; holding that control opens the existing in-reader episode picker and has an accessibility hint.
- Vākyam: portrait attribution, meaning, source/report, save/unsave, system sharing, related previews, and sign-in-gated practice.
- Lineage: portrait header, binding introduction/title, placeholder biography, four Paramparā entries, and full-list approval sheet. The old Sangha ParamparaCard export now reuses the v14 lineage card.

## Additive contract work

- `SeriesNotification` and `useSeriesNotification(seriesId)` in types, selector, mock and live implementations. `{ enabled: boolean | undefined, setEnabled(enabled): Promise<void> }`. Device-local persistence uses localStorage on web and Expo SecureStore on native, with serialized writes and surfaced storage errors. It records interest; it does not schedule push delivery.
- `useExternalLinks()` now also returns `saptagita` and `saptagitaWeb`. Scheme `saptagita://` and package `com.mahagathe.saptagita` were verified from the sibling app's Expo config. Native first attempts the scheme; the web/store fallback is the Android Play Store URL. The supplemental configuration is separate from the old Convex seed links shape.
- Optional `Vakyam.related?: { id?: string; text: string; date: string }[]`. Mock detail results supply the exact two v14 related placeholders from a separate fixture export. An unpublished preview without an ID leads to its theme catalogue. The live hook accepts this optional field and falls back to approved same-theme Vākyams when absent. The backend thread can mirror the optional metadata when publishing real related entries; no backend files were changed here.
- Fixture copy/dates, episode 3 text/reference/reflection, Rāmāyaṇa description/schedule, the 68th Paramparā placeholder and future-parva schedules follow the mocks. Initial mock reading positions now include completed episodes 1 and 2 alongside the existing episode 3 position.

All existing shared exports remain available. No shared UI or theme files were edited.

## Verification outputs

Node `22.18.0`, `EXPO_NO_DOTENV=1`:

```text
$ npx tsc --noEmit
[no diagnostics]
exit 0

$ npx expo lint
[no diagnostics]
exit 0

$ npm test
1..45
# tests 45
# suites 0
# pass 45
# fail 0
# cancelled 0
# skipped 0
# todo 0
exit 0

$ CI=1 npx expo export --platform web --output-dir /tmp/mg-v14-library
Exported: /tmp/mg-v14-library
exit 0
```

Full logs: `typecheck.txt`, `lint.txt`, `tests.txt`, `export.txt`. `git diff --check` passes. Assigned screen scan finds no forbidden names, hard-coded hex values or fontWeight declarations.

`interactions.txt` records 15 passing browser checks, including the guest gates and signed-in save, report, restore and completion flows. Mock OTP and adult setup were exercised through the UI, without bypassing account state.

## Visual QA

Headless Chrome executable: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
Playwright: `/Users/sameer/.npm/_npx/9833c18b2d85bc59/node_modules/playwright`.
Every capture starts at a 390×844 CSS viewport with deviceScaleFactor 2. `*-viewport.png` preserves that viewport; full-height PNGs expand the viewport to include the React Native ScrollView content and real tab bar, then capture at the same 390pt width and 2× scale. The preview tool clipped long screenshots, so the requested headless Chrome setup produced the final files.

Main screens: `Wisdom.png`, `Words.png`, `Search.png`, `Series.png`, `Mahabharata.png`, `IKS.png`, `Episode.png`, `Vakyam.png`, `Lineage.png`. Additional coverage: `Pashupata.png`, `Theme-work.png`, `IKS-access-sheet.png`. Each main screen has a `compare-<Screen>.png` with the reference on the left and app on the right. `screenshots.json` records dimensions and browser errors. `comparison-heights.md` records full-height differences. `capture.cjs` and `interactions.cjs` reproduce the checks against a server at localhost:8764.

## Remaining differences / limits

- Native touch targets are at least 44pt, including the mock's 40pt back pills/theme chips and smaller text links. Font line wrapping and these targets cause modest height differences; see the comparison table. Dates use the actual fixture date instead of hard-coded “today”/“yesterday”.
- The two unpublished related previews open the theme catalogue until approved detail IDs exist.
- IKS recordings and episode 3 questions are awaiting approved material. Their controls open clear placeholders/review sheets. The full seventy-name list also remains an approval placeholder.
- Notification interest is local only. Native Saptagita launch, an iOS App Store fallback, system share-sheet delivery, and provider-backed Convex/Clerk behavior were not exercised by web QA. The deep-link scheme is verified; the fallback URL targets Android.
- Full-page screenshot capture begins at the top even for the seeded episode 3 resume position; a separate browser interaction verifies that ordinary reopening restores the reading position.

The literal `/tmp/mg-v14-library` export folder is removed after QA. The temporary static server is stopped.

Complete source/artifact inventory: `FILES.txt`.

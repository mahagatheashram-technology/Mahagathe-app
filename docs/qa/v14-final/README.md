# v14 final visual QA

Web export of the merged `release/0.1.0` build (mock mode, zero keys, no external requests: none were
made), Chrome headless at 390×844 @2×, full content height, signed in through the local mock sign-in
(invented demo phone `9123456789`, code `123456`).

- `<MockName>.png`: the app. `compare-<MockName>.png`: mock left, app right.
- `V13Profile-no-result.png`: Profile before the Gunometer is taken (the Profile comparison uses the state
  after the quiz, like the mock). `flows.txt`: raw click-through log.
- Console errors and external requests during both runs: **none**.

## Screens

| Screen | Matches? | Differences |
|---|---|---|
| V13Welcome | Yes | None visible. |
| V131GunaInvite | Yes | "24 short questions" vs the mock's "Twenty-five": the ported guna-profile source has 24 core items (documented in `docs/qa/v14-guna/HANDOFF.md`). |
| V13Home | Yes | Pixel-close. App is 12px taller from the tab bar's safe-area padding. |
| V131HomeAnswer | Yes | Same. |
| V131YakshaCard | Yes | Card identical. App adds the Share / Close buttons below it (needed). |
| V13Practice | Yes | None visible. |
| V13Mandala | Yes | "Last sitting 5 November" instead of "yesterday" (computed from the real date). |
| V13Player | Yes | Instruction line explains the silent mock timer ("the recording is not added yet"). |
| V13Wisdom | Yes | Dates are absolute ("6 November") where the mock says "yesterday"/"today". The Saptagita row and lineage card are 6–8px shorter. |
| V13Words | Yes | Save icon is the 44pt target, so a few quotes wrap one line earlier. Dates absolute. |
| V13Search | Yes | Same bookmark and date notes. |
| V13Series | Yes | None visible. |
| V131IKS | Yes | None visible. |
| V13Mahabharata | Yes | Part blurb differs slightly ("The bard at Naimiṣa, the serpent sacrifice, the Kuru line." vs "The beginning: the bard…"): fixture placeholder copy, left as is. |
| V13Episode | Yes | New visible "All episodes" link on the meta line (Part A item 4). Body wraps a little earlier. |
| V13Vakyam | Yes | "Share" and "Source and report" are underlined in the app (link affordance); the mock has them plain. |
| V131Lineage | Yes | Back pill is now clearly visible over the portrait (Part A item 1). |
| V13Sangha | Mostly | "Coming up" starts at 14 Nov because the 8 Nov sitting has already passed on the device clock. Photo strip shows 2 of 4 cards, same as the mock's scroll. |
| V131Program | Yes | Shows the registered state ("You're going", "Cancel my place") because the fixture class is registered; the mock shows the unregistered state. Next class found through the new `pathwayId`. |
| V13Donate | Yes | Default purpose is "Where it is most needed" (no seva was chosen), so the helper line is the placeholder `[What ₹501 does, to confirm]`; the mock was drawn from the Bhaṇḍāra entry. |
| V13Profile | Yes | Mock's Rajas 42% vs the app's own result; same layout. |
| V131GunaQuestion | Yes | "12 of 24", question text wraps slightly differently (source wording). |
| V131GunaResult | Yes | Percentages and recommendation wording come from the ported source and differ from the mock's. |
| V131GunaCard | Yes | Card identical in layout. App adds the close and Share buttons around it. |

No clear regression found (colours, missing elements, navigation, naming): nothing needed fixing in Part B.
Naming grep (`Gurudev`, `Mahagate[^h]`) is empty in `src` and `convex`.

## Flows

| Flow | Result |
|---|---|
| Home → Begin sitting → player (Sitting 11 of 40) | PASS |
| Player → play → run to end → "Mark today's sitting" → "Today's sitting is marked" → Mandala shows 11 | PASS |
| Yakṣa wrong answer ("Time"): reveals "The mind.", reference, meaning, Share as a story, "New question tomorrow" | PASS |
| Yakṣa answer persists after signing out and in (same phone) | PASS |
| Yakṣa "Just show me" reveals the answer | PASS |
| Wisdom → search field → type → "Closest in meaning" results | PASS |
| Search result → series episode opens the reader | PASS |
| Episode → visible "All episodes" link → series page | PASS |
| Series page → "Continue" opens an episode (not wrongly locked) | PASS |
| IKS locked session → access sheet | PASS |
| Saptagita row on web: click causes no error (no new tab was observed in headless Chrome within 3s, so the store open itself is unverified) | PASS (no crash only) |
| Sangha → Meet Yuva Chetana → program page shows next class (pathwayId) → cancel / join flips | PASS |
| Sangha → Register for Abhyudaya → button becomes "Going" (accessible name "Going to Abhyudaya 2026…") | PASS (checked by hand; the scripted check in `flows.txt` looked for different wording and reports FAIL) |
| Donate → ₹1,001 → Give with UPI → outcome | PASS |
| Profile switch flips (Mahamuni's word) | PASS |
| Guest opening `/` is sent to `/welcome` | PASS |
| Profile → Take the Gunometer → Begin → 24 questions → result → share card → Profile shows the result | PASS (screens captured above) |

Not exercised in a browser: the locked-episode state on `/episode/[id]` (no locked episode exists in the
fixtures, so it can only be seen by changing data); iOS "Install Saptagita from the App Store" message
(web path only).

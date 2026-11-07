# v12 A: Home, Practice, Mandala, Player, Profile

Built by Codex, integrated onto `release/0.1.0` after #9 by the orchestrator.
Screenshots below are from the integrated build (shared `ListRow` / `DetailHeader` from #9).

## Visual evidence

Headless Google Chrome, CDP `Emulation.setDeviceMetricsOverride`: 390×844 CSS pixels,
DPR 2, mobile/touch enabled. Raw screenshots are 780×1688. Browser date is fixed to
7 November 2026 at 9:00 AM IST for comparison. Each image below contains two **1×**
390pt views: reference on the left, implementation on the right.

| Screen | Comparison |
| --- | --- |
| Home | [home-comparison.png](home-comparison.png) |
| Practice | [practice-comparison.png](practice-comparison.png) |
| Mandala | [mandala-comparison.png](mandala-comparison.png) |
| Player | [player-comparison.png](player-comparison.png) |
| Profile | [profile-comparison.png](profile-comparison.png) |

The Profile reference is 390×780; its bottom 64pt is padded with cream in the comparison.
The app remains 390×844. Live content is preserved: the mock store resumes **The Churning
of the Ocean** and its last sitting is **5 November**, rather than the reference's
**The Bard at Naimiṣa** / **yesterday**. These are data differences. On integration, the shared `ListRow` was
set to the mock's rendered metrics (15pt title / 13pt subtitle, 84pt rows), so subtitles no longer wrap.

## Checks

Executed with Node **22.18.0**, no environment keys:

```sh
source ~/.nvm/nvm.sh && nvm use 22
npm install
npx tsc --noEmit
npx tsc --noEmit -p convex/tsconfig.json
npx expo lint
npm test
TMPDIR=/Volumes/NithinSameer/Personal/Mahagathe/.agent-work/v12a CI=1 npx expo export --platform web --output-dir /Volumes/NithinSameer/Personal/Mahagathe/.agent-work/v12a/web
git diff --check
```

All passed; **38 tests** after integration (including #9's age-band test). The export path supersedes the original `/tmp/v12a` requested
before the disk-space update. Export log, server, capture harness, full-resolution
screenshots and interaction-state captures are under:
`/Volumes/NithinSameer/Personal/Mahagathe/.agent-work/v12a/`.

[Browser results](browser-results.json) record the verified device metrics and successful
OTP/setup, tab order, 40-dot rings, rules, avatar/Profile navigation, reminders,
paused-on-open player, timer play/pause, keyboard seek, sitting completion, sign-out
and guest gates. No streak UI remains (`rg` over features, components and routes).
The legacy `streak` and `days` contract fields remain for compatibility/audit.

## Routes and integration

- Replace `(tabs)/sadhana.tsx` with `(tabs)/practice.tsx`: URL `/practice`.
- Move `(tabs)/profile.tsx` to `app/profile.tsx`: URL `/profile`, pushed from Home avatar.
- Four tabs, in order: Home · Practice · Wisdom · Sangha.
- Keep `features/sadhana/SadhanaScreen.tsx` as an export alias for compatibility.
- Uses the shared `ListRow` and `DetailHeader` (`backLabel`) from `@/components/ui`; the temporary
  shims are gone. `theme/v12.ts` from #9 was folded into `theme/tokens.ts`.

## Data/backend

`Mandala` adds `sittingsDone` and `lastSittingAt`; hook signatures are unchanged.
Both mock and live paths count sittings independently of elapsed calendar days.
Mock audit dates extend the legacy first-40-calendar-day array. Mock and backend use
`convex/lib/logic.ts::mandalaRule()` as the D-23 policy boundary: 40 unique IST dates,
at most one counted sitting per IST day (including switching Mandalas), no expiry.
The 40th sitting sets status `completed`. The finished ring remains available from
`mandala.active` until another Mandala is begun. Legacy expired records are left intact;
no new expiry is generated. Rules version is `provisional-sittings-ist-v2`.

Tests cover no-expiry calendar gaps, zero/last-sitting metadata, duplicate input,
IST midnight, the 39→40 transition, retries, refusing a 41st sitting and the daily cap
across successive Mandalas.

## Files and open questions

[Changed-file manifest](changed-files.txt) lists implementation files. QA artifacts are
in this directory. No blocking questions remain. Morning-teaching delivery remains fixed at 7:00 AM because the existing
contract only exposes a configurable daily-practice reminder time; adding a second
configurable time requires a separate contract change.

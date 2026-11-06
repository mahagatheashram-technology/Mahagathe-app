# Mahagathe app — agent & contributor guide

React Native (Expo SDK 58, Expo Router, TypeScript) app for the Mahagathe Foundation.
Spec: `docs/PRD-v0.3.txt` (PDF beside it). Target design: `docs/design/` (see below).
Auth: Clerk (phone OTP). DB/backend: Convex. Same stack as the sibling Saptagita app
(`../sapta-gita`, read-only reference).

## Goal of the current milestone

An **Expo Go–viewable mock** that matches the v3 mocks **pixel-for-pixel** and has their
functionality working (navigation, register, Mandala completion, donate flow, profile toggles…).
It must run with **zero keys** (mock mode). Convex + Clerk switch on only when env keys exist.

## Design source of truth

- `docs/design/mocks/*V3.dc.html` — the HTML mocks. All sizes/colours/spacing are inline styles: copy them exactly.
- `docs/design/screenshots/*V3.png` — rendered at 2× (390pt wide). Compare your screen against these.
- `docs/design/mocks/BrandV3.dc.html` — the system: brand red `#F60000` (logo/Mandala ring only),
  action red `#C20000` (buttons, links, active tab), feature gradient `#CC0000→#9A0A0A`
  (ONE red block per browsing screen), surfaces cream `#FFFBF5` / sand `#F0E8DE` / white card + `#E9DFD3` border.
  Lora = titles & teachings, Poppins = UI, Noto Serif Devanagari = scripture.
- The mocks link screens with `href="XxxV3.dc.html"` — those are the navigation flows to implement.
- `<a href="#…">` anchors in mocks (calendar, vibhaga hubs, pathways, about, rules, Q&A, next episode)
  are screens/sheets not drawn yet: build them in the same visual language, calm style (no red block).
- Mock frame heights include the bottom tab bar; in the app the tab bar is the real navigator, and
  the status bar area is the device's (mocks have ~52px top padding standing in for it).

## Code layout & rules

```
src/app/            routes only (Expo Router). Keep screens thin; compose from features.
src/features/<x>/   screen-specific components (home/, wisdom/, sadhana/, sangha/, profile/, onboarding/)
src/components/ui/  shared primitives: AppText, Button, Icon, Card, Chip, RedFeature, SandBand, Screen, DetailHeader, TabBar
src/theme/tokens.ts every colour, font, radius. Never hard-code a hex in a screen — add a token.
src/data/           THE DATA CONTRACT: hooks.ts + types.ts. Screens import only from '@/data'.
src/providers/      AppProviders (Clerk/Convex go here, gated on env)
convex/             Convex backend (schema, functions, seed)
```

- **Icons**: `<Icon name=…/>` has every icon path from the mocks. Add missing ones there with the exact path. No emoji, no icon fonts.
- **Fonts**: select by family (`fonts.serifSemibold`), never `fontWeight`, so Android renders correctly.
- **Data**: query hooks return `undefined` while loading (show a loading state), `null` for none (show an empty state). Do not import fixtures/mockStore from screens.
- If a screen needs data the contract lacks, add it to `src/data/types.ts` + `hooks.ts` (mock impl) in your PR and say so in the PR body — the backend thread mirrors it in Convex.
- **Guests** (T-01) can read Home and Wisdom. Practice, events registration, donating and profile prompt sign-in (route to `/welcome`).
- Accessibility: real touchables with `accessibilityRole`/`accessibilityLabel`, ≥44pt targets, never colour alone.
- Content is placeholder until approved (PRD D-21) — keep `[placeholders]` as in the mocks; invent no claims (C-7).
- Expo changes every SDK: check versioned docs `https://docs.expo.dev/versions/v58.0.0/` before using an Expo API.
  Install packages with `npx expo install <pkg>` only. Only libraries bundled in **Expo Go** (no custom native code).

## Commands

```bash
npm install
npx expo start            # scan QR with Expo Go
npx tsc --noEmit          # typecheck — must pass
npx expo lint             # lint — must pass
CI=1 npx expo export --platform web --output-dir /tmp/mg-web   # bundling smoke test
```

Visual check: `npx expo start --web` (or the export above + any static server) and screenshot at
390×844 with headless Chrome; compare to `docs/design/screenshots/`.

## Git workflow (mandatory)

- `main` — stable. `release/0.1.0` — integration branch for this milestone.
- Work on `feature/<short-name>` cut from the latest `release/0.1.0`.
- Open a PR **into `release/0.1.0`** (never into main). PR body: what changed, screenshots of
  each screen next to the mock screenshot, any contract (`src/data`) changes, test notes.
- Rebase on `release/0.1.0` before requesting review; resolve conflicts yourself.
- A reviewer (Opus) reviews every PR; the orchestrator merges after approval. Do not merge your own PR.
- Stay inside your assigned files/folders. Shared files (`src/components/ui`, `src/theme`, `src/data`)
  may get small additive changes — never rename or remove existing exports.
- Commit messages end with `Co-Authored-By: <your model> <noreply@…>` as your harness instructs.

# Mahagathe app

The Mahagathe Foundation app: daily Guru Vākyam, Samatha practice and the 40-Day Mandala,
Mahabharata retold from the BORI critical edition, events, seva and dāna.

- Stack: Expo SDK 58 · Expo Router · TypeScript · Clerk (phone OTP) · Convex
- Spec: [`docs/Mahagathe App PRD v0.3.pdf`](docs/) · Design: [`docs/design/`](docs/design/)
- Contributor & agent guide: [`AGENTS.md`](AGENTS.md)

## Run it

```bash
npm install
npx expo start        # scan the QR code with Expo Go (iOS / Android)
```

With no environment keys the app runs in **mock mode** with sample content.
To use the real backend, copy `.env.example` to `.env.local` and fill in the Convex and Clerk keys.

## Backend setup

Use Node.js 22.13+ (22.x), 24.3+ (24.x), or 26+ for Expo SDK 58. This backend was
validated on Node.js 22.18.0. Both public environment keys must be present to select
Clerk + Convex. With neither key, or only one key, the app stays in zero-key mock
mode and does not initialize either service. Restart Expo after changing keys.

1. Copy `.env.example` to `.env.local`.
2. Run `npx convex dev` and create a new Convex project. It sets
   `CONVEX_DEPLOYMENT` and generates the deployment URL. Put the latter in
   `EXPO_PUBLIC_CONVEX_URL`.
3. Create a Clerk app with **phone sign-in and sign-up** enabled, phone-code authentication selected, and the Native API enabled for Expo. Add a JWT template named
   **`convex`**, using Clerk's Convex template (audience `convex`). Put its
   publishable key in `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`.
4. Set **`CLERK_JWT_ISSUER_DOMAIN`** to the Clerk issuer URL in the **Convex
   dashboard environment variables**, then rerun `npx convex dev`. A local value
   alone does not configure the hosted backend.
5. Load the demo content with `npx convex run seed:run`.

The checked-in `convex/_generated/{api,server,dataModel}.ts` files are typed
bootstrap equivalents of Convex's generated files, derived from the real schema
and modules. **`npx convex dev` will regenerate them.** They do not represent a
provisioned or tested cloud deployment. See [Convex's schema documentation](https://docs.convex.dev/database/schemas).

Seed data preserves the app's placeholders and is marked `demo: true`. It is
published specifically for the demo milestone, without claiming editorial or
licence approval. The CMS refuses demo sources for production approvals. Use a
separate development deployment for this seed; replace or archive demo records
before production. Real group counts start at zero: sample group counts and the
sample Mandala grid are retained as typed demo metadata, not fake user activity.

The live session provider calls `profiles.upsertFromIdentity` after Convex has
verified Clerk authentication (including restored sessions). Obtain the user's
Convex ID from `profiles.me`. An operator can bootstrap staff roles through the
Convex dashboard or CLI, for example:

```bash
npx convex run cms:setStaffRoles '{"userId":"<Convex user ID>","roles":["admin"]}'
```

No client mutation can grant itself staff roles. Guardian consent is recorded
only by an admin with a verified evidence reference, or by the internal endpoint
for a future trusted verification service. The child cannot self-attest consent.

Run the backend checks without environment keys:

```bash
npx tsc --noEmit
npx expo lint
npm test
CI=1 npx expo export --platform web --output-dir /tmp/mg-web
```

[Backend API and integration notes](convex/README.md) document endpoint names,
required mutation arguments, provisional Mandala rules, and remaining provider setup.

## Milestone validation and remaining setup

[Phone-size QA and contract changes](docs/qa/live-contract/README.md) include
390×844 comparisons for all 13 v3 app screens, interaction checks, and known
content/layout differences. This is review evidence, not a pixel-equality claim.

The live adapter is implemented but no Clerk/Convex credentials were available
for hosted OTP, native device, or realtime deployment validation. Guardian
requests remain pending until a trusted service/operator verifies consent with
an evidence reference; delivery of the guardian message is not implemented.
Live donations create a pending record and subscribe for a verified result;
UPI checkout and its authenticated provider webhook still need infrastructure.
Approved audio must be uploaded before live playback is available. Mock mode
continues to simulate those flows with no keys. Hindi/Telugu translations are
coming soon; English remains the available interface.

Clerk Expo 2.20.1 is pinned for the recovered custom phone-code API; its upstream
package is deprecated in favor of `@clerk/expo`. A Core 3 migration and hosted
sign-in tests should precede production rollout. Account deletion currently
removes Convex personal activity and signs out; Clerk identity deletion still
requires the account-service integration. No production deployment is implied.

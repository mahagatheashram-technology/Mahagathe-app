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
validated on Node.js 22.18.0. With no keys, the app continues using its existing mocks;
this PR provides the backend and does not switch the app's hooks or providers.

1. Copy `.env.example` to `.env.local`.
2. Run `npx convex dev` and create a new Convex project. It sets
   `CONVEX_DEPLOYMENT` and generates the deployment URL. Put the latter in
   `EXPO_PUBLIC_CONVEX_URL`.
3. Create a Clerk app with **phone sign-in** enabled. Add a JWT template named
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

After signing in and calling `profiles.upsertFromIdentity`, obtain the user's
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

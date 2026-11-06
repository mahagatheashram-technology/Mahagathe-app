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

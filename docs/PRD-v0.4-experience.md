# Mahagathe App PRD v0.4: Experience update

**Status:** Draft for sign-off, 7 Nov 2026. **Scope:** replaces the navigation, screen layout and
copy guidance of v0.3. Everything else in v0.3 still applies: decisions D-01…D-30, content
rules C-1…C-8, functional requirement IDs, data entities and the acceptance scenarios.
**Design source:** `docs/design/v12/` (mocks + screenshots), canvas page "v12 · LOCKED".

## 1. Why this update

Team feedback on v3: the app should *open on a serene, beautiful welcome that invites
people in, not a dashboard*, and every screen after that should be *simple and
unhurried, with little text and one clear next step*. The rest should be revealed gently
as people go deeper, not packed in up front.

We got there through eight rounds of independent, blind design reviews scored against a
100-point rubric. Scores went from 68/66 (v3) to 86/84 (v11). The Claude cross-check
said "ship: yes, with fixes", and those fixes are in v12.

## 2. Experience principles (apply to every screen)

| # | Principle | Rule of thumb |
|---|---|---|
| E-1 | **One job per screen** | Each screen has one purpose and **one red primary action**. |
| E-2 | **Red is rare** | Action red `#C20000` only for: the primary button, Mandala progress, selection marks, the active tab. Secondary links are brown with a chevron. |
| E-3 | **Reveal, don't pack** | Secondary destinations are **icon list rows** one level down, not cards or tiles on the first screen. |
| E-4 | **Say where you're going** | Every detail screen has a back pill that **names its destination** ("‹ Sangha"). |
| E-5 | **Explain our words once** | Sanskrit terms stay. Gloss them where they first appear ("Samatha: calm-abiding meditation"). |
| E-6 | **No pressure** | No streaks, ranks or "missed" language. Progress counts sittings done, never days lost. |
| E-7 | **Warmth from craft, not colour** | Cream/sand surfaces, Lora for teachings, gold line ornament **only** on Welcome, Player and Paramparā. |

## 3. Navigation

- **4 tabs:** Home · Practice · Wisdom · Sangha. *(v0.3 D-14 had 5. Profile moves out of the tab bar. The Sādhanā tab is renamed **Practice**; the route is `practice`.)*
- **Profile:** reached from the avatar at the top right of Home.
- **Full-screen flows** (no tab bar): Welcome, Setup, Player.
- **Detail screens** (pushed, back pill): Mandala, Guru Vākyam, Episode, Paramparā, Give, Profile, plus the undrawn hubs (gatherings list, vibhaga, pathway, past teachings, about).

## 4. Screen by screen

| Screen | Its one job | Contents, top to bottom | Primary action |
|---|---|---|---|
| **Welcome** | Invite people in | Emblem in a gold line mandala, "Mahagathe", Devanagari motto, one-line tagline; quiet language selector top right | **Begin your practice** (secondary: "Look around first") |
| **Sign-in** (unchanged from v0.3/PR #4) | Phone OTP | Phone number, then 6-digit code | **Send code / Verify** |
| **Setup** | Name and age, kindly | Name field; age chips including **"Prefer not to say"**; reason shown above the chips. An under-18 band leads to the existing guardian-consent step (P-04/T-02) | **Continue** |
| **Home** | Start today's sitting | Date + avatar; greeting; **today's sitting card** (title, duration, button, small ring "10 of 40 sittings · Mandala ›"); today's teaching as a **plain quote** (no card) with "Read its meaning ›"; "Continue reading" row | **Begin today's sitting** |
| **Practice** | See and deepen your practice | **Your Mandala** card (40-dot ring, "10 of 40 sittings", View ›); "Sittings" rows: Introductory Samatha, Deepen your practice (learn in person), Daily reminder (links to Profile) | none (the rows are the actions) |
| **Player** | Sit | Close ("⌄ Close"); title, duration; one quiet instruction line; scrubber; play | **Play** (never autostarts, S-07) |
| **Mandala** | See your 40 sittings | Title; **40 dots in a ring**, count in the centre; one-line explanation; "Begun … · last sitting …"; "How the Mandala works" row | **Begin sitting N** |
| **Wisdom** | Read today's teaching, continue the story | Today's teaching card; current Mahabharata episode card; rows: Past teachings, Our lineage | (card taps) |
| **Guru Vākyam** | Sit with today's teaching | Label (theme); large quote; "Gurudev's own words" (or "Paraphrase", C-4); "In simple words"; Share · Source (muted; Source opens the source details with **"Report a wrong source or text"**, W-05); Save top right | **Sit with it · 7 minutes** |
| **Episode** | Read, then reflect | Title; "Episode N of 10 · 8 min · All episodes ›"; prose; a quiet source line at the end ("From the BORI critical edition · Ādi 1.1–15", W-07); **one Reflect block** (question + "Two more questions ›"); Aa Text control | **Next: <title>** |
| **Sangha** | Join the next gathering | Next gathering card (photo, date, place, "View gathering ›"); rows: All gatherings, Offer seva, Give dāna | (card / rows) |
| **Paramparā** | Meet the lineage | Compact header (emblem, "70th head of the lineage", name); one plain paragraph; rows: The full lineage, Dīkṣā milestones; approved quote | (rows) |
| **Give** | Give an amount | "For: Where it is most needed · Change"; **"How much would you like to give?"**: ₹101 / ₹501 / ₹1,001 / Other amount (none preselected); "Giving from outside India?" row; trust line | **Give ₹X with UPI** (while no amount is chosen it reads "Choose an amount to continue" and is disabled) |
| **Profile** | Reminders and account | Avatar, name, "10 sittings in your Mandala", Edit ›; Reminders (time pill under the label when on, "Off · 7:00 AM" when off); Settings (Language, Your data and account); Sign out | none |

## 5. Mandala model (replaces the day-grid in v3)

- **Provisional rule until the teachers decide (D-23):** a Mandala is **40 sittings**. At most **one sitting per day** counts (server-dated, IST). There is **no deadline or expiry**: the Mandala completes at the 40th sitting, however many days that takes. If the teachers later set a window or reset rule, it changes only the server logic and the "How the Mandala works" text, not the screens.
- **Backend change implied:** `convex/lib/logic.ts` currently enforces a fixed 40-day window and expires the Mandala after it. Replace that with "complete at 40 counted sittings, one per IST day", and keep it behind one rule function so D-23 can change it.
- The UI counts **sittings done**; days only appear as metadata ("Begun 26 Oct · last sitting yesterday").
- The visual is always **circular**: a 40-dot ring on Practice and Mandala, a simple ring on Home.
- No "missed" state is shown. The teachers' rules for missed days (D-23) are explained behind "How the Mandala works".
- **Data change:** `Mandala` adds `sittingsDone` (0–40) and `lastSittingAt`, both derived from existing completion records (no new Convex columns). `days[]` stays for history/audit only; `streak` is no longer shown anywhere.
- **Group count (S-11):** shown once, quietly, on the completion state after a sitting ("You sat with 319 others today"), not on the Mandala screen.

## 6. Copy rules

- Plain English, short sentences. Name the action ("Begin sitting 11", "View gathering", "Give ₹1,001 with UPI").
- Attribution: "Gurudev's own words" (verbatim) or "Paraphrase" (C-4).
- No outcome claims (C-7). Donation trust line: "Secure UPI payment · receipt by SMS" (provider pending).

## 7. Changed requirement IDs

| ID | v0.3 | v0.4 |
|---|---|---|
| D-10 | Parampara linked from Home | Paramparā linked from **Wisdom → Our lineage** (still P0, one tap from a tab) |
| D-14 | Five tabs including Profile | **Four tabs**; Profile behind the avatar; Sādhanā renamed Practice |
| H-01 | Guru Vākyam at the top of Home | Still on Home, **below today's sitting card** (the sitting is Home's one job) |
| H-04 | Next three events on Home | Events move to **Sangha**; Home shows only the sitting, the teaching and continue reading |
| H-06 | Small step on Home | **Removed from Home** (can return as a Practice tip later) |
| H-09 | Paramparā link on Home | Paramparā reached from **Wisdom → Our lineage** |
| S-09 | One completion per day, server-dated | Unchanged, plus: no 40-day expiry (provisional, see §5) |
| S-10 | 40-cell grid with streak | **40-dot ring counting sittings**; no streak, no missed state |
| S-11 | Group count shown on Mandala | Group count shown on the **post-sitting completion state** only |
| S-12 | Apply teachers' Mandala rules | Provisional rule in §5 until D-23; one server rule function |
| W-05 | Report a wrong source/text | Moved behind **Source** on Guru Vākyam (still P0) |
| W-07 | Episode shows BORI range | BORI range shown as a **quiet source line at the end** of the episode |
| W-01 | Themes listed on Wisdom | Themes behind **Past teachings** |
| G-07 | Amount + purpose before payment | Purpose as a **compact "Change" row**; amount first; nothing preselected |

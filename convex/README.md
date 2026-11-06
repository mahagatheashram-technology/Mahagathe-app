# Backend API handoff

All public functions validate arguments and return values. Content IDs sent by the
app are the existing fixture slugs (for example `vk-001`, `adi-e1`, `intro-samatha`).
User/activity IDs are actual Convex IDs. Foreign keys in stored records are typed
Convex IDs. App profile roles are separate from operator-only `users.staffRoles`.
`Profile.enrolled` is computed from active, unexpired enrollments; it is not a
client-writable field.

## Hook mapping

| Current hook                                 | Convex endpoint                                                     |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `useProfile`                                 | `profiles.me`                                                       |
| `useUpdateProfile`                           | `profiles.updateProfile({patch})`                                   |
| `useNotificationPrefs`                       | `profiles.notificationPrefs`                                        |
| `useSetNotificationPref`                     | `profiles.setNotificationPref({key,value})`                         |
| `useAccountActions`                          | `profiles.requestDataExport`, `profiles.deleteAccount`              |
| `useTodayVakyam`                             | `wisdom.today`                                                      |
| `useVakyam`                                  | `wisdom.byId({id})`                                                 |
| `useVakyamThemes`                            | `wisdom.themes`                                                     |
| `useVakyamsByTheme`                          | `wisdom.byTheme({theme})`                                           |
| `useSavedVakyam`                             | `wisdom.isSaved({id})`, `wisdom.toggleSaved({id,saved?})`           |
| `useReportContent`                           | `wisdom.report({contentId,reason})`                                 |
| `useSmallStep`                               | `wisdom.smallStep`                                                  |
| `usePractices`                               | `sadhana.practices`                                                 |
| `useTodayPractice`                           | `sadhana.todayPractice`                                             |
| `usePractice`                                | `sadhana.practice({id})`                                            |
| Playback URL (mutation)                      | `sadhana.getPracticeAudioUrl({id})`                                 |
| `useMandala`                                 | `mandala.active`                                                    |
| `useGroupCount`                              | `mandala.groupCount({cycleId?})`                                    |
| `useStartMandala`                            | `mandala.start({practiceId,rulesAccepted:true})`                    |
| `useCompleteMandalaDay`                      | `mandala.completeToday({mandalaId?})`                               |
| `useSeasons`                                 | `itihasa.seasons`                                                   |
| `useSeasonEpisodes`                          | `itihasa.seasonEpisodes({seasonId})`                                |
| `useEpisode`                                 | `itihasa.episode({id})`                                             |
| `useContinueReading`                         | `itihasa.continueReading`                                           |
| `useSaveReadingPosition`                     | `itihasa.saveReadingPosition({episodeId,progress})`                 |
| `useEvents`                                  | `sangha.events({limit?})`                                           |
| `useRegisterForEvent`                        | `sangha.register({eventId})`, `sangha.unregister({eventId})`        |
| `useVibhagas`, `usePathways`, `useParampara` | `sangha.vibhagas`, `sangha.pathways`, `sangha.parampara`            |
| `useDonationOptions`                         | `dana.purposes`                                                     |
| `useCreateDonation`                          | `dana.createDonation({amount,purposeId,currency?,clientRequestId})` |
| `useExternalLinks`                           | `wisdom.externalLinks`                                              |

`useSession` uses Clerk phone OTP in live mode and calls `profiles.upsertFromIdentity({ageBand?})` after Convex verifies the Clerk JWT. There is no backend OTP simulator and no public endpoint accepting a caller's
claimed user ID as authentication.

Mutation additions required by the real backend:

- Explicit `rulesAccepted` is required before starting a Mandala (S-08).
- Pass the displayed Mandala ID when completing. This ties retries to the same
  cycle; omitting it targets the caller's current active cycle.
- Donation amounts are rupees; stored amounts are integer paise. Generate one
  `clientRequestId` per payment intent and reuse it for retries. Currency defaults
  to INR. Donation creation returns `pending`; query `dana.donation({id})` for the
  eventual result. Never treat creation as a successful payment.
- Use `saved: true/false` to make saves retry-safe; an omitted value is a literal
  toggle and intentionally changes state on each distinct invocation.
- Data export is a **query**, returning `{filename,json}` for a client download.
- Queries return `null` when a singleton does not exist; Convex's `undefined` is
  reserved for client loading. Several fixture-backed hooks currently assume
  content exists; their adapters must represent `null` empty states when wired.
- Playback URL requests use a mutation so authorization and expiry checks are
  fresh rather than served from a time-dependent query cache.
- No practice catalogue response contains a storage ID or URL. Request a URL only
  on explicit playback. Restricted descriptions/preparation are blank while locked.
- `seasons.status` is display availability (`published|coming`), separate from its
  editorial lifecycle. `episodeCount` and theme counts count visible records.

## Editorial APIs

`cms.createDraft({slug,payload})` and `cms.updateDraft({slug,payload})` take the
fully typed discriminated union in `lib/validators.ts`. Supported tables are
`sources`, `vakyams`, `practices`, `seasons`, `episodes`, `events`, `vibhagas`,
`pathways`, `parampara`, `donationPurposes`, and `appSettings`.

- `submitForReview`, `approve`, `publish`, `archive`, `createRevision`, `content`,
  and `versions` identify content by `{table,slug}`.
- `publish` additionally accepts optional epoch-millisecond `publishAt` and
  `unpublishAt`; internal `applySchedule` handles boundary transitions and ignores
  stale jobs after withdrawal or revision.
- `listContent({table,status,limit?})` lists staff review items and source-register
  entries; `content({table,slug})` fetches the typed payload.
- `restoreApprovedVersion({versionId})` restores an immutable approved snapshot
  as `approved`; an admin explicitly publishes it again.
- `grantEnrollment({userId,programId,expiry?,reason})` and
  `revokeEnrollment({userId,programId,reason})` require admin access and write
  `enrollmentAudit`. Seeded practices use program ID `samatha`.
- `setStaffRoles({userId,roles})` is internal only, for operators.

Approval and publication both check sources. Practice instructions, Vākyams,
lineage and episodes require an independently approved source with rights
clearance, book, edition, range and review date. Episodes additionally require the
BORI canon, an original-prose confirmation, paragraph-level citation ranges and
valid question answers. The independent reviewer is responsible for verifying
these editorial assertions against the source. Verbatim/paraphrase metadata is
preserved separately. Versions use the same typed payload union as live content.

Hub heads may edit their own hubs and events; an admin designates ownership.
`sangha.eventRegistrations({eventId})` is private to the event owner, vibhaga head,
or admin. Public events expose only the caller's registration flag and remaining
capacity.

## Privacy and provisional rules

- Before age selection/guardian consent, only the minimal authentication mapping,
  age band and consent state are stored. Profile fields supplied with a pending
  minor profile are discarded. Personal-data writes also enforce the gate.
- `profiles.verifyGuardianConsent` requires an admin and verified evidence
  reference. `profiles.recordGuardianConsent` is internal for a future verifier.
- `deleteAccount` deletes private app activity and the app's identity mapping;
  financial records are anonymised for reconciliation. Anonymous group aggregates
  survive deletion. Removing the external Clerk identity requires the Clerk
  account-deletion integration in the next PR.
- Mandala day keys always use **Asia/Kolkata**, computed on the server. Calendar
  days run continuously for 40 days. Missed days remain missed; no automatic
  restart or backfill is invented. Starting another cycle is allowed only after
  the existing cycle expires. These rules remain provisional until D-23.
- Group `cycleId` uses the Mandala's start month (`YYYY-MM`) as a provisional
  cohort. `todayCount` totals all cohorts today; `cycleSittings` totals the requested
  cohort (default: the caller's active Mandala cohort, otherwise the current month). Aggregate rows contain no user identifiers.
- A minute heartbeat invalidates day-dependent and enrollment subscriptions.
  Server-time checks still reject expired content/access even if a scheduled job
  is late. Exact publication/unpublication jobs update lifecycle status.

## External setup still required

The repository is usable and testable without keys. Cloud deployment, real codegen
and end-to-end Clerk authentication require the new Convex and Clerk projects.
Approved audio is not supplied by the fixtures, so free audio currently returns
`null`; upload approved files via trusted operator tooling and attach their
`_storage` IDs through the reviewed CMS workflow. Storage URLs are bearer URLs:
revocation blocks new URL requests; provider-level expiring playback would be a
separate media integration.

Payments deliberately have no fake success path. A future provider integration
must create the real UPI intent and verify webhook authenticity before calling
`dana.markDonationResult` (internal). Guardian identity verification, push-token
registration and reminder delivery similarly require their provider integrations;
this PR stores preferences, reminder time, and verified-consent evidence.

## Contract completion

`src/data/hooks.ts` selects `hooks.mock.ts` or `hooks.live.ts` once per bundle;
all existing exports remain. `Session.canUsePersonalFeatures` separates an
OTP-authenticated session from an account with age/guardian permission. Private
mutations also enforce this permission on the server.

Additional mappings: `useRequestGuardianConsent` → `profiles.requestGuardianConsent`,
`useWisdomSearch` → `wisdom.search` (now `{vakyams, episodes}`),
`useReadingPosition` → `itihasa.readingPosition`, `useVolunteerSignup` →
`sangha.volunteerApply` (explicit `name`, normalized `phone`, consent version),
`useContactInfo` → `sangha.contactInfo`, detail hooks → `sangha.vibhaga/pathway`,
`usePracticeAudio` → `sadhana.getPracticeAudioUrl`, and `useDonationResult` →
`dana.donation`. Account export downloads JSON on web and opens the native share
sheet on a device. `useSaveReadingPosition` is now asynchronous.

The daily clock ticks at 18:30 UTC (midnight IST); event-start and enrollment-expiry
jobs invalidate subscriptions at their own boundaries. Seed initializes the clock
and event jobs. Existing deployments must rerun the idempotent seed for those jobs;
existing grants without jobs refresh at the next daily tick. Query visibility
checks for publication/expiry retain server-time checks as a defense against late
scheduler execution. Search streams the published indexes to preserve accent and
prefix semantics; a large corpus needs a bounded search index before production.

`contentDrafts` stages revisions separately from public rows. Author IDs survive
edits, every participating editor is excluded from self-approval, and publication
atomically installs the independently approved payload. Approved rollback also
stages a replacement until explicit publication. Optional new fields preserve
compatibility with existing volunteer applications/settings/version rows.

Guardian requests store the age band and guardian contact in an outbox, with no
child name or activity. Re-requesting replaces the pending request. A trusted
verifier/admin records evidence through the existing restricted consent APIs;
children cannot grant consent or switch themselves to an adult age band. Delivery
and evidence verification integrations are still required. Never treat the queued
request as sent or approved.

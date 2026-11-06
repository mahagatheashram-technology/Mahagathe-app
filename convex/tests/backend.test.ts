/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { convexTest } from "convex-test";
import type { TestConvex } from "convex-test";
import type { AgeBand } from "../../src/data/types";
import schema from "../schema";
import { api, internal } from "../_generated/api";
import { dayKey } from "../lib/logic";
import * as fixtures from "../../src/data/fixtures";

const modules = {
  "../_generated/server.ts": () => import("../_generated/server"),
  "../profiles.ts": () => import("../profiles"),
  "../wisdom.ts": () => import("../wisdom"),
  "../sadhana.ts": () => import("../sadhana"),
  "../mandala.ts": () => import("../mandala"),
  "../itihasa.ts": () => import("../itihasa"),
  "../sangha.ts": () => import("../sangha"),
  "../dana.ts": () => import("../dana"),
  "../cms.ts": () => import("../cms"),
  "../seed.ts": () => import("../seed"),
  "../clock.ts": () => import("../clock"),
};
type Backend = TestConvex<typeof schema>;

async function setup() {
  const t = convexTest(schema, modules);
  await t.mutation(internal.seed.run, {});
  return t;
}
async function account(
  t: Backend,
  subject: string,
  ageBand: AgeBand = "25-44",
) {
  const client = t.withIdentity({
    subject,
    issuer: "https://clerk.test",
    tokenIdentifier: `https://clerk.test|${subject}`,
  });
  const id = await client.mutation(api.profiles.upsertFromIdentity, {
    ageBand,
  });
  return { client, id };
}
async function staff(
  t: Backend,
  subject: string,
  roles: ("editor" | "reviewer" | "admin")[],
) {
  const result = await account(t, subject);
  await t.mutation(internal.cms.setStaffRoles, { userId: result.id, roles });
  return result;
}
async function approvedSource(t: Backend) {
  const author = await staff(t, "author", ["editor", "reviewer"]);
  const reviewer = await staff(t, "reviewer", ["reviewer"]);
  const admin = await staff(t, "admin", ["admin"]);
  const sourceId = await author.client.mutation(api.cms.createDraft, {
    slug: "verified-source",
    payload: {
      table: "sources",
      data: {
        book: "Mahabharata",
        edition: "BORI critical edition",
        range: "Ādi 1.1–15",
        licenceStatus: "permitted",
        reviewDate: "2026-11-06",
        detail: "Reviewed independently",
        canon: "bori-critical-edition",
      },
    },
  });
  await author.client.mutation(api.cms.submitForReview, {
    table: "sources",
    slug: "verified-source",
  });
  await reviewer.client.mutation(api.cms.approve, {
    table: "sources",
    slug: "verified-source",
  });
  return {
    author,
    reviewer,
    admin,
    sourceId: sourceId as import("../_generated/dataModel").Id<"sources">,
  };
}

void test("seed is idempotent, retains placeholders, and public APIs cover all fixture content", async () => {
  const t = await setup();
  const before = await t.run(async (ctx) =>
    Promise.all([
      ctx.db.query("sources").collect(),
      ctx.db.query("vakyams").collect(),
      ctx.db.query("episodes").collect(),
      ctx.db.query("appSettings").collect(),
    ]),
  );
  await t.mutation(internal.seed.run, {});
  const after = await t.run(async (ctx) =>
    Promise.all([
      ctx.db.query("sources").collect(),
      ctx.db.query("vakyams").collect(),
      ctx.db.query("episodes").collect(),
      ctx.db.query("appSettings").collect(),
    ]),
  );
  assert.deepEqual(after, before);
  assert.deepEqual(
    await t.query(api.wisdom.byId, { id: "vk-001" }),
    fixtures.vakyams[0],
  );
  assert.deepEqual(await t.query(api.sangha.parampara, {}), fixtures.parampara);
  assert.deepEqual(await t.query(api.sangha.pathways, {}), fixtures.pathways);
  assert.equal(
    (await t.query(api.itihasa.seasons, {})).length,
    fixtures.seasons.length,
  );
  assert.equal(
    (await t.query(api.itihasa.seasonEpisodes, { seasonId: "adi" })).length,
    fixtures.episodes.length,
  );
  assert.deepEqual(
    await t.query(api.wisdom.smallStep, {}),
    fixtures.smallSteps[0],
  );
  assert.deepEqual(await t.query(api.wisdom.externalLinks, {}), fixtures.links);
  assert.equal((await t.query(api.dana.purposes, {})).currency, "INR");
  assert.deepEqual(await t.query(api.mandala.groupCount, {}), {
    todayCount: 0,
    cycleSittings: 0,
  });
});

void test("T-01/T-03/T-04: guest reads work; private writes and restricted media are refused", async () => {
  const t = await setup();
  assert.ok(await t.query(api.wisdom.today, {}));
  assert.equal(await t.query(api.profiles.me, {}), null);
  assert.equal(await t.query(api.mandala.active, {}), null);
  assert.equal((await t.query(api.sadhana.todayPractice, {}))?.access, "free");
  assert.equal(
    await t.mutation(api.sadhana.getPracticeAudioUrl, { id: "intro-samatha" }),
    null,
  );
  assert.equal(
    (await t.query(api.sadhana.practice, { id: "attahasa" }))?.locked,
    true,
  );
  await assert.rejects(
    t.mutation(api.sadhana.getPracticeAudioUrl, { id: "attahasa" }),
    /Enrollment/,
  );
  await assert.rejects(
    t.mutation(api.mandala.start, {
      practiceId: "intro-samatha",
      rulesAccepted: true,
    }),
    /Sign in/,
  );
  await assert.rejects(
    t.mutation(api.sangha.register, { eventId: "ev-abhyudaya" }),
    /Sign in/,
  );
  await assert.rejects(
    t.mutation(api.dana.createDonation, {
      amount: 101,
      purposeId: "most-needed",
      clientRequestId: "guest",
    }),
    /Sign in/,
  );
});

void test("T-02/P-04: pending minors store no personal fields and cannot self-grant consent", async () => {
  const t = await setup();
  for (const ageBand of ["under13", "13-17"] as const) {
    const { client, id } = await account(t, ageBand, ageBand);
    await client.mutation(api.profiles.updateProfile, {
      patch: {
        displayName: "Do not store",
        roles: ["student"],
        reminderTime: "06:00",
        language: "hi",
      },
    });
    const profile = await t.run(async (ctx) =>
      ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", id))
        .unique(),
    );
    assert.equal(profile?.guardianConsent, "pending");
    for (const field of ["displayName", "roles", "language", "reminderTime"])
      assert.equal(field in profile!, false);
    assert.equal(
      (await t.run(async (ctx) => ctx.db.get(id)))?.phoneMasked,
      undefined,
    );
    await assert.rejects(
      client.mutation(api.profiles.updateProfile, {
        patch: { ageBand: "25-44" },
      }),
      /support/,
    );
    await assert.rejects(
      client.mutation(api.profiles.setNotificationPref, {
        key: "dailyVakyam",
        value: true,
      }),
      /guardian consent/,
    );
    await assert.rejects(
      client.mutation(api.profiles.verifyGuardianConsent, {
        userId: id,
        consentVersion: "v1",
        evidenceRef: "fake",
      }),
      /admin|guardian consent/,
    );
    await t.mutation(internal.profiles.recordGuardianConsent, {
      userId: id,
      consentVersion: "v1",
      evidenceRef: "verified-proof",
    });
    await client.mutation(api.profiles.updateProfile, {
      patch: { displayName: "Consented student" },
    });
    assert.equal(
      (await client.query(api.profiles.me, {}))?.displayName,
      "Consented student",
    );
  }
});

void test("S-04/T-04: protected storage URL, guides, and profile enrollment respect grants, revocation, and expiry", async () => {
  const t = await setup();
  const { client, id } = await account(t, "sadhaka");
  const { client: admin } = await staff(t, "admin", ["admin"]);
  const storageId = await t.run(async (ctx) =>
    ctx.storage.store(new Blob(["approved audio"])),
  );
  await t.run(async (ctx) => {
    const practice = await ctx.db
      .query("practices")
      .withIndex("by_slug", (q) => q.eq("slug", "attahasa"))
      .unique();
    await ctx.db.patch(practice!._id, {
      audioStorageId: storageId,
      description: "Restricted guide",
      preparation: ["Private preparation"],
    });
  });
  const locked = await client.query(api.sadhana.practice, { id: "attahasa" });
  assert.equal(locked?.description, "");
  assert.deepEqual(locked?.preparation, []);
  assert.equal(JSON.stringify(locked).includes(storageId), false);
  await admin.mutation(api.cms.grantEnrollment, {
    userId: id,
    programId: "other",
    reason: "Different course",
  });
  await assert.rejects(
    client.mutation(api.sadhana.getPracticeAudioUrl, { id: "attahasa" }),
    /Enrollment/,
  );
  await admin.mutation(api.cms.grantEnrollment, {
    userId: id,
    programId: "samatha",
    reason: "Teacher approval",
  });
  assert.equal(
    (await client.query(api.sadhana.practice, { id: "attahasa" }))?.description,
    "Restricted guide",
  );
  assert.ok(
    await client.mutation(api.sadhana.getPracticeAudioUrl, { id: "attahasa" }),
  );
  assert.equal((await client.query(api.profiles.me, {}))?.enrolled, true);
  await admin.mutation(api.cms.revokeEnrollment, {
    userId: id,
    programId: "samatha",
    reason: "Access ended",
  });
  await assert.rejects(
    client.mutation(api.sadhana.getPracticeAudioUrl, { id: "attahasa" }),
    /Enrollment/,
  );
  await t.run(async (ctx) => {
    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_program", (q) =>
        q.eq("userId", id).eq("programId", "other"),
      )
      .unique();
    await ctx.db.patch(enrollment!._id, { expiry: Date.now() - 1 });
  });
  assert.equal((await client.query(api.profiles.me, {}))?.enrolled, false);
  assert.equal(
    (await t.run(async (ctx) => ctx.db.query("enrollmentAudit").collect()))
      .length,
    3,
  );
});

void test("T-05/T-06/T-07/S-09: retries create one completion, audit, and anonymous group increment", async () => {
  const t = await setup();
  const { client } = await account(t, "sitter");
  await assert.rejects(
    client.mutation(api.mandala.start, {
      practiceId: "intro-samatha",
      rulesAccepted: false,
    }),
    /rules/,
  );
  const id = await client.mutation(api.mandala.start, {
    practiceId: "intro-samatha",
    rulesAccepted: true,
  });
  assert.equal(
    await client.mutation(api.mandala.start, {
      practiceId: "intro-samatha",
      rulesAccepted: true,
    }),
    id,
  );
  const first = await client.mutation(api.mandala.completeToday, {
    mandalaId: id,
  });
  assert.deepEqual(
    await client.mutation(api.mandala.completeToday, { mandalaId: id }),
    first,
  );
  assert.deepEqual(await client.mutation(api.mandala.completeToday, {}), first);
  assert.equal(first.day, dayKey(Date.now()));
  const rows = await t.run(async (ctx) => ({
    completions: await ctx.db.query("mandalaCompletions").collect(),
    audit: await ctx.db.query("mandalaAudit").collect(),
  }));
  assert.equal(rows.completions.length, 1);
  assert.equal(rows.audit.filter((row) => row.action === "complete").length, 1);
  assert.equal(rows.audit[1].timezone, "Asia/Kolkata");
  assert.deepEqual(await t.query(api.mandala.groupCount, {}), {
    todayCount: 1,
    cycleSittings: 1,
  });
  const second = await account(t, "second");
  const secondId = await second.client.mutation(api.mandala.start, {
    practiceId: "intro-samatha",
    rulesAccepted: true,
  });
  await second.client.mutation(api.mandala.completeToday, {
    mandalaId: secondId,
  });
  assert.deepEqual(await t.query(api.mandala.groupCount, {}), {
    todayCount: 2,
    cycleSittings: 2,
  });
  const outsider = await account(t, "outsider");
  await assert.rejects(
    outsider.client.mutation(api.mandala.completeToday, { mandalaId: id }),
    /No active/,
  );
  assert.equal((await client.query(api.mandala.active, {}))?.daysSat, 1);
});

void test("T-12: event capacity, repeat registration, cancellation and owner visibility", async () => {
  const t = await setup();
  const owner = await account(t, "owner");
  const first = await account(t, "first");
  const second = await account(t, "second");
  await t.run(async (ctx) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", "ev-abhyudaya"))
      .unique();
    await ctx.db.patch(event!._id, {
      capacity: 1,
      startsAt: Date.now() + 86_400_000,
      ownerId: owner.id,
    });
  });
  const id = await first.client.mutation(api.sangha.register, {
    eventId: "ev-abhyudaya",
  });
  assert.equal(
    await first.client.mutation(api.sangha.register, {
      eventId: "ev-abhyudaya",
    }),
    id,
  );
  await assert.rejects(
    second.client.mutation(api.sangha.register, { eventId: "ev-abhyudaya" }),
    /full/,
  );
  assert.equal(
    (await first.client.query(api.sangha.events, {})).find(
      (row) => row.id === "ev-abhyudaya",
    )?.registered,
    true,
  );
  assert.equal(
    (await t.query(api.sangha.events, {})).find(
      (row) => row.id === "ev-abhyudaya",
    )?.registered,
    false,
  );
  assert.equal(
    (
      await owner.client.query(api.sangha.eventRegistrations, {
        eventId: "ev-abhyudaya",
      })
    ).length,
    1,
  );
  await assert.rejects(
    second.client.query(api.sangha.eventRegistrations, {
      eventId: "ev-abhyudaya",
    }),
    /owner/,
  );
  await first.client.mutation(api.sangha.unregister, {
    eventId: "ev-abhyudaya",
  });
  await first.client.mutation(api.sangha.unregister, {
    eventId: "ev-abhyudaya",
  });
  await second.client.mutation(api.sangha.register, {
    eventId: "ev-abhyudaya",
  });
});

void test("G-06: volunteer application needs consent and is retry-safe", async () => {
  const t = await setup();
  const { client } = await account(t, "volunteer");
  const args = {
    vibhagaId: "adhyaya",
    consentVersion: "v1",
    message: "Available weekends",
  };
  await assert.rejects(
    client.mutation(api.sangha.volunteerApply, { ...args, consent: false }),
    /Consent/,
  );
  const id = await client.mutation(api.sangha.volunteerApply, {
    ...args,
    consent: true,
  });
  assert.equal(
    await client.mutation(api.sangha.volunteerApply, {
      ...args,
      consent: true,
    }),
    id,
  );
});

void test("T-11/G-08: pending INR donations, safe retries, verified internal result, and owner reads", async () => {
  const t = await setup();
  const { client } = await account(t, "donor");
  const input = {
    amount: 101.25,
    purposeId: "most-needed",
    clientRequestId: "payment-1",
  };
  await assert.rejects(
    client.mutation(api.dana.createDonation, { ...input, currency: "USD" }),
    /FCRA/,
  );
  const donation = await client.mutation(api.dana.createDonation, input);
  assert.equal(donation.status, "pending");
  assert.deepEqual(
    await client.mutation(api.dana.createDonation, input),
    donation,
  );
  await assert.rejects(
    client.mutation(api.dana.createDonation, { ...input, amount: 200 }),
    /different donation/,
  );
  const donationId =
    donation.id as import("../_generated/dataModel").Id<"donations">;
  await assert.rejects(
    t.mutation(internal.dana.markDonationResult, {
      donationId,
      amountPaise: 1,
      currency: "INR",
      providerRef: "provider-1",
      status: "success",
    }),
    /does not match/,
  );
  const result = {
    donationId,
    amountPaise: 10125,
    currency: "INR",
    providerRef: "provider-1",
    status: "success" as const,
    receiptRef: "MGF-001",
  };
  await t.mutation(internal.dana.markDonationResult, result);
  await t.mutation(internal.dana.markDonationResult, result);
  assert.equal(
    (await client.query(api.dana.donation, { id: donationId }))?.status,
    "success",
  );
  await assert.rejects(
    t.mutation(internal.dana.markDonationResult, {
      ...result,
      status: "failed",
    }),
    /settled/,
  );
  const outsider = await account(t, "other-donor");
  assert.equal(
    await outsider.client.query(api.dana.donation, { id: donationId }),
    null,
  );
});

void test("T-08/T-09/T-10/C-1: source checks, independent review, publication, withdrawal and approved rollback", async () => {
  const t = await setup();
  const { author, reviewer, admin, sourceId } = await approvedSource(t);
  const id = await author.client.mutation(api.cms.createDraft, {
    slug: "reviewed-vakyam",
    payload: {
      table: "vakyams",
      data: {
        text: "Śāntanu and Gaṅgā",
        meaning: "An original paraphrase.",
        theme: "conduct",
        verbatim: false,
        attribution: "Verified archive",
        sourceId,
        publishDate: dayKey(Date.now()),
      },
    },
  });
  assert.ok(id);
  assert.equal(await t.query(api.wisdom.byId, { id: "reviewed-vakyam" }), null);
  await author.client.mutation(api.cms.submitForReview, {
    table: "vakyams",
    slug: "reviewed-vakyam",
  });
  await assert.rejects(
    author.client.mutation(api.cms.approve, {
      table: "vakyams",
      slug: "reviewed-vakyam",
    }),
    /own work/,
  );
  const versionId = await reviewer.client.mutation(api.cms.approve, {
    table: "vakyams",
    slug: "reviewed-vakyam",
  });
  await admin.client.mutation(api.cms.publish, {
    table: "vakyams",
    slug: "reviewed-vakyam",
  });
  assert.equal(
    (await t.query(api.wisdom.search, { text: "santanu and ganga" })).length,
    1,
  );
  await admin.client.mutation(api.cms.archive, {
    table: "vakyams",
    slug: "reviewed-vakyam",
  });
  assert.equal(await t.query(api.wisdom.byId, { id: "reviewed-vakyam" }), null);
  await admin.client.mutation(api.cms.restoreApprovedVersion, { versionId });
  await admin.client.mutation(api.cms.publish, {
    table: "vakyams",
    slug: "reviewed-vakyam",
  });
  assert.ok(await t.query(api.wisdom.byId, { id: "reviewed-vakyam" }));
  await admin.client.mutation(api.cms.archive, {
    table: "sources",
    slug: "verified-source",
  });
  assert.equal(await t.query(api.wisdom.byId, { id: "reviewed-vakyam" }), null);
  await author.client.mutation(api.cms.createDraft, {
    slug: "sourceless",
    payload: {
      table: "practices",
      data: {
        title: "Draft practice",
        subtitle: "",
        description: "",
        durationSec: 60,
        access: "free",
        preparation: [],
        order: 10,
        programId: "samatha",
      },
    },
  });
  await author.client.mutation(api.cms.submitForReview, {
    table: "practices",
    slug: "sourceless",
  });
  await assert.rejects(
    reviewer.client.mutation(api.cms.approve, {
      table: "practices",
      slug: "sourceless",
    }),
    /approved.*source/,
  );
});

void test("T-10: future and expired published records never leak in queries", async () => {
  const t = await setup();
  await t.run(async (ctx) => {
    const row = await ctx.db
      .query("vakyams")
      .withIndex("by_slug", (q) => q.eq("slug", "vk-001"))
      .unique();
    await ctx.db.patch(row!._id, { publishAt: Date.now() + 86_400_000 });
  });
  assert.equal(await t.query(api.wisdom.byId, { id: "vk-001" }), null);
  await t.run(async (ctx) => {
    const row = await ctx.db
      .query("vakyams")
      .withIndex("by_slug", (q) => q.eq("slug", "vk-001"))
      .unique();
    await ctx.db.patch(row!._id, {
      publishAt: undefined,
      unpublishAt: Date.now() - 1,
    });
  });
  assert.equal(await t.query(api.wisdom.byId, { id: "vk-001" }), null);
  assert.equal(
    (await t.query(api.wisdom.byTheme, { theme: "inner-life" })).length,
    0,
  );
  assert.equal(
    (await t.query(api.wisdom.themes, {})).find(
      (row) => row.theme === "inner-life",
    )?.count,
    0,
  );
});

void test("W-08/P-06/P-08: reading never regresses; preferences, export and deletion are private", async () => {
  const t = await setup();
  const { client, id } = await account(t, "reader");
  await client.mutation(api.profiles.updateProfile, {
    patch: { displayName: "Reader", language: "te", reminderTime: "07:30" },
  });
  await client.mutation(api.profiles.setNotificationPref, {
    key: "dailyVakyam",
    value: true,
  });
  assert.equal(
    (await client.query(api.profiles.notificationPrefs, {})).dailyVakyam,
    true,
  );
  await client.mutation(api.itihasa.saveReadingPosition, {
    episodeId: "adi-e1",
    progress: 0.7,
  });
  assert.equal(
    await client.mutation(api.itihasa.saveReadingPosition, {
      episodeId: "adi-e1",
      progress: 0.2,
    }),
    0.7,
  );
  assert.equal(
    (await client.query(api.itihasa.continueReading, {}))?.progress,
    0.7,
  );
  await assert.rejects(
    client.mutation(api.itihasa.saveReadingPosition, {
      episodeId: "adi-e1",
      progress: 2,
    }),
    /between/,
  );
  assert.equal(
    await client.mutation(api.wisdom.toggleSaved, {
      id: "vk-001",
      saved: true,
    }),
    true,
  );
  assert.equal(await client.query(api.wisdom.isSaved, { id: "vk-001" }), true);
  assert.equal((await client.query(api.wisdom.saved, {})).length, 1);
  const other = await account(t, "other");
  assert.equal((await other.client.query(api.wisdom.saved, {})).length, 0);
  const exported = JSON.parse(
    (await client.query(api.profiles.requestDataExport, {})).json,
  );
  assert.equal(exported.user._id, id);
  assert.equal(exported.profiles[0].displayName, "Reader");
  await client.mutation(api.profiles.deleteAccount, {});
  assert.equal(await client.query(api.profiles.me, {}), null);
  assert.equal(
    (await t.run(async (ctx) => ctx.db.query("readingPositions").collect()))
      .length,
    0,
  );
  assert.equal(
    (await t.run(async (ctx) => ctx.db.query("savedVakyams").collect())).length,
    0,
  );
});

void test("T-06: completions on either side of IST midnight receive separate server days and audit records", async (context) => {
  let now = Date.parse("2026-11-06T18:29:00.000Z");
  context.mock.method(Date, "now", () => now);
  const t = await setup();
  const { client } = await account(t, "midnight-sitter");
  const mandalaId = await client.mutation(api.mandala.start, {
    practiceId: "intro-samatha",
    rulesAccepted: true,
  });
  const first = await client.mutation(api.mandala.completeToday, { mandalaId });
  now = Date.parse("2026-11-06T18:30:00.000Z");
  const second = await client.mutation(api.mandala.completeToday, {
    mandalaId,
  });
  assert.equal(first.day, "2026-11-06");
  assert.equal(second.day, "2026-11-07");
  assert.notEqual(first.id, second.id);
  assert.deepEqual(await t.query(api.mandala.groupCount, {}), {
    todayCount: 1,
    cycleSittings: 2,
  });
  assert.equal((await client.query(api.mandala.active, {}))?.streak, 2);
});

void test("T-07: 100 users contribute to a group count with no public identifiers", async () => {
  const t = await setup();
  for (let i = 0; i < 100; i += 1) {
    const { client } = await account(t, `group-${i}`);
    const mandalaId = await client.mutation(api.mandala.start, {
      practiceId: "intro-samatha",
      rulesAccepted: true,
    });
    await client.mutation(api.mandala.completeToday, { mandalaId });
  }
  assert.deepEqual(await t.query(api.mandala.groupCount, {}), {
    todayCount: 100,
    cycleSittings: 100,
  });
  const aggregate = await t.run(async (ctx) =>
    ctx.db.query("groupCounts").collect(),
  );
  assert.equal(aggregate.length, 1);
  assert.equal("userId" in aggregate[0], false);
});

void test("T-05/T-12: concurrent completion retries and last-place registrations remain atomic", async () => {
  const t = await setup();
  const first = await account(t, "race-first");
  const second = await account(t, "race-second");
  const mandalaId = await first.client.mutation(api.mandala.start, {
    practiceId: "intro-samatha",
    rulesAccepted: true,
  });
  const completions = await Promise.all([
    first.client.mutation(api.mandala.completeToday, { mandalaId }),
    first.client.mutation(api.mandala.completeToday, { mandalaId }),
  ]);
  assert.deepEqual(completions[0], completions[1]);
  assert.equal((await t.query(api.mandala.groupCount, {})).todayCount, 1);
  await t.run(async (ctx) => {
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", "ev-abhyudaya"))
      .unique();
    await ctx.db.patch(event!._id, {
      capacity: 1,
      startsAt: Date.now() + 86_400_000,
    });
  });
  const registrations = await Promise.allSettled([
    first.client.mutation(api.sangha.register, { eventId: "ev-abhyudaya" }),
    second.client.mutation(api.sangha.register, { eventId: "ev-abhyudaya" }),
  ]);
  assert.equal(
    registrations.filter((result) => result.status === "fulfilled").length,
    1,
  );
  assert.equal(
    registrations.filter((result) => result.status === "rejected").length,
    1,
  );
});

void test("A-04/T-10: lifecycle boundary jobs reject early/stale runs and never resurrect withdrawn content", async (context) => {
  let now = Date.parse("2026-11-06T12:00:00Z");
  context.mock.method(Date, "now", () => now);
  const t = await setup();
  const { author, reviewer, admin } = await approvedSource(t);
  await author.client.mutation(api.cms.createDraft, {
    slug: "scheduled-pathway",
    payload: {
      table: "pathways",
      data: { name: "Draft program", about: "[Pending content]" },
    },
  });
  await author.client.mutation(api.cms.submitForReview, {
    table: "pathways",
    slug: "scheduled-pathway",
  });
  await reviewer.client.mutation(api.cms.approve, {
    table: "pathways",
    slug: "scheduled-pathway",
  });
  const publishAt = now + 60_000;
  const unpublishAt = now + 120_000;
  await t.run(async (ctx) => {
    const row = await ctx.db
      .query("pathways")
      .withIndex("by_slug", (q) => q.eq("slug", "scheduled-pathway"))
      .unique();
    await ctx.db.patch(row!._id, { publishAt, unpublishAt });
  });
  const publication = {
    table: "pathways" as const,
    slug: "scheduled-pathway",
    action: "publish" as const,
    boundary: publishAt,
  };
  await t.mutation(internal.cms.applySchedule, publication);
  assert.equal(
    (
      await author.client.query(api.cms.content, {
        table: "pathways",
        slug: "scheduled-pathway",
      })
    ).status,
    "approved",
  );
  now = publishAt;
  await t.mutation(internal.cms.applySchedule, publication);
  assert.equal(
    (await t.query(api.sangha.pathways, {})).some(
      (row) => row.id === "scheduled-pathway",
    ),
    true,
  );
  now = unpublishAt;
  assert.equal(
    (await t.query(api.sangha.pathways, {})).some(
      (row) => row.id === "scheduled-pathway",
    ),
    false,
  );
  await t.mutation(internal.cms.applySchedule, {
    ...publication,
    action: "archive",
    boundary: unpublishAt,
  });
  await admin.client.mutation(api.cms.archive, {
    table: "pathways",
    slug: "scheduled-pathway",
  });
  await t.mutation(internal.cms.applySchedule, publication);
  assert.equal(
    (
      await author.client.query(api.cms.content, {
        table: "pathways",
        slug: "scheduled-pathway",
      })
    ).status,
    "archived",
  );
});

void test("A-07: assigned hub heads may edit only their own hub and cannot reassign ownership", async () => {
  const t = await setup();
  const owner = await account(t, "head");
  const other = await account(t, "other-head");
  const admin = await staff(t, "admin", ["admin"]);
  const data = {
    name: "Hub",
    tagline: "[Tagline]",
    photo: "adhyaya" as const,
    about: "[About]",
    headId: owner.id,
  };
  await admin.client.mutation(api.cms.createDraft, {
    slug: "owned-hub",
    payload: { table: "vibhagas", data },
  });
  await owner.client.mutation(api.cms.updateDraft, {
    slug: "owned-hub",
    payload: {
      table: "vibhagas",
      data: { ...data, about: "[Reviewed by head]" },
    },
  });
  await assert.rejects(
    other.client.mutation(api.cms.updateDraft, {
      slug: "owned-hub",
      payload: { table: "vibhagas", data },
    }),
    /head/,
  );
  await assert.rejects(
    owner.client.mutation(api.cms.updateDraft, {
      slug: "owned-hub",
      payload: { table: "vibhagas", data: { ...data, headId: other.id } },
    }),
    /head/,
  );
  await assert.rejects(
    owner.client.mutation(api.cms.createDraft, {
      slug: "self-appointed",
      payload: { table: "vibhagas", data },
    }),
    /admin/,
  );
});

void test("T-02: correcting an adult profile to a minor purges previously stored personal activity", async () => {
  const t = await setup();
  const { client, id } = await account(t, "age-correction");
  await client.mutation(api.profiles.updateProfile, {
    patch: { displayName: "Erase me" },
  });
  await client.mutation(api.profiles.setNotificationPref, {
    key: "dailyVakyam",
    value: true,
  });
  await client.mutation(api.wisdom.toggleSaved, { id: "vk-001", saved: true });
  await client.mutation(api.profiles.updateProfile, {
    patch: { ageBand: "13-17", displayName: "Discard me" },
  });
  assert.equal(
    (await client.query(api.profiles.me, {}))?.guardianConsent,
    "pending",
  );
  assert.deepEqual(await client.query(api.wisdom.saved, {}), []);
  const prefs = await t.run(async (ctx) =>
    ctx.db
      .query("notificationPrefs")
      .withIndex("by_user", (q) => q.eq("userId", id))
      .collect(),
  );
  assert.equal(prefs.length, 0);
});

import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { ContentTable } from "./lib/content";
import { bySlug } from "./lib/content";
import * as fixtures from "../src/data/fixtures";

/** Insert missing fixture slugs only. Never overwrite editorial changes or
 * create fake users, consents, enrollments, registrations, or completions. */
async function ensure<T extends ContentTable>(
  ctx: MutationCtx,
  table: T,
  slug: string,
  insert: () => Promise<Id<T>>,
): Promise<Id<T>> {
  const existing = await bySlug(ctx, table, slug);
  return existing ? (existing._id as Id<T>) : insert();
}

export const run = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const clock = await ctx.db.query("serverClock").withIndex("by_key", q => q.eq("key", "clock")).unique();
    if (!clock) await ctx.db.insert("serverClock", { key: "clock", updatedAt: Date.now() });
    // This explicit demo-only exception is required by the zero-key milestone.
    // It is NOT editorial approval or rights clearance. Never use these source
    // records to approve production content in the CMS.
    const meta = { status: "published" as const, demo: true };
    const teaching = await ensure(ctx, "sources", "demo-wisdom-source", () =>
      ctx.db.insert("sources", {
        ...meta,
        slug: "demo-wisdom-source",
        book: fixtures.vakyams[0].source.title,
        edition: "[Edition pending approval]",
        range: "[Talk title, date]",
        licenceStatus: "pending",
        reviewDate: "[date]",
        detail: fixtures.vakyams[0].source.detail,
        canon: "teaching",
      }),
    );
    const bori = await ensure(ctx, "sources", "demo-bori-source", () =>
      ctx.db.insert("sources", {
        ...meta,
        slug: "demo-bori-source",
        book: "Mahabharata",
        edition: "BORI critical edition",
        range: "Ādi [range]",
        licenceStatus: "pending",
        reviewDate: "[date]",
        detail: "[Source and rights pending review]",
        canon: "bori-critical-edition",
      }),
    );
    for (const item of fixtures.vakyams) {
      await ensure(ctx, "vakyams", item.id, () =>
        ctx.db.insert("vakyams", {
          ...meta,
          slug: item.id,
          text: item.text,
          meaning: item.meaning,
          theme: item.theme,
          verbatim: item.verbatim,
          attribution: item.attribution,
          sourceId: teaching,
          publishDate: item.date,
        }),
      );
    }
    for (const item of fixtures.practices) {
      await ensure(ctx, "practices", item.id, () =>
        ctx.db.insert("practices", {
          ...meta,
          slug: item.id,
          title: item.title,
          subtitle: item.subtitle,
          description: item.description,
          durationSec: item.durationSec,
          access: item.access,
          preparation: item.preparation,
          order: item.order,
          programId: "samatha",
          sourceId: teaching,
        }),
      );
    }
    const seasonIds = new Map<string, Id<"seasons">>();
    for (const item of fixtures.seasons) {
      const id = await ensure(ctx, "seasons", item.id, () =>
        ctx.db.insert("seasons", {
          ...meta,
          slug: item.id,
          number: item.number,
          roman: item.roman,
          name: item.name,
          devanagari: item.devanagari,
          title: item.title,
          blurb: item.blurb,
          availability: item.status,
        }),
      );
      seasonIds.set(item.id, id);
    }
    for (const item of fixtures.episodes) {
      const seasonId = seasonIds.get(item.seasonId)!;
      await ensure(ctx, "episodes", item.id, () =>
        ctx.db.insert("episodes", {
          ...meta,
          slug: item.id,
          seasonId,
          number: item.number,
          title: item.title,
          readMinutes: item.readMinutes,
          boriRange: item.boriRange,
          paragraphs: item.paragraphs,
          reflection: item.reflection,
          questions: item.questions,
          sourceId: bori,
          ownWordsConfirmed: false,
          paragraphRanges: item.paragraphs.map(() => item.boriRange),
        }),
      );
    }
    for (const item of fixtures.vibhagas) {
      await ensure(ctx, "vibhagas", item.id, () =>
        ctx.db.insert("vibhagas", {
          ...meta,
          slug: item.id,
          name: item.name,
          tagline: item.tagline,
          photo: item.photo,
          about: item.about,
        }),
      );
    }
    for (const item of fixtures.events) {
      await ensure(ctx, "events", item.id, () =>
        ctx.db.insert("events", {
          ...meta,
          slug: item.id,
          title: item.title,
          startsAt: Date.parse(item.startsAt),
          place: item.place,
          timeLabel: item.timeLabel,
          eligibility: item.eligibility,
          capacity: item.placesLeft,
          imageKey: item.imageKey,
          enrollmentRequired: item.id === "ev-sunday-sitting",
          programId: "samatha",
        }),
      );
      const event = await bySlug(ctx, "events", item.id);
      if (event && event.startsAt > Date.now()) await ctx.scheduler.runAt(event.startsAt, internal.cms.refreshEvent, { slug: event.slug, boundary: event.startsAt });
    }
    for (const item of fixtures.pathways) {
      await ensure(ctx, "pathways", item.id, () =>
        ctx.db.insert("pathways", {
          ...meta,
          slug: item.id,
          name: item.name,
          about: item.about,
        }),
      );
    }
    await ensure(ctx, "parampara", "default", () =>
      ctx.db.insert("parampara", {
        ...meta,
        slug: "default",
        ...fixtures.parampara,
        sourceId: teaching,
      }),
    );
    for (const item of fixtures.donationPurposes) {
      await ensure(ctx, "donationPurposes", item.id, () =>
        ctx.db.insert("donationPurposes", {
          ...meta,
          slug: item.id,
          name: item.name,
          tagline: item.tagline,
        }),
      );
    }
    await ensure(ctx, "appSettings", "default", () =>
      ctx.db.insert("appSettings", {
        ...meta,
        slug: "default",
        smallSteps: fixtures.smallSteps,
        donationPresets: fixtures.donationPresets,
        contact: fixtures.contact,
        links: fixtures.links,
        // Preserve visual-demo fixtures without presenting fictitious community
        // activity or theme counts as real server records.
        demoMandalaDays: fixtures.mandalaDays,
        demoGroupCount: fixtures.groupCount,
        demoThemeSummaries: fixtures.themeSummaries,
      }),
    );
    return null;
  },
});

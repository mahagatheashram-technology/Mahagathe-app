import { observeClock } from "./lib/time";
import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getUser, requireConsentedUser, isEnrolled } from "./lib/auth";
import { needPublished, isPublished, sourceApproved } from "./lib/content";
import {
  dayKey,
  dayOffset,
  completionDecision,
  mandalaProgress,
  canAccessPractice,
  MANDALA_TIMEZONE,
  MANDALA_RULES_VERSION,
  MANDALA_LENGTH,
} from "./lib/logic";
import { mandalaResult } from "./lib/validators";

async function present(ctx: Pick<QueryCtx, "db">, item: Doc<"mandalas">) {
  const practice = await ctx.db.get(item.practiceId);
  if (!practice) return null;
  const rows = await ctx.db
    .query("mandalaCompletions")
    .withIndex("by_mandala_day", (q) => q.eq("mandalaId", item._id))
    .collect();
  return {
    id: item._id,
    practiceId: practice.slug,
    practiceTitle: practice.title,
    startDate: item.startDay,
    ...mandalaProgress(
      item.startDay,
      dayKey(Date.now()),
      rows.map((row) => row.day),
    ),
  };
}
export const active = query({
  args: {},
  returns: v.union(mandalaResult, v.null()),
  handler: async (ctx) => {
    await observeClock(ctx);
    const user = await getUser(ctx);
    if (!user) return null;
    const item = await ctx.db
      .query("mandalas")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "active"),
      )
      .unique();
    if (!item || dayOffset(item.startDay, dayKey(Date.now())) >= MANDALA_LENGTH)
      return null;
    return present(ctx, item);
  },
});
export const start = mutation({
  args: { practiceId: v.string(), rulesAccepted: v.boolean() },
  returns: v.id("mandalas"),
  handler: async (ctx, { practiceId, rulesAccepted }) => {
    await observeClock(ctx);
    const user = await requireConsentedUser(ctx);
    if (!rulesAccepted)
      throw new ConvexError(
        "Read and accept the Mandala rules before starting.",
      );
    const practice = await needPublished(ctx, "practices", practiceId);
    if (
      !practice.sourceId ||
      !sourceApproved(await ctx.db.get(practice.sourceId))
    )
      throw new ConvexError("This practice is unavailable.");
    if (
      !canAccessPractice(
        practice.access,
        await isEnrolled(ctx, user, practice.programId),
      )
    )
      throw new ConvexError("Enrollment is required.");
    const now = Date.now();
    const day = dayKey(now);
    const existing = await ctx.db
      .query("mandalas")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "active"),
      )
      .unique();
    if (existing && dayOffset(existing.startDay, day) < MANDALA_LENGTH) {
      if (existing.practiceId !== practice._id)
        throw new ConvexError(
          "Finish your active Mandala before starting another.",
        );
      return existing._id;
    }
    if (existing) {
      await ctx.db.patch(existing._id, { status: "expired" });
      await ctx.db.insert("mandalaAudit", {
        mandalaId: existing._id,
        userId: user._id,
        action: "expire",
        day,
        timezone: MANDALA_TIMEZONE,
        createdAt: now,
      });
    }
    // Provisional group cycles are calendar-month cohorts until D-23 is settled.
    const id = await ctx.db.insert("mandalas", {
      userId: user._id,
      practiceId: practice._id,
      startDay: day,
      cycleId: day.slice(0, 7),
      status: "active",
      rulesAcceptedAt: now,
      rulesVersion: MANDALA_RULES_VERSION,
    });
    await ctx.db.insert("mandalaAudit", {
      mandalaId: id,
      userId: user._id,
      action: "start",
      day,
      timezone: MANDALA_TIMEZONE,
      createdAt: now,
    });
    return id;
  },
});
export const completeToday = mutation({
  args: { mandalaId: v.optional(v.id("mandalas")) },
  returns: v.object({
    id: v.id("mandalaCompletions"),
    mandalaId: v.id("mandalas"),
    day: v.string(),
    createdAt: v.number(),
  }),
  handler: async (ctx, args) => {
    await observeClock(ctx);
    const user = await requireConsentedUser(ctx);
    const item = args.mandalaId
      ? await ctx.db.get(args.mandalaId)
      : await ctx.db
          .query("mandalas")
          .withIndex("by_user_status", (q) =>
            q.eq("userId", user._id).eq("status", "active"),
          )
          .unique();
    if (!item || item.userId !== user._id)
      throw new ConvexError("No active Mandala was found.");
    const now = Date.now();
    const day = dayKey(now);
    const existing = await ctx.db
      .query("mandalaCompletions")
      .withIndex("by_mandala_day", (q) =>
        q.eq("mandalaId", item._id).eq("day", day),
      )
      .unique();
    if (
      completionDecision(item.startDay, day, existing !== null) ===
        "existing" &&
      existing
    ) {
      return {
        id: existing._id,
        mandalaId: item._id,
        day: existing.day,
        createdAt: existing.createdAt,
      };
    }
    if (item.status !== "active")
      throw new ConvexError("This Mandala is no longer active.");
    const practice = await ctx.db.get(item.practiceId);
    if (
      !practice ||
      !isPublished(practice) ||
      !practice.sourceId ||
      !sourceApproved(await ctx.db.get(practice.sourceId)) ||
      !canAccessPractice(
        practice.access,
        await isEnrolled(ctx, user, practice.programId),
      )
    ) {
      throw new ConvexError("Practice access is required.");
    }
    // Convex serialises conflicting index-range reads/writes. Both uniqueness
    // and aggregates are enforced atomically, including simultaneous requests.
    const id = await ctx.db.insert("mandalaCompletions", {
      mandalaId: item._id,
      userId: user._id,
      day,
      createdAt: now,
    });
    const count = await ctx.db
      .query("groupCounts")
      .withIndex("by_cycle_day", (q) =>
        q.eq("cycleId", item.cycleId).eq("day", day),
      )
      .unique();
    if (count) await ctx.db.patch(count._id, { count: count.count + 1 });
    else
      await ctx.db.insert("groupCounts", {
        cycleId: item.cycleId,
        day,
        count: 1,
      });
    await ctx.db.insert("mandalaAudit", {
      mandalaId: item._id,
      userId: user._id,
      action: "complete",
      day,
      timezone: MANDALA_TIMEZONE,
      createdAt: now,
      completionId: id,
    });
    return { id, mandalaId: item._id, day, createdAt: now };
  },
});
export const groupCount = query({
  args: { cycleId: v.optional(v.string()) },
  returns: v.object({ todayCount: v.number(), cycleSittings: v.number() }),
  handler: async (ctx, { cycleId }) => {
    await observeClock(ctx);
    const day = dayKey(Date.now());
    let cohort = cycleId ?? day.slice(0, 7);
    if (cycleId === undefined) {
      const user = await getUser(ctx);
      const activeMandala = user
        ? await ctx.db
            .query("mandalas")
            .withIndex("by_user_status", (q) =>
              q.eq("userId", user._id).eq("status", "active"),
            )
            .unique()
        : null;
      if (
        activeMandala &&
        dayOffset(activeMandala.startDay, day) < MANDALA_LENGTH
      ) {
        cohort = activeMandala.cycleId;
      }
    }
    const today = await ctx.db
      .query("groupCounts")
      .withIndex("by_day", (q) => q.eq("day", day))
      .collect();
    const cycle = await ctx.db
      .query("groupCounts")
      .withIndex("by_cycle_day", (q) => q.eq("cycleId", cohort))
      .collect();
    return {
      todayCount: today.reduce((sum, row) => sum + row.count, 0),
      cycleSittings: cycle.reduce((sum, row) => sum + row.count, 0),
    };
  },
});

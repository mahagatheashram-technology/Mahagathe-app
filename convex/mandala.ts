import { observeClock } from "./lib/time";
import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getUser, requireConsentedUser, isEnrolled } from "./lib/auth";
import { needPublished, isPublished, sourceApproved } from "./lib/content";
import {
  dayKey,
  mandalaRule,
  mandalaProgress,
  canAccessPractice,
  MANDALA_TIMEZONE,
  MANDALA_RULES_VERSION,
} from "./lib/logic";
import { mandalaResult } from "./lib/validators";

async function present(
  ctx: Pick<QueryCtx, "db">,
  item: Doc<"mandalas">,
  now: number,
) {
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
    lastSittingAt: rows.length
      ? new Date(Math.max(...rows.map((row) => row.createdAt))).toISOString()
      : null,
    ...mandalaProgress(
      item.startDay,
      dayKey(now),
      rows.map((row) => row.day),
    ),
  };
}
export const active = query({
  args: {},
  returns: v.union(mandalaResult, v.null()),
  handler: async (ctx) => {
    const now = await observeClock(ctx);
    const user = await getUser(ctx);
    if (!user) return null;
    const item = await ctx.db
      .query("mandalas")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", user._id).eq("status", "active"),
      )
      .unique();
    // Keep the completed ring visible until the sādhaka chooses another Mandala.
    const latest =
      item ??
      (await ctx.db
        .query("mandalas")
        .withIndex("by_user_status", (q) =>
          q.eq("userId", user._id).eq("status", "completed"),
        )
        .order("desc")
        .first());
    return latest ? present(ctx, latest, now) : null;
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
    const existingCount = existing
      ? await ctx.db
          .query("mandalaCompletions")
          .withIndex("by_mandala_day", (q) => q.eq("mandalaId", existing._id))
          .collect()
      : [];
    if (
      existing &&
      !mandalaRule(
        existing.startDay,
        day,
        existingCount.map((row) => row.day),
      ).complete
    ) {
      if (existing.practiceId !== practice._id)
        throw new ConvexError(
          "Finish your active Mandala before starting another.",
        );
      return existing._id;
    }
    if (existing) await ctx.db.patch(existing._id, { status: "completed" });
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
    const active = args.mandalaId
      ? await ctx.db.get(args.mandalaId)
      : await ctx.db
          .query("mandalas")
          .withIndex("by_user_status", (q) =>
            q.eq("userId", user._id).eq("status", "active"),
          )
          .unique();
    const item =
      active ??
      (args.mandalaId
        ? null
        : await ctx.db
            .query("mandalas")
            .withIndex("by_user_status", (q) =>
              q.eq("userId", user._id).eq("status", "completed"),
            )
            .order("desc")
            .first());
    if (!item || item.userId !== user._id)
      throw new ConvexError("No active Mandala was found.");
    const now = Date.now();
    const day = dayKey(now);
    const completed = await ctx.db
      .query("mandalaCompletions")
      .withIndex("by_mandala_day", (q) => q.eq("mandalaId", item._id))
      .collect();
    const countedTodayElsewhere = await ctx.db
      .query("mandalaCompletions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) =>
        q.and(q.eq(q.field("day"), day), q.neq(q.field("mandalaId"), item._id)),
      )
      .first();
    const rule = mandalaRule(
      item.startDay,
      day,
      completed.map((row) => row.day),
      countedTodayElsewhere !== null,
    );
    if (rule.decision === "existing") {
      const existing = completed.find((row) => row.day === day)!;
      return {
        id: existing._id,
        mandalaId: item._id,
        day: existing.day,
        createdAt: existing.createdAt,
      };
    }
    if (rule.decision === "beforeStart")
      throw new ConvexError("This Mandala has not begun yet.");
    if (rule.decision === "dailyLimit")
      throw new ConvexError("Only one sitting can count per IST day.");
    if (rule.decision === "complete")
      throw new ConvexError("This Mandala has no sittings remaining.");
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
    if (
      mandalaRule(item.startDay, day, [...completed.map((row) => row.day), day])
        .complete
    ) {
      await ctx.db.patch(item._id, { status: "completed" });
    }
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
    const now = await observeClock(ctx);
    const day = dayKey(now);
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
      if (activeMandala) {
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

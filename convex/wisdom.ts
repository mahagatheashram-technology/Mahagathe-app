import { observeClock } from "./lib/time";
import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUser, requireConsentedUser } from "./lib/auth";
import { boundedText, dayKey, normaliseForSearch } from "./lib/logic";
import {
  isPublished,
  needPublished,
  publishedBySlug,
  toVakyam,
} from "./lib/content";
import { THEME_LABELS } from "../src/data/types";
import * as V from "./lib/validators";

export const today = query({
  args: {},
  returns: v.union(V.vakyamResult, v.null()),
  handler: async (ctx) => {
    await observeClock(ctx);
    const rows = await ctx.db
      .query("vakyams")
      .withIndex("by_status_date", (q) =>
        q.eq("status", "published").lte("publishDate", dayKey(Date.now())),
      )
      .order("desc")
      .collect();
    for (const item of rows) {
      if (!isPublished(item)) continue;
      const result = await toVakyam(ctx, item);
      if (result) return result;
    }
    return null;
  },
});
export const byId = query({
  args: { id: v.string() },
  returns: v.union(V.vakyamResult, v.null()),
  handler: async (ctx, { id }) => {
    await observeClock(ctx);
    const item = await publishedBySlug(ctx, "vakyams", id);
    return item ? toVakyam(ctx, item) : null;
  },
});
export const themes = query({
  args: {},
  returns: v.array(
    v.object({ theme: V.theme, label: v.string(), count: v.number() }),
  ),
  handler: async (ctx) => {
    await observeClock(ctx);
    const rows = await ctx.db
      .query("vakyams")
      .withIndex("by_status_date", (q) => q.eq("status", "published"))
      .collect();
    const visible = (
      await Promise.all(
        rows.filter((row) => isPublished(row)).map((row) => toVakyam(ctx, row)),
      )
    ).filter((row) => row !== null);
    return (Object.keys(THEME_LABELS) as (keyof typeof THEME_LABELS)[]).map(
      (theme) => ({
        theme,
        label: THEME_LABELS[theme],
        count: visible.filter((item) => item.theme === theme).length,
      }),
    );
  },
});
export const byTheme = query({
  args: { theme: V.theme },
  returns: v.array(V.vakyamResult),
  handler: async (ctx, { theme }) => {
    await observeClock(ctx);
    const rows = await ctx.db
      .query("vakyams")
      .withIndex("by_status_theme", (q) =>
        q.eq("status", "published").eq("theme", theme),
      )
      .collect();
    const results = await Promise.all(
      rows.filter((row) => isPublished(row)).map((row) => toVakyam(ctx, row)),
    );
    return results.filter((row) => row !== null);
  },
});
export const search = query({
  args: { text: v.string(), limit: v.optional(v.number()) },
  returns: v.array(V.vakyamResult),
  handler: async (ctx, { text, limit = 50 }) => {
    await observeClock(ctx);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new ConvexError("Limit must be 1–100.");
    }
    const term = normaliseForSearch(text.slice(0, 200));
    if (!term) return [];
    // Substring matching is deliberate: Convex full-text search tokenises rather
    // than providing the IAST-insensitive substring contract in W-14.
    const rows = await ctx.db
      .query("vakyams")
      .withIndex("by_status_date", (q) => q.eq("status", "published"))
      .collect();
    const matches = rows.filter(
      (row) =>
        isPublished(row) &&
        normaliseForSearch(
          `${row.text} ${row.meaning} ${row.attribution}`,
        ).includes(term),
    );
    const values = await Promise.all(matches.map((row) => toVakyam(ctx, row)));
    return values
      .filter((row) => row !== null)
      .slice(0, Math.max(1, Math.min(100, Math.floor(limit))));
  },
});
export const isSaved = query({
  args: { id: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { id }) => {
    await observeClock(ctx);
    const user = await getUser(ctx);
    const item = await publishedBySlug(ctx, "vakyams", id);
    if (!user || !item) return false;
    return (
      (await ctx.db
        .query("savedVakyams")
        .withIndex("by_user_vakyam", (q) =>
          q.eq("userId", user._id).eq("vakyamId", item._id),
        )
        .unique()) !== null
    );
  },
});
export const toggleSaved = mutation({
  args: { id: v.string(), saved: v.optional(v.boolean()) },
  returns: v.boolean(),
  handler: async (ctx, { id, saved }) => {
    await observeClock(ctx);
    const user = await requireConsentedUser(ctx);
    const item = await needPublished(ctx, "vakyams", id);
    const row = await ctx.db
      .query("savedVakyams")
      .withIndex("by_user_vakyam", (q) =>
        q.eq("userId", user._id).eq("vakyamId", item._id),
      )
      .unique();
    const next = saved ?? !row;
    if (row && !next) await ctx.db.delete(row._id);
    if (!row && next)
      await ctx.db.insert("savedVakyams", {
        userId: user._id,
        vakyamId: item._id,
      });
    return next;
  },
});
export const saved = query({
  args: {},
  returns: v.array(V.vakyamResult),
  handler: async (ctx) => {
    await observeClock(ctx);
    const user = await getUser(ctx);
    if (!user) return [];
    const rows = await ctx.db
      .query("savedVakyams")
      .withIndex("by_user_vakyam", (q) => q.eq("userId", user._id))
      .collect();
    const values = await Promise.all(
      rows.map(async (row) => {
        const item = await ctx.db.get(row.vakyamId);
        return item && isPublished(item) ? toVakyam(ctx, item) : null;
      }),
    );
    return values.filter((row) => row !== null);
  },
});
export const report = mutation({
  args: { contentId: v.string(), reason: v.string() },
  returns: v.id("contentReports"),
  handler: async (ctx, { contentId, reason }) => {
    await observeClock(ctx);
    const user = await requireConsentedUser(ctx);
    return ctx.db.insert("contentReports", {
      userId: user._id,
      contentId: boundedText(contentId, "Content ID", 200),
      reason: boundedText(reason, "Reason"),
      createdAt: Date.now(),
      status: "open",
    });
  },
});
export const smallStep = query({
  args: {},
  returns: v.union(v.object({ text: v.string() }), v.null()),
  handler: async (ctx) =>
    (await publishedBySlug(ctx, "appSettings", "default"))?.smallSteps[0] ??
    null,
});
export const externalLinks = query({
  args: {},
  returns: v.union(V.settingsFields.links, v.null()),
  handler: async (ctx) =>
    (await publishedBySlug(ctx, "appSettings", "default"))?.links ?? null,
});

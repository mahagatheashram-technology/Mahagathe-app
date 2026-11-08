import { groupVakyams } from "../src/data/v14";
import { observeClock } from "./lib/time";
import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getUser, requireConsentedUser } from "./lib/auth";
import { boundedText, dayKey } from "./lib/logic";
import {
  isPublished,
  needPublished,
  publishedBySlug,
  toVakyam,
} from "./lib/content";
import { THEME_LABELS } from "../src/data/types";
import { visibleEpisode } from "./itihasa";
import { foldForSearch, matchesFolded } from "../src/data/search";
import type { WisdomSearchResult } from "../src/data/types";
import * as V from "./lib/validators";

export const today = query({
  args: {},
  returns: v.union(V.vakyamResult, v.null()),
  handler: async (ctx) => {
    const now = await observeClock(ctx);
    const rows = await ctx.db
      .query("vakyams")
      .withIndex("by_status_date", (q) =>
        q.eq("status", "published").lte("publishDate", dayKey(now)),
      )
      .order("desc");
    for await (const item of rows) {
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
  returns: v.object({
    vakyams: v.array(V.vakyamResult),
    episodes: v.array(v.object({ ...V.episodeSummary, seasonTitle: v.string(), boriRange: v.string() })),
  }),
  handler: async (ctx, { text, limit = 50 }) => {
    await observeClock(ctx);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new ConvexError("Limit must be 1–100.");
    const result: WisdomSearchResult = { vakyams: [], episodes: [] };
    const term = text.trim().slice(0, 200);
    if (!term) return result;
    // Indexed, streaming published-only reads preserve W-14's transliteration
    // and word-prefix matching, unlike Convex's tokenised full-text semantics.
    for await (const row of ctx.db.query("vakyams").withIndex("by_status", q => q.eq("status", "published"))) {
      if (!isPublished(row) || !matchesFolded(foldForSearch(`${row.text} ${row.meaning} ${THEME_LABELS[row.theme]} vakyam guru`), term)) continue;
      const value = await toVakyam(ctx, row);
      if (value) result.vakyams.push(value);
      if (result.vakyams.length >= limit) break;
    }
    for await (const row of ctx.db.query("episodes").withIndex("by_status", q => q.eq("status", "published"))) {
      const season = await ctx.db.get(row.seasonId);
      if (!season || !isPublished(season) || !(await visibleEpisode(ctx, row))) continue;
      if (!matchesFolded(foldForSearch(`${row.title} ${season.title} ${row.boriRange} ${row.paragraphs.join(" ")} episode mahabharata`), term)) continue;
      result.episodes.push({ id: row.slug, seasonId: season.slug, number: row.number, title: row.title, readMinutes: row.readMinutes, seasonTitle: season.title, boriRange: row.boriRange });
      if (result.episodes.length >= limit) break;
    }
    return result;
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

/** Vākyams grouped by IST publication month, newest first. */
export const catalogue = query({
  args: { theme: v.optional(V.theme) },
  returns: v.array(v.object({ month: v.string(), label: v.string(), vakyams: v.array(V.vakyamResult) })),
  handler: async (ctx, { theme }) => {
    await observeClock(ctx);
    const rows = theme ? await ctx.db.query('vakyams').withIndex('by_status_theme', q => q.eq('status', 'published').eq('theme', theme)).collect() : await ctx.db.query('vakyams').withIndex('by_status_date', q => q.eq('status', 'published')).order('desc').collect();
    const items = await Promise.all(rows.filter(row => isPublished(row)).map(row => toVakyam(ctx, row)));
    return groupVakyams(items.filter(row => row !== null));
  },
});

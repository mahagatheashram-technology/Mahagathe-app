import { observeClock } from "./lib/time";
import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getUser, requireConsentedUser } from "./lib/auth";
import {
  isPublished,
  needPublished,
  publishedBySlug,
  sourceApproved,
} from "./lib/content";
import * as V from "./lib/validators";

async function visibleEpisode(
  ctx: Pick<QueryCtx, "db">,
  episode: Doc<"episodes">,
) {
  if (!isPublished(episode) || !episode.sourceId) return false;
  const source = await ctx.db.get(episode.sourceId);
  return sourceApproved(source) && source.canon === "bori-critical-edition";
}
async function episodesFor(ctx: Pick<QueryCtx, "db">, season: Doc<"seasons">) {
  const rows = await ctx.db
    .query("episodes")
    .withIndex("by_season_status", (q) =>
      q.eq("seasonId", season._id).eq("status", "published"),
    )
    .collect();
  const visible = await Promise.all(
    rows.map(async (item) => ((await visibleEpisode(ctx, item)) ? item : null)),
  );
  return visible
    .filter((row) => row !== null)
    .sort((a, b) => a.number - b.number);
}
async function present(ctx: Pick<QueryCtx, "db">, item: Doc<"episodes">) {
  const season = await ctx.db.get(item.seasonId);
  if (!season || !isPublished(season) || !(await visibleEpisode(ctx, item)))
    return null;
  const list = await episodesFor(ctx, season);
  const next = list.find((row) => row.number > item.number);
  return {
    id: item.slug,
    seasonId: season.slug,
    number: item.number,
    title: item.title,
    readMinutes: item.readMinutes,
    seasonTitle: season.title,
    totalInSeason: list.length,
    boriRange: item.boriRange,
    paragraphs: item.paragraphs,
    reflection: item.reflection,
    questions: item.questions,
    nextEpisodeId: next?.slug ?? null,
  };
}
export const seasons = query({
  args: {},
  returns: v.array(V.seasonResult),
  handler: async (ctx) => {
    await observeClock(ctx);
    const rows = await ctx.db
      .query("seasons")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return Promise.all(
      rows
        .filter((row) => isPublished(row))
        .sort((a, b) => a.number - b.number)
        .map(async (row) => ({
          id: row.slug,
          number: row.number,
          roman: row.roman,
          name: row.name,
          devanagari: row.devanagari,
          title: row.title,
          blurb: row.blurb,
          episodeCount: (await episodesFor(ctx, row)).length,
          status: row.availability,
        })),
    );
  },
});
export const seasonEpisodes = query({
  args: { seasonId: v.string() },
  returns: v.array(V.episodeResult),
  handler: async (ctx, { seasonId }) => {
    await observeClock(ctx);
    const season = await publishedBySlug(ctx, "seasons", seasonId);
    if (!season) return [];
    const list = await episodesFor(ctx, season);
    const values = await Promise.all(list.map((row) => present(ctx, row)));
    return values.filter((row) => row !== null);
  },
});
export const episode = query({
  args: { id: v.string() },
  returns: v.union(V.episodeResult, v.null()),
  handler: async (ctx, { id }) => {
    await observeClock(ctx);
    const item = await publishedBySlug(ctx, "episodes", id);
    return item ? present(ctx, item) : null;
  },
});
export const continueReading = query({
  args: {},
  returns: v.union(V.readingResult, v.null()),
  handler: async (ctx) => {
    await observeClock(ctx);
    const user = await getUser(ctx);
    if (!user) return null;
    const last = await ctx.db
      .query("readingPositions")
      .withIndex("by_user_updated", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();
    if (!last || last.progress >= 1) return null;
    const item = await ctx.db.get(last.episodeId);
    if (!item || !(await visibleEpisode(ctx, item))) return null;
    const season = await ctx.db.get(item.seasonId);
    if (!season || !isPublished(season)) return null;
    return {
      episode: {
        id: item.slug,
        seasonId: season.slug,
        number: item.number,
        title: item.title,
        readMinutes: item.readMinutes,
        seasonTitle: season.title,
        seasonDevanagari: season.devanagari,
        seasonRoman: season.roman,
      },
      progress: last.progress,
      minutesLeft: Math.max(
        1,
        Math.round(item.readMinutes * (1 - last.progress)),
      ),
    };
  },
});
export const saveReadingPosition = mutation({
  args: { episodeId: v.string(), progress: v.number() },
  returns: v.number(),
  handler: async (ctx, { episodeId, progress }) => {
    await observeClock(ctx);
    const user = await requireConsentedUser(ctx);
    if (!Number.isFinite(progress) || progress < 0 || progress > 1)
      throw new ConvexError("Progress must be between 0 and 1.");
    const item = await needPublished(ctx, "episodes", episodeId);
    if (!(await present(ctx, item)))
      throw new ConvexError("This episode is unavailable.");
    const row = await ctx.db
      .query("readingPositions")
      .withIndex("by_user_episode", (q) =>
        q.eq("userId", user._id).eq("episodeId", item._id),
      )
      .unique();
    const next = Math.max(row?.progress ?? 0, progress);
    // A stale offline retry cannot make an older episode the resume card.
    if (row && next === row.progress) return next;
    if (row)
      await ctx.db.patch(row._id, { progress: next, updatedAt: Date.now() });
    else
      await ctx.db.insert("readingPositions", {
        userId: user._id,
        episodeId: item._id,
        progress: next,
        updatedAt: Date.now(),
      });
    return next;
  },
});

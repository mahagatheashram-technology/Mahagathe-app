import { observeClock } from "./lib/time";
import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getUser, hasPracticeUnlock, requireConsentedUser } from "./lib/auth";
import { canAccessPractice } from "./lib/logic";
import {
  isPublished,
  needPublished,
  publishedBySlug,
  sourceApproved,
} from "./lib/content";
import { practiceResult } from "./lib/validators";

async function visible(ctx: Pick<QueryCtx, "db">, item: Doc<"practices">) {
  return (
    isPublished(item) &&
    item.sourceId !== undefined &&
    sourceApproved(await ctx.db.get(item.sourceId))
  );
}

async function present(
  ctx: QueryCtx,
  item: Doc<"practices">,
  user: Doc<"users"> | null,
) {
  const unlocked = await hasPracticeUnlock(ctx, user, item);
  const allowed = canAccessPractice(item.access, unlocked);
  // Restricted instructions are confidential too. Lists expose only catalogue
  // metadata to non-enrolled users, never storage IDs or signed URLs.
  return {
    id: item.slug,
    title: item.title,
    subtitle: item.subtitle,
    description: allowed ? item.description : "",
    preparation: allowed ? item.preparation : [],
    durationSec: item.durationSec,
    access: item.access,
    order: item.order,
    locked: !allowed,
  };
}
export const practices = query({
  args: {},
  returns: v.array(practiceResult),
  handler: async (ctx) => {
    await observeClock(ctx);
    const user = await getUser(ctx);
    const rows = await ctx.db
      .query("practices")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    const values = await Promise.all(
      rows
        .filter(row => row.slug === "intro-samatha" || row.slug === "dhyanbhaari")
        .sort((a, b) => a.order - b.order)
        .map(async (row) =>
          (await visible(ctx, row)) ? present(ctx, row, user) : null,
        ),
    );
    return values.filter((row) => row !== null);
  },
});
export const practice = query({
  args: { id: v.string() },
  returns: v.union(practiceResult, v.null()),
  handler: async (ctx, { id }) => {
    await observeClock(ctx);
    const item = await publishedBySlug(ctx, "practices", id);
    return item && (await visible(ctx, item))
      ? present(ctx, item, await getUser(ctx))
      : null;
  },
});
export const todayPractice = query({
  args: {},
  returns: v.union(practiceResult, v.null()),
  handler: async (ctx) => {
    await observeClock(ctx);
    const rows = await ctx.db
      .query("practices")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    for (const item of rows
      .filter((row) => row.access === "free")
      .sort((a, b) => a.order - b.order)) {
      if (await visible(ctx, item))
        return present(ctx, item, await getUser(ctx));
    }
    return null;
  },
});
/** A fresh, uncached authorization transaction for each playback request. */
export const getPracticeAudioUrl = mutation({
  args: { id: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { id }) => {
    await observeClock(ctx);
    await requireConsentedUser(ctx);
    const item = await needPublished(ctx, "practices", id);
    if (!(await visible(ctx, item)))
      throw new ConvexError("This practice is unavailable.");
    const user = await getUser(ctx);
    const unlocked = await hasPracticeUnlock(ctx, user, item);
    if (
      !canAccessPractice(
        item.access,
        unlocked,
      )
    ) {
      throw new ConvexError(
        "Enrollment is required to access this practice audio.",
      );
    }
    return item.audioStorageId ? ctx.storage.getUrl(item.audioStorageId) : null;
  },
});

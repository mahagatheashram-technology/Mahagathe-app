import type { QueryCtx } from "../_generated/server";

/** Convex time reads alone do not invalidate subscriptions. A minute heartbeat
 * refreshes daily cards and enrollment flags even when no user writes occur.
 * Exact time checks still use the server clock, so a late job cannot leak content. */
export async function observeClock(ctx: Pick<QueryCtx, "db">): Promise<void> {
  await ctx.db
    .query("serverClock")
    .withIndex("by_key", (q) => q.eq("key", "clock"))
    .unique();
}

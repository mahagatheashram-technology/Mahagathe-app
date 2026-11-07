import type { QueryCtx } from "../_generated/server";

/** Convex time reads alone do not invalidate subscriptions. An IST-midnight tick
 * refreshes daily cards. Item boundaries and enrollment expiry have their own jobs.
 * Exact time checks still use the server clock, so a late job cannot leak content. */
export async function observeClock(ctx: Pick<QueryCtx, "db">): Promise<number> {
  const clock = await ctx.db
    .query("serverClock")
    .withIndex("by_key", (q) => q.eq("key", "clock"))
    .unique();
  return clock?.updatedAt ?? 0;
}

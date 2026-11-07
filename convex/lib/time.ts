import type { QueryCtx } from "../_generated/server";

/** Convex time reads alone do not invalidate subscriptions. An IST-midnight tick
 * refreshes daily cards. Item boundaries and enrollment expiry have their own jobs.
 * Exact time checks still use the server clock, so a late job cannot leak content. */
export async function observeClock(ctx: Pick<QueryCtx, "db">): Promise<number> {
  const clock = await ctx.db
    .query("serverClock")
    .withIndex("by_key", (q) => q.eq("key", "clock"))
    .unique();
  // Reading the clock document subscribes the query to the IST-midnight tick; the value
  // itself is only a floor. Use the server's real time so an unseeded deployment (no clock
  // row yet) never computes dates as 1970.
  return Math.max(clock?.updatedAt ?? 0, Date.now());
}

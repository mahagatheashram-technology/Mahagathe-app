import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const tick = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const row = await ctx.db
      .query("serverClock")
      .withIndex("by_key", (q) => q.eq("key", "clock"))
      .unique();
    if (row) await ctx.db.patch(row._id, { updatedAt: Date.now() });
    else
      await ctx.db.insert("serverClock", {
        key: "clock",
        updatedAt: Date.now(),
      });
    return null;
  },
});

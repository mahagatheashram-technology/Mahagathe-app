import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { userRows } from "./content";

/** Used for account erasure and when an age correction requires new consent.
 * The profile/identity shell is retained or removed by the caller. */
export async function erasePersonalActivity(
  ctx: MutationCtx,
  userId: Id<"users">,
): Promise<void> {
  const tables = [
    "guardianConsentRequests",
    "guardianConsents",
    "notificationPrefs",
    "enrollments",
    "enrollmentAudit",
    "mandalas",
    "mandalaCompletions",
    "mandalaAudit",
    "readingPositions",
    "registrations",
    "contentReports",
    "savedVakyams",
    "volunteerApplications",
  ] as const;
  for (const table of tables) {
    for (const row of await userRows(ctx, table, userId))
      await ctx.db.delete(row._id);
  }
  const donations = await ctx.db
    .query("donations")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  for (const row of donations) {
    await ctx.db.patch(row._id, {
      userId: undefined,
      clientRequestId: `erased:${row._id}`,
      // Pending placeholder references originally include the user's opaque ID.
      providerRef: row.providerRef.startsWith("pending:")
        ? `pending:erased:${row._id}`
        : row.providerRef,
    });
  }
  // Aggregate group counts contain no identifiers and deliberately survive.
}

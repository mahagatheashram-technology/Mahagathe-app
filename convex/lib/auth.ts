import { ConvexError } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { observeClock } from "./time";
import { canStorePersonalData } from "./logic";

export async function getUser(
  ctx: Pick<QueryCtx, "auth" | "db">,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  // tokenIdentifier includes the issuer and is safer than a bare subject lookup.
  return ctx.db
    .query("users")
    .withIndex("by_token", (q) =>
      q.eq("tokenIdentifier", identity.tokenIdentifier),
    )
    .unique();
}

export async function requireUser(
  ctx: Pick<QueryCtx, "auth" | "db">,
): Promise<Doc<"users">> {
  const user = await getUser(ctx);
  if (!user)
    throw new ConvexError("Sign in and finish account setup to continue.");
  return user;
}

export async function requireRole(
  ctx: Pick<QueryCtx, "auth" | "db">,
  role: "editor" | "reviewer" | "admin",
) {
  const user = await requireConsentedUser(ctx);
  if (!user.staffRoles.includes(role) && !user.staffRoles.includes("admin")) {
    throw new ConvexError(`The ${role} role is required.`);
  }
  return user;
}

/** Every personal-data write uses this, not just onboarding. */
export async function requireConsentedUser(ctx: Pick<QueryCtx, "auth" | "db">) {
  const user = await requireUser(ctx);
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", user._id))
    .unique();
  if (
    !profile ||
    !canStorePersonalData(
      profile.ageBand,
      profile.guardianConsent === "granted",
    )
  ) {
    throw new ConvexError(
      "Select an age band and obtain guardian consent before continuing.",
    );
  }
  return user;
}

export async function isEnrolled(
  ctx: Pick<QueryCtx, "db">,
  user: Doc<"users"> | null,
  programId?: string,
) {
  if (!user) return false;
  const rows = await ctx.db
    .query("enrollments")
    .withIndex("by_user_program", (q) => q.eq("userId", user._id))
    .collect();
  await observeClock(ctx);
  const now = Date.now();
  return rows.some(
    (row) =>
      row.status === "active" &&
      (row.expiry === undefined || row.expiry > now) &&
      (programId === undefined || row.programId === programId),
  );
}

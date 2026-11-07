import { v, ConvexError } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  getUser,
  requireUser,
  requireConsentedUser,
  requireRole,
  isEnrolled,
} from "./lib/auth";
import { boundedText, canStorePersonalData, isMinor } from "./lib/logic";
import { erasePersonalActivity } from "./lib/privacy";
import { userRows } from "./lib/content";
import * as V from "./lib/validators";

const defaultPrefs = {
  practiceReminder: false,
  dailyVakyam: false,
  registeredEvents: false,
};

export const me = query({
  args: {},
  returns: v.union(V.profileResult, v.null()),
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return null;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (!profile) return null;
    return {
      id: user._id,
      displayName: profile.displayName ?? "",
      phoneMasked: user.phoneMasked ?? "",
      ageBand: profile.ageBand ?? null,
      roles: profile.roles ?? [],
      language: profile.language ?? "en",
      reminderTime: profile.reminderTime ?? null,
      guardianConsent: profile.guardianConsent,
      enrolled: await isEnrolled(ctx, user),
    };
  },
});

export const upsertFromIdentity = mutation({
  args: { ageBand: v.optional(V.ageBand) },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Sign in first.");
    const existing = await getUser(ctx);
    if (existing) return existing._id;
    // Keep only the identity mapping until age/consent is known. Never copy names
    // or a raw phone number from JWT claims during sign-up.
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
      staffRoles: [],
      createdAt: Date.now(),
    });
    await ctx.db.insert("profiles", {
      userId,
      ageBand: args.ageBand,
      guardianConsent:
        isMinor(args.ageBand) ? "pending" : "notRequired",
    });
    return userId;
  },
});

export const updateProfile = mutation({
  args: { patch: v.object(V.profilePatch) },
  returns: v.null(),
  handler: async (ctx, { patch }) => {
    const user = await requireUser(ctx);
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (!profile) throw new ConvexError("Create your profile first.");
    // Once identified as a minor, a self-service change to an adult band cannot
    // bypass verification. An admin correction requires recorded consent first.
    if (
      isMinor(profile.ageBand) &&
      patch.ageBand !== undefined &&
      patch.ageBand !== profile.ageBand
    ) {
      throw new ConvexError("Contact support to correct a minor age band.");
    }
    const band =
      patch.ageBand === undefined
        ? profile.ageBand
        : (patch.ageBand ?? undefined);
    const granted = profile.guardianConsent === "granted";
    if (!canStorePersonalData(band, granted)) {
      // Discard all personal fields in the same transaction, including any
      // previously supplied adult profile fields when changing to a minor band.
      await ctx.db.patch(profile._id, {
        ageBand: band,
        guardianConsent: "pending",
        displayName: undefined,
        roles: undefined,
        language: undefined,
        reminderTime: undefined,
      });
      await ctx.db.patch(user._id, { phoneMasked: undefined, staffRoles: [] });
      await erasePersonalActivity(ctx, user._id);
      return null;
    }
    if (patch.displayName !== undefined && patch.displayName.length > 120)
      throw new ConvexError("Display name is too long.");
    if (
      patch.reminderTime != null &&
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(patch.reminderTime)
    ) {
      throw new ConvexError("Reminder time must use HH:mm.");
    }
    const { ageBand: ignoredAgeBand, ...personal } = patch;
    void ignoredAgeBand;
    await ctx.db.patch(profile._id, {
      ...personal,
      ageBand: band,
      guardianConsent: isMinor(band) ? "granted" : "notRequired",
    });
    const identity = await ctx.auth.getUserIdentity();
    const phone = identity?.phoneNumber;
    if (typeof phone === "string")
      await ctx.db.patch(user._id, {
        phoneMasked: `${phone.startsWith("+91") ? "+91 " : "+ "}••••• ••${phone.slice(-3)}`,
      });
    return null;
  },
});

async function recordConsent(
  ctx: MutationCtx,
  args: {
    userId: Id<"users">;
    consentVersion: string;
    evidenceRef: string;
  },
  recordedBy?: Id<"users">,
) {
  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", args.userId))
    .unique();
  if (!profile || !isMinor(profile.ageBand))
    throw new ConvexError("A minor profile is required.");
  await ctx.db.insert("guardianConsents", {
    ...args,
    consentVersion: boundedText(args.consentVersion, "Consent version", 100),
    evidenceRef: boundedText(
      args.evidenceRef,
      "Verified evidence reference",
      500,
    ),
    recordedBy,
    grantedAt: Date.now(),
  });
  await ctx.db.patch(profile._id, { guardianConsent: "granted" });
  for (const request of await userRows(ctx, "guardianConsentRequests", args.userId)) {
    await ctx.db.delete(request._id);
  }
  return null;
}

/** Trusted verifier only; never exposed as a child's self-attestation. */
export const recordGuardianConsent = internalMutation({
  args: {
    userId: v.id("users"),
    consentVersion: v.string(),
    evidenceRef: v.string(),
  },
  returns: v.null(),
  handler: recordConsent,
});
export const verifyGuardianConsent = mutation({
  args: {
    userId: v.id("users"),
    consentVersion: v.string(),
    evidenceRef: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) =>
    recordConsent(ctx, args, (await requireRole(ctx, "admin"))._id),
});

export const notificationPrefs = query({
  args: {},
  returns: V.prefs,
  handler: async (ctx) => {
    const user = await getUser(ctx);
    if (!user) return defaultPrefs;
    const row = await ctx.db
      .query("notificationPrefs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    return row
      ? {
          practiceReminder: row.practiceReminder,
          dailyVakyam: row.dailyVakyam,
          registeredEvents: row.registeredEvents,
        }
      : defaultPrefs;
  },
});
export const setNotificationPref = mutation({
  args: {
    key: v.union(
      v.literal("practiceReminder"),
      v.literal("dailyVakyam"),
      v.literal("registeredEvents"),
    ),
    value: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, { key, value }) => {
    const user = await requireConsentedUser(ctx);
    const row = await ctx.db
      .query("notificationPrefs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
    if (row) await ctx.db.patch(row._id, { [key]: value });
    else
      await ctx.db.insert("notificationPrefs", {
        userId: user._id,
        ...defaultPrefs,
        [key]: value,
      });
    return null;
  },
});

/** Returns the account's data directly as downloadable JSON, without persisting
 * another copy. Authentication identity deletion is handled by Clerk separately. */
export const requestDataExport = query({
  args: {},
  returns: v.object({ filename: v.string(), json: v.string() }),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const tables = [
      "profiles",
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
      "donations",
      "contentReports",
      "savedVakyams",
      "volunteerApplications",
    ] as const;
    const entries = await Promise.all(
      tables.map(async (table) => [
        table,
        await userRows(ctx, table, user._id),
      ]),
    );
    return {
      filename: "mahagathe-account.json",
      json: JSON.stringify({ user, ...Object.fromEntries(entries) }),
    };
  },
});

export const deleteAccount = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    await erasePersonalActivity(ctx, user._id);
    for (const row of await userRows(ctx, "profiles", user._id))
      await ctx.db.delete(row._id);
    await ctx.db.delete(user._id);
    // Aggregate group counts have no user identifiers and deliberately survive.
    return null;
  },
});

/** Minimal outbox for the trusted guardian verification service. No child name. */
export const requestGuardianConsent = mutation({
  args: { ageBand: V.ageBand, guardianPhone: v.string() },
  returns: v.null(),
  handler: async (ctx, { ageBand, guardianPhone }) => {
    const user = await requireUser(ctx);
    if (!isMinor(ageBand)) throw new ConvexError("A minor age band is required.");
    const phone = guardianPhone.replace(/[\s()-]/g, "");
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new ConvexError("Enter a guardian phone number with country code.");
    const profile = await ctx.db.query("profiles").withIndex("by_user", q => q.eq("userId", user._id)).unique();
    if (!profile) throw new ConvexError("Create your profile first.");
    if (isMinor(profile.ageBand) && profile.ageBand !== ageBand) throw new ConvexError("Contact support to correct a minor age band.");
    if (profile.guardianConsent === "granted") throw new ConvexError("Guardian consent has already been verified.");
    await ctx.db.patch(profile._id, { ageBand, guardianConsent: "pending", displayName: undefined, roles: undefined, language: undefined, reminderTime: undefined });
    await ctx.db.patch(user._id, { phoneMasked: undefined, staffRoles: [] });
    await erasePersonalActivity(ctx, user._id);
    await ctx.db.insert("guardianConsentRequests", { userId: user._id, ageBand, guardianPhone: phone, status: "pending" });
    return null;
  },
});

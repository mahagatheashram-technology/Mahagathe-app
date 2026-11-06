import { observeClock } from "./lib/time";
import { v, ConvexError } from "convex/values";
import { query, mutation } from "./_generated/server";
import {
  getUser,
  requireConsentedUser,
  requireUser,
  isEnrolled,
} from "./lib/auth";
import { isPublished, needPublished, sourceApproved } from "./lib/content";
import { boundedText } from "./lib/logic";
import * as V from "./lib/validators";

export const events = query({
  args: { limit: v.optional(v.number()) },
  returns: v.array(V.eventResult),
  handler: async (ctx, { limit }) => {
    await observeClock(ctx);
    if (
      limit !== undefined &&
      (!Number.isInteger(limit) || limit < 1 || limit > 100)
    )
      throw new ConvexError("Limit must be 1–100.");
    const user = await getUser(ctx);
    const rows = await ctx.db
      .query("events")
      .withIndex("by_status_start", (q) => q.eq("status", "published"))
      .collect();
    return Promise.all(
      rows
        .filter((row) => isPublished(row))
        .slice(0, limit)
        .map(async (row) => {
          const registrations = await ctx.db
            .query("registrations")
            .withIndex("by_event_status", (q) =>
              q.eq("eventId", row._id).eq("status", "registered"),
            )
            .collect();
          const vibhaga = row.vibhagaId
            ? await ctx.db.get(row.vibhagaId)
            : null;
          return {
            id: row.slug,
            title: row.title,
            startsAt: new Date(row.startsAt).toISOString(),
            place: row.place,
            timeLabel: row.timeLabel,
            eligibility: row.eligibility,
            placesLeft:
              row.capacity === null
                ? null
                : Math.max(0, row.capacity - registrations.length),
            imageKey: row.imageKey,
            vibhagaId: vibhaga?.slug,
            registered: registrations.some((r) => r.userId === user?._id),
          };
        }),
    );
  },
});
export const register = mutation({
  args: { eventId: v.string() },
  returns: v.id("registrations"),
  handler: async (ctx, { eventId }) => {
    await observeClock(ctx);
    const user = await requireConsentedUser(ctx);
    const event = await needPublished(ctx, "events", eventId);
    const existing = await ctx.db
      .query("registrations")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", user._id).eq("eventId", event._id),
      )
      .unique();
    if (existing?.status === "registered") return existing._id;
    if (event.startsAt <= Date.now())
      throw new ConvexError("Registration for this event has closed.");
    if (
      event.enrollmentRequired &&
      !(await isEnrolled(ctx, user, event.programId))
    )
      throw new ConvexError("Enrollment is required for this event.");
    const registrations = await ctx.db
      .query("registrations")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", event._id).eq("status", "registered"),
      )
      .collect();
    if (event.capacity !== null && registrations.length >= event.capacity)
      throw new ConvexError("This event is full.");
    if (existing) {
      await ctx.db.patch(existing._id, {
        status: "registered",
        updatedAt: Date.now(),
      });
      return existing._id;
    }
    return ctx.db.insert("registrations", {
      userId: user._id,
      eventId: event._id,
      status: "registered",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});
export const unregister = mutation({
  args: { eventId: v.string() },
  returns: v.null(),
  handler: async (ctx, { eventId }) => {
    await observeClock(ctx);
    const user = await requireUser(ctx);
    // Cancellation remains possible after withdrawal.
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", eventId))
      .unique();
    if (!event) return null;
    const row = await ctx.db
      .query("registrations")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", user._id).eq("eventId", event._id),
      )
      .unique();
    if (row)
      await ctx.db.patch(row._id, {
        status: "cancelled",
        updatedAt: Date.now(),
      });
    return null;
  },
});
export const vibhagas = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
      tagline: v.string(),
      photo: V.photo,
      about: v.string(),
    }),
  ),
  handler: async (ctx) => {
    await observeClock(ctx);
    const rows = await ctx.db
      .query("vibhagas")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return rows
      .filter((row) => isPublished(row))
      .map((row) => ({
        id: row.slug,
        name: row.name,
        tagline: row.tagline,
        photo: row.photo,
        about: row.about,
      }));
  },
});
export const pathways = query({
  args: {},
  returns: v.array(v.object({ id: v.string(), ...V.pathwayFields })),
  handler: async (ctx) => {
    await observeClock(ctx);
    const rows = await ctx.db
      .query("pathways")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    return rows
      .filter((row) => isPublished(row))
      .map((row) => ({ id: row.slug, name: row.name, about: row.about }));
  },
});
export const parampara = query({
  args: {},
  returns: v.union(
    v.object({
      guru: V.paramparaFields.guru,
      lineage: V.paramparaFields.lineage,
      milestones: V.paramparaFields.milestones,
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    await observeClock(ctx);
    const rows = await ctx.db
      .query("parampara")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    for (const row of rows) {
      if (
        !isPublished(row) ||
        !row.sourceId ||
        !sourceApproved(await ctx.db.get(row.sourceId))
      )
        continue;
      return {
        guru: row.guru,
        lineage: row.lineage,
        milestones: row.milestones,
      };
    }
    return null;
  },
});
export const volunteerApply = mutation({
  args: {
    vibhagaId: v.string(),
    consent: v.boolean(),
    consentVersion: v.string(),
    message: v.string(),
  },
  returns: v.id("volunteerApplications"),
  handler: async (ctx, args) => {
    await observeClock(ctx);
    const user = await requireConsentedUser(ctx);
    if (!args.consent)
      throw new ConvexError(
        "Consent is required before applying to volunteer.",
      );
    const vibhaga = await needPublished(ctx, "vibhagas", args.vibhagaId);
    const existing = await ctx.db
      .query("volunteerApplications")
      .withIndex("by_user_vibhaga", (q) =>
        q.eq("userId", user._id).eq("vibhagaId", vibhaga._id),
      )
      .unique();
    if (existing) return existing._id;
    return ctx.db.insert("volunteerApplications", {
      userId: user._id,
      vibhagaId: vibhaga._id,
      consent: true,
      consentVersion: boundedText(args.consentVersion, "Consent version", 100),
      message: boundedText(args.message, "Message"),
      createdAt: Date.now(),
    });
  },
});

/** T-12: event owners can see confirmations; public events never expose names. */
export const eventRegistrations = query({
  args: { eventId: v.string() },
  returns: v.array(
    v.object({
      id: v.id("registrations"),
      userId: v.id("users"),
      displayName: v.string(),
      status: v.union(v.literal("registered"), v.literal("cancelled")),
    }),
  ),
  handler: async (ctx, { eventId }) => {
    await observeClock(ctx);
    const user = await requireUser(ctx);
    const event = await ctx.db
      .query("events")
      .withIndex("by_slug", (q) => q.eq("slug", eventId))
      .unique();
    const hub = event?.vibhagaId ? await ctx.db.get(event.vibhagaId) : null;
    if (
      !event ||
      (!user.staffRoles.includes("admin") &&
        event.ownerId !== user._id &&
        hub?.headId !== user._id)
    ) {
      throw new ConvexError("Only the event owner may view registrations.");
    }
    const rows = await ctx.db
      .query("registrations")
      .withIndex("by_event_status", (q) => q.eq("eventId", event._id))
      .collect();
    return Promise.all(
      rows.map(async (row) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", row.userId))
          .unique();
        return {
          id: row._id,
          userId: row.userId,
          displayName: profile?.displayName ?? "",
          status: row.status,
        };
      }),
    );
  },
});

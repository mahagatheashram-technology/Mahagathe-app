import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import * as V from "./lib/validators";

export default defineSchema({
  serverClock: defineTable({
    key: v.literal("clock"),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
  users: defineTable({
    clerkId: v.string(),
    tokenIdentifier: v.string(),
    phoneMasked: v.optional(v.string()),
    staffRoles: v.array(V.staffRole),
    createdAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_clerk", ["clerkId"]),
  profiles: defineTable({
    userId: v.id("users"),
    ageBand: v.optional(V.ageBand),
    guardianConsent: V.consent,
    displayName: v.optional(v.string()),
    roles: v.optional(v.array(V.role)),
    language: v.optional(V.language),
    reminderTime: v.optional(v.union(v.string(), v.null())),
    // enrolled is deliberately derived from active, unexpired enrollments.
  }).index("by_user", ["userId"]),
  guardianConsents: defineTable({
    userId: v.id("users"),
    consentVersion: v.string(),
    evidenceRef: v.string(),
    recordedBy: v.optional(v.id("users")),
    grantedAt: v.number(),
  }).index("by_user", ["userId"]),
  notificationPrefs: defineTable({
    userId: v.id("users"),
    ...V.prefs.fields,
  }).index("by_user", ["userId"]),
  sources: defineTable({ ...V.editorialFields, ...V.sourceFields })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),
  vakyams: defineTable({ ...V.editorialFields, ...V.vakyamFields })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_status_date", ["status", "publishDate"])
    .index("by_status_theme", ["status", "theme"])
    .index("by_source", ["sourceId"]),
  practices: defineTable({ ...V.editorialFields, ...V.practiceFields })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_source", ["sourceId"]),
  enrollments: defineTable({
    userId: v.id("users"),
    programId: v.string(),
    status: v.union(v.literal("active"), v.literal("revoked")),
    grantedBy: v.id("users"),
    expiry: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_program", ["userId", "programId"]),
  enrollmentAudit: defineTable({
    userId: v.id("users"),
    enrollmentId: v.id("enrollments"),
    actorId: v.id("users"),
    action: v.union(v.literal("grant"), v.literal("revoke")),
    programId: v.string(),
    expiry: v.optional(v.number()),
    reason: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_actor", ["actorId"]),
  mandalas: defineTable({
    userId: v.id("users"),
    practiceId: v.id("practices"),
    startDay: v.string(),
    cycleId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("expired"),
    ),
    rulesAcceptedAt: v.number(),
    rulesVersion: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"]),
  mandalaCompletions: defineTable({
    mandalaId: v.id("mandalas"),
    userId: v.id("users"),
    day: v.string(),
    createdAt: v.number(),
  })
    .index("by_mandala_day", ["mandalaId", "day"])
    .index("by_user", ["userId"]),
  mandalaAudit: defineTable({
    mandalaId: v.id("mandalas"),
    userId: v.id("users"),
    action: v.union(
      v.literal("start"),
      v.literal("complete"),
      v.literal("expire"),
    ),
    day: v.string(),
    timezone: v.string(),
    createdAt: v.number(),
    completionId: v.optional(v.id("mandalaCompletions")),
  })
    .index("by_user", ["userId"])
    .index("by_mandala", ["mandalaId"]),
  groupCounts: defineTable({
    cycleId: v.string(),
    day: v.string(),
    count: v.number(),
  })
    .index("by_cycle_day", ["cycleId", "day"])
    .index("by_day", ["day"]),
  seasons: defineTable({ ...V.editorialFields, ...V.seasonFields })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),
  episodes: defineTable({ ...V.editorialFields, ...V.episodeFields })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_season_status", ["seasonId", "status"])
    .index("by_source", ["sourceId"]),
  readingPositions: defineTable({
    userId: v.id("users"),
    episodeId: v.id("episodes"),
    progress: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_episode", ["userId", "episodeId"])
    .index("by_user_updated", ["userId", "updatedAt"]),
  events: defineTable({ ...V.editorialFields, ...V.eventFields })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_status_start", ["status", "startsAt"])
    .index("by_vibhaga", ["vibhagaId"]),
  registrations: defineTable({
    userId: v.id("users"),
    eventId: v.id("events"),
    status: v.union(v.literal("registered"), v.literal("cancelled")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_event", ["userId", "eventId"])
    .index("by_event_status", ["eventId", "status"]),
  vibhagas: defineTable({ ...V.editorialFields, ...V.vibhagaFields })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_head", ["headId"]),
  pathways: defineTable({ ...V.editorialFields, ...V.pathwayFields })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),
  parampara: defineTable({ ...V.editorialFields, ...V.paramparaFields })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_source", ["sourceId"]),
  donationPurposes: defineTable({ ...V.editorialFields, ...V.purposeFields })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),
  donations: defineTable({
    userId: v.optional(v.id("users")),
    amountPaise: v.number(),
    currency: v.literal("INR"),
    purposeId: v.id("donationPurposes"),
    status: v.union(
      v.literal("pending"),
      v.literal("success"),
      v.literal("failed"),
    ),
    providerRef: v.string(),
    receiptRef: v.optional(v.string()),
    createdAt: v.number(),
    clientRequestId: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_request", ["userId", "clientRequestId"])
    .index("by_provider", ["providerRef"]),
  contentReports: defineTable({
    userId: v.id("users"),
    contentId: v.string(),
    reason: v.string(),
    createdAt: v.number(),
    status: v.union(v.literal("open"), v.literal("resolved")),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),
  savedVakyams: defineTable({
    userId: v.id("users"),
    vakyamId: v.id("vakyams"),
  })
    .index("by_user", ["userId"])
    .index("by_user_vakyam", ["userId", "vakyamId"]),
  volunteerApplications: defineTable({
    userId: v.id("users"),
    vibhagaId: v.id("vibhagas"),
    consent: v.boolean(),
    consentVersion: v.string(),
    message: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_vibhaga", ["userId", "vibhagaId"]),
  appSettings: defineTable({ ...V.editorialFields, ...V.settingsFields })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"]),
  contentVersions: defineTable({
    table: V.contentTable,
    slug: v.string(),
    payload: V.contentPayload,
    authorId: v.id("users"),
    reviewerId: v.id("users"),
    approvedAt: v.number(),
  }).index("by_content", ["table", "slug"]),
});

import { v, ConvexError } from "convex/values";
import type { Infer } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { requireUser, requireRole, requireConsentedUser } from "./lib/auth";
import { bySlug, sourceApproved } from "./lib/content";
import type { ContentTable, ContentDoc } from "./lib/content";
import {
  boundedText,
  canApprove,
  canStorePersonalData,
  isDayKey,
} from "./lib/logic";
import * as V from "./lib/validators";

type Payload = Infer<typeof V.contentPayload>;

function pick<T extends object, K extends keyof T>(
  value: T,
  fields: Record<K, unknown>,
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of Object.keys(fields) as K[]) result[key] = value[key];
  return result;
}

async function mustGet(
  ctx: Pick<QueryCtx, "db">,
  table: ContentTable,
  slug: string,
) {
  const row = await bySlug(ctx, table, slug);
  if (!row) throw new ConvexError("Content not found.");
  return row;
}

/** Narrow on the discriminator before database writes; no untyped CMS blobs. */
async function insertDraft(
  ctx: MutationCtx,
  payload: Payload,
  slug: string,
  authorId: Id<"users">,
) {
  const meta = { slug, authorId, status: "draft" as const, demo: false };
  switch (payload.table) {
    case "sources":
      return ctx.db.insert("sources", { ...payload.data, ...meta });
    case "vakyams":
      return ctx.db.insert("vakyams", { ...payload.data, ...meta });
    case "practices":
      return ctx.db.insert("practices", { ...payload.data, ...meta });
    case "seasons":
      return ctx.db.insert("seasons", { ...payload.data, ...meta });
    case "episodes":
      return ctx.db.insert("episodes", { ...payload.data, ...meta });
    case "events":
      return ctx.db.insert("events", { ...payload.data, ...meta });
    case "vibhagas":
      return ctx.db.insert("vibhagas", { ...payload.data, ...meta });
    case "pathways":
      return ctx.db.insert("pathways", { ...payload.data, ...meta });
    case "parampara":
      return ctx.db.insert("parampara", { ...payload.data, ...meta });
    case "donationPurposes":
      return ctx.db.insert("donationPurposes", { ...payload.data, ...meta });
    case "appSettings":
      return ctx.db.insert("appSettings", { ...payload.data, ...meta });
  }
}

async function replaceDraft(
  ctx: MutationCtx,
  payload: Payload,
  slug: string,
  authorId: Id<"users">,
) {
  const meta = { slug, authorId, status: "draft" as const, demo: false };
  switch (payload.table) {
    case "sources": {
      const row = await bySlug(ctx, "sources", slug);
      if (!row) throw new ConvexError("Content not found.");
      await ctx.db.replace(row._id, { ...payload.data, ...meta });
      return;
    }
    case "vakyams": {
      const row = await bySlug(ctx, "vakyams", slug);
      if (!row) throw new ConvexError("Content not found.");
      await ctx.db.replace(row._id, { ...payload.data, ...meta });
      return;
    }
    case "practices": {
      const row = await bySlug(ctx, "practices", slug);
      if (!row) throw new ConvexError("Content not found.");
      await ctx.db.replace(row._id, { ...payload.data, ...meta });
      return;
    }
    case "seasons": {
      const row = await bySlug(ctx, "seasons", slug);
      if (!row) throw new ConvexError("Content not found.");
      await ctx.db.replace(row._id, { ...payload.data, ...meta });
      return;
    }
    case "episodes": {
      const row = await bySlug(ctx, "episodes", slug);
      if (!row) throw new ConvexError("Content not found.");
      await ctx.db.replace(row._id, { ...payload.data, ...meta });
      return;
    }
    case "events": {
      const row = await bySlug(ctx, "events", slug);
      if (!row) throw new ConvexError("Content not found.");
      await ctx.db.replace(row._id, { ...payload.data, ...meta });
      return;
    }
    case "vibhagas": {
      const row = await bySlug(ctx, "vibhagas", slug);
      if (!row) throw new ConvexError("Content not found.");
      await ctx.db.replace(row._id, { ...payload.data, ...meta });
      return;
    }
    case "pathways": {
      const row = await bySlug(ctx, "pathways", slug);
      if (!row) throw new ConvexError("Content not found.");
      await ctx.db.replace(row._id, { ...payload.data, ...meta });
      return;
    }
    case "parampara": {
      const row = await bySlug(ctx, "parampara", slug);
      if (!row) throw new ConvexError("Content not found.");
      await ctx.db.replace(row._id, { ...payload.data, ...meta });
      return;
    }
    case "donationPurposes": {
      const row = await bySlug(ctx, "donationPurposes", slug);
      if (!row) throw new ConvexError("Content not found.");
      await ctx.db.replace(row._id, { ...payload.data, ...meta });
      return;
    }
    case "appSettings": {
      const row = await bySlug(ctx, "appSettings", slug);
      if (!row) throw new ConvexError("Content not found.");
      await ctx.db.replace(row._id, { ...payload.data, ...meta });
      return;
    }
  }
}

async function snapshot(
  ctx: Pick<QueryCtx, "db">,
  table: ContentTable,
  slug: string,
): Promise<Payload> {
  switch (table) {
    case "sources": {
      const row = await bySlug(ctx, "sources", slug);
      if (!row) throw new ConvexError("Content not found.");
      return { table, data: pick(row, V.sourceFields) };
    }
    case "vakyams": {
      const row = await bySlug(ctx, "vakyams", slug);
      if (!row) throw new ConvexError("Content not found.");
      return { table, data: pick(row, V.vakyamFields) };
    }
    case "practices": {
      const row = await bySlug(ctx, "practices", slug);
      if (!row) throw new ConvexError("Content not found.");
      return { table, data: pick(row, V.practiceFields) };
    }
    case "seasons": {
      const row = await bySlug(ctx, "seasons", slug);
      if (!row) throw new ConvexError("Content not found.");
      return { table, data: pick(row, V.seasonFields) };
    }
    case "episodes": {
      const row = await bySlug(ctx, "episodes", slug);
      if (!row) throw new ConvexError("Content not found.");
      return { table, data: pick(row, V.episodeFields) };
    }
    case "events": {
      const row = await bySlug(ctx, "events", slug);
      if (!row) throw new ConvexError("Content not found.");
      return { table, data: pick(row, V.eventFields) };
    }
    case "vibhagas": {
      const row = await bySlug(ctx, "vibhagas", slug);
      if (!row) throw new ConvexError("Content not found.");
      return { table, data: pick(row, V.vibhagaFields) };
    }
    case "pathways": {
      const row = await bySlug(ctx, "pathways", slug);
      if (!row) throw new ConvexError("Content not found.");
      return { table, data: pick(row, V.pathwayFields) };
    }
    case "parampara": {
      const row = await bySlug(ctx, "parampara", slug);
      if (!row) throw new ConvexError("Content not found.");
      return { table, data: pick(row, V.paramparaFields) };
    }
    case "donationPurposes": {
      const row = await bySlug(ctx, "donationPurposes", slug);
      if (!row) throw new ConvexError("Content not found.");
      return { table, data: pick(row, V.purposeFields) };
    }
    case "appSettings": {
      const row = await bySlug(ctx, "appSettings", slug);
      if (!row) throw new ConvexError("Content not found.");
      return { table, data: pick(row, V.settingsFields) };
    }
  }
}

async function requireEditor(
  ctx: Pick<QueryCtx, "auth" | "db">,
  payload: Payload,
) {
  const user = await requireConsentedUser(ctx);
  if (user.staffRoles.includes("admin")) return user;
  if (payload.table === "vibhagas") {
    const head = payload.data.headId;
    if (head && head !== user._id)
      throw new ConvexError("Only this vibhaga head may edit its hub.");
    if (head === user._id) return user;
  }
  if (payload.table === "events" && payload.data.vibhagaId) {
    const hub = await ctx.db.get(payload.data.vibhagaId);
    if (hub?.headId === user._id) return user;
    if (hub?.headId)
      throw new ConvexError("Only this vibhaga head may edit its events.");
  }
  if (
    payload.table === "events" &&
    payload.data.ownerId &&
    payload.data.ownerId !== user._id
  ) {
    throw new ConvexError("Only the event owner may edit this event.");
  }
  if (!user.staffRoles.includes("editor"))
    throw new ConvexError("Editor access is required.");
  return user;
}

async function validateForApproval(
  ctx: Pick<QueryCtx, "db">,
  payload: Payload,
) {
  if (payload.table === "sources") {
    const source = payload.data;
    if (
      !source.book.trim() ||
      !source.edition.trim() ||
      !source.range.trim() ||
      !isDayKey(source.reviewDate) ||
      !["permitted", "public_domain"].includes(source.licenceStatus)
    ) {
      throw new ConvexError(
        "Complete the source register, rights clearance, and review date before approval.",
      );
    }
    return;
  }
  const needsSource = [
    "vakyams",
    "practices",
    "episodes",
    "parampara",
  ].includes(payload.table);
  if (!needsSource) return;
  const sourceId =
    "sourceId" in payload.data ? payload.data.sourceId : undefined;
  const source = sourceId ? await ctx.db.get(sourceId) : null;
  if (
    !sourceApproved(source) ||
    source.demo ||
    !source.reviewerId ||
    !canApprove(source.authorId, source.reviewerId)
  ) {
    throw new ConvexError(
      "An independently approved, rights-cleared source is required.",
    );
  }
  if (payload.table === "episodes") {
    if (source.canon !== "bori-critical-edition")
      throw new ConvexError(
        "Mahabharata episodes require the BORI critical edition.",
      );
    if (
      !payload.data.ownWordsConfirmed ||
      !payload.data.boriRange.trim() ||
      payload.data.paragraphRanges.length !== payload.data.paragraphs.length ||
      payload.data.paragraphRanges.some((range) => !range.trim())
    ) {
      throw new ConvexError(
        "Confirm original prose and provide a BORI range for every paragraph.",
      );
    }
    for (const question of payload.data.questions) {
      if (
        !Number.isInteger(question.answerIndex) ||
        question.answerIndex < 0 ||
        question.answerIndex >= question.options.length
      ) {
        throw new ConvexError("Question answer index is outside its options.");
      }
    }
  }
}

function validatePayload(payload: Payload) {
  if (payload.table === "events") {
    const { capacity, startsAt } = payload.data;
    if (
      !Number.isFinite(startsAt) ||
      (capacity !== null && (!Number.isSafeInteger(capacity) || capacity < 0))
    ) {
      throw new ConvexError(
        "Events need a valid timestamp and a nonnegative integer capacity.",
      );
    }
  }
  if (
    payload.table === "practices" &&
    (!Number.isFinite(payload.data.durationSec) || payload.data.durationSec < 0)
  ) {
    throw new ConvexError("Practice duration must be nonnegative.");
  }
  if (payload.table === "vakyams" && !isDayKey(payload.data.publishDate)) {
    throw new ConvexError("Vakyam date must use YYYY-MM-DD.");
  }
}

export const createDraft = mutation({
  args: { slug: v.string(), payload: V.contentPayload },
  returns: v.string(),
  handler: async (ctx, { slug, payload }) => {
    const user = await requireEditor(ctx, payload);
    if (
      payload.table === "events" &&
      !user.staffRoles.includes("admin") &&
      payload.data.ownerId !== undefined &&
      payload.data.ownerId !== user._id
    ) {
      throw new ConvexError(
        "Only admins may assign an event to another owner.",
      );
    }
    if (payload.table === "vibhagas" && !user.staffRoles.includes("admin")) {
      throw new ConvexError(
        "An admin must create a hub and designate its head.",
      );
    }
    const key = boundedText(slug, "Slug", 150);
    if (await bySlug(ctx, payload.table, key))
      throw new ConvexError("This slug already exists.");
    validatePayload(payload);
    return insertDraft(ctx, payload, key, user._id);
  },
});

export const updateDraft = mutation({
  args: { slug: v.string(), payload: V.contentPayload },
  returns: v.null(),
  handler: async (ctx, { slug, payload }) => {
    const current = await snapshot(ctx, payload.table, slug);
    const user = await requireEditor(ctx, current);
    await requireEditor(ctx, payload);
    if (
      !user.staffRoles.includes("admin") &&
      current.table === "vibhagas" &&
      payload.table === "vibhagas" &&
      current.data.headId !== payload.data.headId
    )
      throw new ConvexError("Only admins may reassign a vibhaga head.");
    if (
      !user.staffRoles.includes("admin") &&
      current.table === "events" &&
      payload.table === "events" &&
      (current.data.vibhagaId !== payload.data.vibhagaId ||
        current.data.ownerId !== payload.data.ownerId)
    ) {
      throw new ConvexError("Only admins may reassign event ownership.");
    }
    const row = await mustGet(ctx, payload.table, slug);
    if (
      !user.staffRoles.includes("admin") &&
      row.authorId !== user._id &&
      current.table !== "vibhagas" &&
      current.table !== "events"
    )
      throw new ConvexError("Only the author may edit this draft.");
    if (row.status !== "draft")
      throw new ConvexError(
        "Create a revision before editing approved or published content.",
      );
    validatePayload(payload);
    await replaceDraft(ctx, payload, slug, user._id);
    return null;
  },
});

export const submitForReview = mutation({
  args: V.contentRef,
  returns: v.null(),
  handler: async (ctx, { table, slug }) => {
    const payload = await snapshot(ctx, table, slug);
    const user = await requireEditor(ctx, payload);
    const row = await mustGet(ctx, table, slug);
    if (
      row.authorId !== user._id &&
      !user.staffRoles.includes("admin") &&
      payload.table !== "vibhagas" &&
      payload.table !== "events"
    )
      throw new ConvexError("Only the author may submit this draft.");
    if (row.status !== "draft")
      throw new ConvexError("Only drafts may be submitted.");
    await ctx.db.patch(row._id, { status: "in_review" });
    return null;
  },
});

export const approve = mutation({
  args: V.contentRef,
  returns: v.id("contentVersions"),
  handler: async (ctx, { table, slug }) => {
    const reviewer = await requireRole(ctx, "reviewer");
    const row = await mustGet(ctx, table, slug);
    if (row.status !== "in_review")
      throw new ConvexError("Only items in review may be approved.");
    if (!canApprove(row.authorId, reviewer._id))
      throw new ConvexError("A reviewer cannot approve their own work.");
    const payload = await snapshot(ctx, table, slug);
    await validateForApproval(ctx, payload);
    await ctx.db.patch(row._id, {
      status: "approved",
      reviewerId: reviewer._id,
      demo: false,
    });
    return ctx.db.insert("contentVersions", {
      table,
      slug,
      payload,
      authorId: row.authorId!,
      reviewerId: reviewer._id,
      approvedAt: Date.now(),
    });
  },
});

async function checkPublishable(
  ctx: Pick<QueryCtx, "db">,
  row: ContentDoc,
  payload: Payload,
) {
  if (!row.reviewerId || !canApprove(row.authorId, row.reviewerId))
    throw new ConvexError("Independent approval is required.");
  await validateForApproval(ctx, payload);
}

export const publish = mutation({
  args: {
    ...V.contentRef,
    publishAt: v.optional(v.number()),
    unpublishAt: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, { table, slug, publishAt, unpublishAt }) => {
    await requireRole(ctx, "admin");
    const row = await mustGet(ctx, table, slug);
    if (row.status !== "approved")
      throw new ConvexError("Only approved content may be published.");
    await checkPublishable(ctx, row, await snapshot(ctx, table, slug));
    const now = Date.now();
    const start = publishAt ?? now;
    if (
      !Number.isFinite(start) ||
      (unpublishAt !== undefined &&
        (!Number.isFinite(unpublishAt) ||
          unpublishAt <= start ||
          unpublishAt <= now))
    ) {
      throw new ConvexError("The publication window is invalid.");
    }
    await ctx.db.patch(row._id, {
      publishAt: start,
      unpublishAt,
      status: start <= now ? "published" : "approved",
    });
    if (start > now)
      await ctx.scheduler.runAt(start, internal.cms.applySchedule, {
        table,
        slug,
        boundary: start,
        action: "publish",
      });
    if (unpublishAt !== undefined)
      await ctx.scheduler.runAt(unpublishAt, internal.cms.applySchedule, {
        table,
        slug,
        boundary: unpublishAt,
        action: "archive",
      });
    return null;
  },
});

export const archive = mutation({
  args: V.contentRef,
  returns: v.null(),
  handler: async (ctx, { table, slug }) => {
    await requireRole(ctx, "admin");
    const row = await mustGet(ctx, table, slug);
    // Clear scheduling fields so already queued publication jobs become no-ops.
    await ctx.db.patch(row._id, {
      status: "archived",
      publishAt: undefined,
      unpublishAt: undefined,
    });
    return null;
  },
});

export const applySchedule = internalMutation({
  args: {
    ...V.contentRef,
    boundary: v.number(),
    action: v.union(v.literal("publish"), v.literal("archive")),
  },
  returns: v.null(),
  handler: async (ctx, { table, slug, boundary, action }) => {
    const row = await bySlug(ctx, table, slug);
    if (!row) return null;
    if (
      action === "publish" &&
      Date.now() >= boundary &&
      row.publishAt === boundary &&
      row.status === "approved" &&
      (row.unpublishAt === undefined || row.unpublishAt > Date.now())
    ) {
      await checkPublishable(ctx, row, await snapshot(ctx, table, slug));
      await ctx.db.patch(row._id, { status: "published" });
    }
    if (
      action === "archive" &&
      row.unpublishAt === boundary &&
      Date.now() >= boundary
    ) {
      await ctx.db.patch(row._id, {
        status: "archived",
        publishAt: undefined,
        unpublishAt: undefined,
      });
    }
    return null;
  },
});

export const createRevision = mutation({
  args: V.contentRef,
  returns: v.null(),
  handler: async (ctx, { table, slug }) => {
    const user = await requireEditor(ctx, await snapshot(ctx, table, slug));
    const row = await mustGet(ctx, table, slug);
    if (
      !user.staffRoles.includes("admin") &&
      row.authorId !== user._id &&
      table !== "events" &&
      table !== "vibhagas"
    )
      throw new ConvexError("Only the author may revise this content.");
    await ctx.db.patch(row._id, {
      status: "draft",
      authorId: user._id,
      reviewerId: undefined,
      publishAt: undefined,
      unpublishAt: undefined,
      demo: false,
    });
    return null;
  },
});

export const restoreApprovedVersion = mutation({
  args: { versionId: v.id("contentVersions") },
  returns: v.null(),
  handler: async (ctx, { versionId }) => {
    await requireRole(ctx, "admin");
    const version = await ctx.db.get(versionId);
    if (!version || !canApprove(version.authorId, version.reviewerId))
      throw new ConvexError("An independently approved version is required.");
    await validateForApproval(ctx, version.payload);
    await replaceDraft(ctx, version.payload, version.slug, version.authorId);
    const row = await mustGet(ctx, version.table, version.slug);
    await ctx.db.patch(row._id, {
      status: "approved",
      reviewerId: version.reviewerId,
    });
    return null;
  },
});

export const versions = query({
  args: V.contentRef,
  returns: v.array(
    v.object({
      id: v.id("contentVersions"),
      approvedAt: v.number(),
      authorId: v.id("users"),
      reviewerId: v.id("users"),
      payload: V.contentPayload,
    }),
  ),
  handler: async (ctx, { table, slug }) => {
    await requireRole(ctx, "editor");
    const rows = await ctx.db
      .query("contentVersions")
      .withIndex("by_content", (q) => q.eq("table", table).eq("slug", slug))
      .collect();
    return rows.map((row) => ({
      id: row._id,
      approvedAt: row.approvedAt,
      authorId: row.authorId,
      reviewerId: row.reviewerId,
      payload: row.payload,
    }));
  },
});

export const content = query({
  args: V.contentRef,
  returns: v.object({ payload: V.contentPayload, status: V.contentStatus }),
  handler: async (ctx, { table, slug }) => {
    const user = await requireUser(ctx);
    const payload = await snapshot(ctx, table, slug);
    if (
      !user.staffRoles.some((role) =>
        ["editor", "reviewer", "admin"].includes(role),
      )
    )
      await requireEditor(ctx, payload);
    const row = await mustGet(ctx, table, slug);
    return { payload, status: row.status };
  },
});

export const grantEnrollment = mutation({
  args: {
    userId: v.id("users"),
    programId: v.string(),
    expiry: v.optional(v.number()),
    reason: v.string(),
  },
  returns: v.id("enrollments"),
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, "admin");
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
    if (
      !profile ||
      !canStorePersonalData(
        profile.ageBand,
        profile.guardianConsent === "granted",
      )
    )
      throw new ConvexError("A consented profile is required.");
    const programId = boundedText(args.programId, "Program ID", 100);
    const reason = boundedText(args.reason, "Audit reason", 500);
    if (
      args.expiry !== undefined &&
      (!Number.isFinite(args.expiry) || args.expiry <= Date.now())
    )
      throw new ConvexError("Expiry must be in the future.");
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user_program", (q) =>
        q.eq("userId", args.userId).eq("programId", programId),
      )
      .unique();
    const id =
      existing?._id ??
      (await ctx.db.insert("enrollments", {
        userId: args.userId,
        programId,
        status: "active",
        grantedBy: admin._id,
        expiry: args.expiry,
      }));
    if (existing)
      await ctx.db.patch(existing._id, {
        status: "active",
        grantedBy: admin._id,
        expiry: args.expiry,
      });
    await ctx.db.insert("enrollmentAudit", {
      userId: args.userId,
      enrollmentId: id,
      actorId: admin._id,
      action: "grant",
      programId,
      expiry: args.expiry,
      reason,
      createdAt: Date.now(),
    });
    return id;
  },
});

export const revokeEnrollment = mutation({
  args: { userId: v.id("users"), programId: v.string(), reason: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireRole(ctx, "admin");
    const reason = boundedText(args.reason, "Audit reason", 500);
    const row = await ctx.db
      .query("enrollments")
      .withIndex("by_user_program", (q) =>
        q.eq("userId", args.userId).eq("programId", args.programId),
      )
      .unique();
    if (!row || row.status === "revoked") return null;
    await ctx.db.patch(row._id, { status: "revoked" });
    await ctx.db.insert("enrollmentAudit", {
      userId: args.userId,
      enrollmentId: row._id,
      actorId: admin._id,
      action: "revoke",
      programId: args.programId,
      reason,
      createdAt: Date.now(),
    });
    return null;
  },
});

/** Dashboard/CLI only. Never callable by a client to escalate its own role. */
export const setStaffRoles = internalMutation({
  args: { userId: v.id("users"), roles: v.array(V.staffRole) },
  returns: v.null(),
  handler: async (ctx, { userId, roles }) => {
    const user = await ctx.db.get(userId);
    if (!user) throw new ConvexError("User not found.");
    await ctx.db.patch(userId, { staffRoles: roles });
    return null;
  },
});

/** Staff review inbox and source register. Fetch payloads with `content`. */
export const listContent = query({
  args: {
    table: V.contentTable,
    status: V.contentStatus,
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      slug: v.string(),
      status: V.contentStatus,
      authorId: v.optional(v.id("users")),
      reviewerId: v.optional(v.id("users")),
    }),
  ),
  handler: async (ctx, { table, status, limit = 50 }) => {
    const user = await requireConsentedUser(ctx);
    if (
      !user.staffRoles.some((role) =>
        ["editor", "reviewer", "admin"].includes(role),
      )
    ) {
      throw new ConvexError("Staff access is required.");
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100)
      throw new ConvexError("Limit must be 1–100.");
    const rows = await ctx.db
      .query(table)
      .withIndex("by_status", (q) => q.eq("status", status))
      .take(limit);
    return rows.map((row) => ({
      slug: row.slug,
      status: row.status,
      authorId: row.authorId,
      reviewerId: row.reviewerId,
    }));
  },
});

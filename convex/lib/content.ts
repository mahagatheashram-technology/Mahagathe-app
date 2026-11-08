import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import type { Infer } from "convex/values";
import { ConvexError } from "convex/values";
import { observeClock } from "./time";
import { isDayKey } from "./logic";
import type { contentTable } from "./validators";

export type ContentTable = Infer<typeof contentTable>;
export type ContentDoc = Doc<ContentTable>;

/** Time checks are intentional: a delayed scheduler must never expose expired
 * content. Scheduled lifecycle writes invalidate subscriptions at boundaries. */
export function isPublished(
  item: Pick<ContentDoc, "status" | "publishAt" | "unpublishAt">,
  now = Date.now(),
): boolean {
  return (
    item.status === "published" &&
    (item.publishAt === undefined || item.publishAt <= now) &&
    (item.unpublishAt === undefined || now < item.unpublishAt)
  );
}

export async function bySlug<T extends ContentTable>(
  ctx: Pick<QueryCtx, "db">,
  table: T,
  slug: string,
): Promise<Doc<T> | null> {
  // All content tables share exactly this index. Narrowing the generic query
  // keeps the relationship between its table argument and return document.
  const item = await ctx.db
    .query(table as ContentTable)
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .unique();
  return item as Doc<T> | null;
}

export async function publishedBySlug<T extends ContentTable>(
  ctx: Pick<QueryCtx, "db">,
  table: T,
  slug: string,
) {
  await observeClock(ctx);
  const item = await bySlug(ctx, table, slug);
  return item && isPublished(item as unknown as ContentDoc) ? item : null;
}

export async function needPublished<T extends ContentTable>(
  ctx: Pick<QueryCtx, "db">,
  table: T,
  slug: string,
) {
  const item = await publishedBySlug(ctx, table, slug);
  if (!item) throw new ConvexError("This content is unavailable.");
  return item;
}

export function sourceApproved(
  source: Doc<"sources"> | null,
): source is Doc<"sources"> {
  if (source?.demo && isPublished(source)) return true;
  return (
    source !== null &&
    (source.status === "approved" || isPublished(source)) &&
    (source.licenceStatus === "permitted" ||
      source.licenceStatus === "public_domain") &&
    source.book.trim().length > 0 &&
    source.edition.trim().length > 0 &&
    source.range.trim().length > 0 &&
    isDayKey(source.reviewDate)
  );
}

export async function toVakyam(
  ctx: Pick<QueryCtx, "db">,
  item: Doc<"vakyams">,
) {
  const source = await ctx.db.get(item.sourceId);
  if (!sourceApproved(source)) return null;
  return {
    id: item.slug,
    text: item.text,
    meaning: item.meaning,
    theme: item.theme,
    verbatim: item.verbatim,
    attribution: item.attribution,
    source: { title: source.book, detail: source.detail },
    date: item.publishDate,
  };
}

type UserTable =
  | "yakshaAnswers" | "seriesAccess" | "practiceUnlocks"
  | "profiles"
  | "guardianConsentRequests"
  | "guardianConsents"
  | "notificationPrefs"
  | "enrollments"
  | "enrollmentAudit"
  | "mandalas"
  | "mandalaCompletions"
  | "mandalaAudit"
  | "readingPositions"
  | "registrations"
  | "donations"
  | "contentReports"
  | "savedVakyams"
  | "volunteerApplications";

export async function userRows(
  ctx: Pick<QueryCtx, "db">,
  table: UserTable,
  userId: Doc<"users">["_id"],
) {
  const rows = await ctx.db
    .query(table as UserTable)
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  return rows;
}

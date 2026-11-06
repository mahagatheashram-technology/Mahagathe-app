import { observeClock } from "./lib/time";
import { v, ConvexError } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getUser, requireConsentedUser, requireUser } from "./lib/auth";
import { isPublished, needPublished, publishedBySlug } from "./lib/content";
import { boundedText, validateDonation } from "./lib/logic";
import * as V from "./lib/validators";

export const purposes = query({
  args: {},
  returns: v.object({
    purposes: v.array(v.object({ id: v.string(), ...V.purposeFields })),
    presets: v.array(v.number()),
    currency: v.literal("INR"),
  }),
  handler: async (ctx) => {
    await observeClock(ctx);
    const rows = await ctx.db
      .query("donationPurposes")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    const settings = await publishedBySlug(ctx, "appSettings", "default");
    return {
      purposes: rows
        .filter((row) => isPublished(row))
        .map((row) => ({ id: row.slug, name: row.name, tagline: row.tagline })),
      presets: settings?.donationPresets ?? [],
      currency: "INR" as const,
    };
  },
});
export const createDonation = mutation({
  args: {
    amount: v.number(),
    purposeId: v.string(),
    currency: v.optional(v.string()),
    clientRequestId: v.string(),
  },
  returns: V.donationResult,
  handler: async (ctx, args) => {
    await observeClock(ctx);
    const user = await requireConsentedUser(ctx);
    const amountPaise = validateDonation(args.amount, args.currency ?? "INR");
    const purpose = await needPublished(
      ctx,
      "donationPurposes",
      args.purposeId,
    );
    const requestId = boundedText(
      args.clientRequestId,
      "Payment request ID",
      128,
    );
    const existing = await ctx.db
      .query("donations")
      .withIndex("by_user_request", (q) =>
        q.eq("userId", user._id).eq("clientRequestId", requestId),
      )
      .unique();
    if (existing) {
      if (
        existing.amountPaise !== amountPaise ||
        existing.purposeId !== purpose._id
      )
        throw new ConvexError(
          "This request ID belongs to a different donation.",
        );
      return {
        id: existing._id,
        status: existing.status,
        amount: existing.amountPaise / 100,
        purposeName: purpose.name,
        receiptRef: existing.receiptRef,
      };
    }
    const id = await ctx.db.insert("donations", {
      userId: user._id,
      amountPaise,
      currency: "INR",
      purposeId: purpose._id,
      status: "pending",
      providerRef: `pending:${user._id}:${requestId}`,
      clientRequestId: requestId,
      createdAt: Date.now(),
    });
    return {
      id,
      status: "pending" as const,
      amount: args.amount,
      purposeName: purpose.name,
    };
  },
});
export const donation = query({
  args: { id: v.id("donations") },
  returns: v.union(V.donationResult, v.null()),
  handler: async (ctx, { id }) => {
    await observeClock(ctx);
    const user = await requireUser(ctx);
    const row = await ctx.db.get(id);
    if (!row || row.userId !== user._id) return null;
    const purpose = await ctx.db.get(row.purposeId);
    return {
      id: row._id,
      status: row.status,
      amount: row.amountPaise / 100,
      purposeName: purpose?.name ?? "",
      receiptRef: row.receiptRef,
    };
  },
});

/** Future verified provider webhook calls this internal-only transition. The
 * amount/currency check prevents a mismatched payment from settling a donation. */
export const markDonationResult = internalMutation({
  args: {
    donationId: v.id("donations"),
    providerRef: v.string(),
    amountPaise: v.number(),
    currency: v.string(),
    status: v.union(v.literal("success"), v.literal("failed")),
    receiptRef: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await observeClock(ctx);
    const row = await ctx.db.get(args.donationId);
    if (!row) throw new ConvexError("Donation not found.");
    if (row.amountPaise !== args.amountPaise || row.currency !== args.currency)
      throw new ConvexError("Provider amount or currency does not match.");
    const providerRef = boundedText(
      args.providerRef,
      "Provider reference",
      200,
    );
    const linked = await ctx.db
      .query("donations")
      .withIndex("by_provider", (q) => q.eq("providerRef", providerRef))
      .unique();
    if (linked && linked._id !== row._id)
      throw new ConvexError(
        "Payment reference already belongs to another donation.",
      );
    if (row.status !== "pending") {
      if (
        row.status === args.status &&
        row.providerRef === providerRef &&
        row.receiptRef === args.receiptRef
      )
        return null;
      throw new ConvexError("A settled donation cannot change result.");
    }
    await ctx.db.patch(row._id, {
      status: args.status,
      providerRef,
      receiptRef: args.receiptRef,
    });
    return null;
  },
});

export const myDonations = query({
  args: {},
  returns: v.array(V.donationResult),
  handler: async (ctx) => {
    await observeClock(ctx);
    const user = await getUser(ctx);
    if (!user) return [];
    const rows = await ctx.db
      .query("donations")
      .withIndex("by_user_request", (q) => q.eq("userId", user._id))
      .collect();
    return Promise.all(
      rows.map(async (row) => ({
        id: row._id,
        status: row.status,
        amount: row.amountPaise / 100,
        purposeName: (await ctx.db.get(row.purposeId))?.name ?? "",
        receiptRef: row.receiptRef,
      })),
    );
  },
});

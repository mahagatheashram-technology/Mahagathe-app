/** Retrieval only. Optional provider credentials live exclusively in server environment. */
import { v } from 'convex/values';
import { action, internalAction, internalQuery, internalMutation } from './_generated/server';
import { api, internal } from './_generated/api';
import { publishedBySlug, toVakyam, isPublished } from './lib/content';
import * as V from './lib/validators';
import type { WisdomSearchResult } from '../src/data/types';

const resultValidator = v.object({ vakyams: v.array(V.vakyamResult), episodes: v.array(v.object({ ...V.episodeSummary, seasonTitle: v.string(), boriRange: v.string() })) });
async function embed(text: string): Promise<number[] | null> {
  const key = process.env.EMBEDDINGS_API_KEY;
  if (!key) return null;
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'text-embedding-3-small', input: text, dimensions: 1536 }), signal: AbortSignal.timeout(10000) });
    if (!response.ok) return null;
    const body: { data?: { embedding?: number[] }[] } = await response.json();
    const vector = body.data?.[0]?.embedding;
    return vector?.length === 1536 && vector.every(Number.isFinite) ? vector : null;
  } catch { return null; }
}
export const embeddingSource = internalQuery({ args: { slug: v.string() }, returns: v.union(v.string(), v.null()), handler: async (ctx, { slug }) => {
  const row = await publishedBySlug(ctx, 'vakyams', slug);
  if (!row || row.demo || !row.reviewerId || !await toVakyam(ctx, row)) return null;
  return `${row.text}\n${row.meaning}`;
} });
export const store = internalMutation({ args: { slug: v.string(), text: v.string(), vector: v.array(v.number()) }, returns: v.null(), handler: async (ctx, { slug, text, vector }) => {
  const row = await publishedBySlug(ctx, 'vakyams', slug);
  if (row && !row.demo && row.reviewerId && await toVakyam(ctx, row) && `${row.text}\n${row.meaning}` === text && vector.length === 1536) await ctx.db.patch(row._id, { embedding: vector, embeddingText: text });
  return null;
} });
/** Scheduled at publication. With zero keys this action performs no external calls. */
export const atPublish = internalAction({ args: { slug: v.string() }, returns: v.null(), handler: async (ctx, { slug }) => {
  if (!process.env.EMBEDDINGS_API_KEY) return null;
  const text = await ctx.runQuery(internal.embeddings.embeddingSource, { slug }); if (!text) return null;
  const vector = await embed(text); if (vector) await ctx.runMutation(internal.embeddings.store, { slug, text, vector }); return null;
} });
export const retrieve = internalQuery({ args: { ids: v.array(v.id('vakyams')) }, returns: v.array(V.vakyamResult), handler: async (ctx, { ids }) => {
  const items = await Promise.all(ids.map(async id => {
    const row = await ctx.db.get(id);
    if (!row || !isPublished(row) || row.demo || !row.reviewerId || row.embeddingText !== `${row.text}\n${row.meaning}`) return null;
    return toVakyam(ctx, row);
  })); return items.filter(item => item !== null);
} });
export const search = action({ args: { text: v.string() }, returns: resultValidator, handler: async (ctx, { text }): Promise<WisdomSearchResult> => {
  const term = text.trim().slice(0, 200);
  const exact: WisdomSearchResult = await ctx.runQuery(api.wisdom.search, { text: term });
  if (!term || !process.env.EMBEDDINGS_API_KEY) return exact;
  const vector = await embed(term); if (!vector) return exact;
  try {
    const matches = await ctx.vectorSearch('vakyams', 'by_embedding', { vector, limit: 30, filter: q => q.eq('status', 'published') });
    const similar = await ctx.runQuery(internal.embeddings.retrieve, { ids: matches.map(m => m._id) });
    const existing = new Set(exact.vakyams.map(v => v.id));
    return { vakyams: [...exact.vakyams, ...similar.filter(v => !existing.has(v.id))], episodes: exact.episodes };
  } catch { return exact; }
} });

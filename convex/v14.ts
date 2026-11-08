import { v, ConvexError } from 'convex/values';
import { query, mutation, internalMutation } from './_generated/server';
import type { QueryCtx } from './_generated/server';
import { getUser, requireConsentedUser } from './lib/auth';
import { observeClock } from './lib/time';
import { dayKey } from './lib/logic';
import * as V from './lib/v14Validators';
import { gunaResultFromAnswers } from '../src/data/v14';

async function questionOfDay(ctx: Pick<QueryCtx, 'db'>) {
  const day = dayKey(await observeClock(ctx));
  const rows = await ctx.db.query('yakshaQuestions').withIndex('by_approved', q => q.eq('approved', true)).collect();
  rows.sort((a, b) => a.slug.localeCompare(b.slug));
  // Explicit seed demo only; other unapproved questions never enter the daily set.
  const demo = rows.length ? null : await ctx.db.query('yakshaQuestions').withIndex('by_slug', q => q.eq('slug', 'yaksha-wind')).unique();
  return { day, item: rows[Number(day.replaceAll('-', '')) % rows.length] ?? (demo?.demo ? demo : null) };
}
export const todayYaksha = query({ args: {}, returns: v.union(v.object({ question: V.yakshaQuestion, state: V.yakshaState }), v.null()), handler: async ctx => {
  const { day, item } = await questionOfDay(ctx); if (!item) return null;
  const user = await getUser(ctx);
  const saved = user ? await ctx.db.query('yakshaAnswers').withIndex('by_user_day', q => q.eq('userId', user._id).eq('dayKey', day)).unique() : null;
  const state = saved?.questionId === item.slug ? { questionId: saved.questionId, choice: saved.choice, revealed: saved.revealed, correct: saved.correct } : { questionId: item.slug, choice: null, revealed: false, correct: null };
  return { question: { id: item.slug, dayKey: day, question: item.question, answer: item.answer, distractors: item.distractors, reference: item.reference, meaning: item.meaning, approved: item.approved }, state };
} });
export const answerYaksha = mutation({ args: { choice: v.union(v.string(), v.null()) }, returns: v.null(), handler: async (ctx, { choice }) => {
  const user = await requireConsentedUser(ctx); const { day, item } = await questionOfDay(ctx);
  if (!item) throw new ConvexError('No question today.');
  if (choice !== null && ![item.answer, ...item.distractors].includes(choice)) throw new ConvexError('Choose one of today’s answers.');
  const old = await ctx.db.query('yakshaAnswers').withIndex('by_user_day', q => q.eq('userId', user._id).eq('dayKey', day)).unique();
  if (!old) await ctx.db.insert('yakshaAnswers', { userId: user._id, dayKey: day, questionId: item.slug, choice, revealed: true, correct: choice === null ? null : choice === item.answer });
  return null;
} });
export const gunaResult = query({ args: {}, returns: v.union(V.gunaResult, v.null()), handler: async ctx => {
  const user = await getUser(ctx); if (!user) return null;
  return (await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', user._id)).unique())?.gunaResult ?? null;
} });
export const saveGunaResult = mutation({ args: { result: V.gunaResult }, returns: v.null(), handler: async (ctx, { result }) => {
  const user = await requireConsentedUser(ctx);
  const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', user._id)).unique();
  if (!profile) throw new ConvexError('Complete your profile.');
  // Never trust caller-calculated scores or time. Retaking atomically replaces the latest.
  await ctx.db.patch(profile._id, { gunaResult: gunaResultFromAnswers(result.answers, Date.now()), gunaPrompt: 'done' }); return null;
} });
export const gunaPrompt = query({ args: {}, returns: V.gunaPrompt, handler: async ctx => {
  const user = await getUser(ctx); if (!user) return 'unseen';
  return (await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', user._id)).unique())?.gunaPrompt ?? 'unseen';
} });
export const setGunaPrompt = mutation({ args: { state: V.gunaPrompt }, returns: v.null(), handler: async (ctx, { state }) => {
  const user = await requireConsentedUser(ctx); const profile = await ctx.db.query('profiles').withIndex('by_user', q => q.eq('userId', user._id)).unique();
  if (!profile) throw new ConvexError('Complete your profile.'); await ctx.db.patch(profile._id, { gunaPrompt: state }); return null;
} });
export const series = query({ args: {}, returns: v.array(V.seriesResult), handler: async ctx => {
  const rows = await ctx.db.query('series').collect(); return rows.map(({ _id, _creationTime, slug, ...item }) => ({ id: slug, ...item }));
} });
export const seriesById = query({ args: { id: v.string() }, returns: v.union(V.seriesResult, v.null()), handler: async (ctx, { id }) => {
  const row = await ctx.db.query('series').withIndex('by_slug', q => q.eq('slug', id)).unique(); if (!row) return null;
  const { _id, _creationTime, slug, ...item } = row; return { id: slug, ...item };
} });
export const seriesAccess = query({ args: { seriesId: v.string() }, returns: v.boolean(), handler: async (ctx, { seriesId }) => {
  const user = await getUser(ctx); if (!user) return false;
  const series = await ctx.db.query('series').withIndex('by_slug', q => q.eq('slug', seriesId)).unique(); if (!series) return false;
  return !!await ctx.db.query('seriesAccess').withIndex('by_user_series', q => q.eq('userId', user._id).eq('seriesId', series._id)).unique();
} });
export const practiceUnlocks = query({ args: {}, returns: v.object({ dhyanbhaari: v.boolean() }), handler: async ctx => {
  const user = await getUser(ctx); const row = user ? await ctx.db.query('practiceUnlocks').withIndex('by_user', q => q.eq('userId', user._id)).unique() : null;
  return { dhyanbhaari: row?.dhyanbhaari ?? false };
} });

/** Trusted attendance/access integration points. No public purchase or unlock mechanism. */
export const setPracticeUnlock = internalMutation({ args: { userId: v.id('users'), unlocked: v.boolean() }, returns: v.null(), handler: async (ctx, { userId, unlocked }) => {
  const row = await ctx.db.query('practiceUnlocks').withIndex('by_user', q => q.eq('userId', userId)).unique();
  if (row) await ctx.db.patch(row._id, { dhyanbhaari: unlocked }); else await ctx.db.insert('practiceUnlocks', { userId, dhyanbhaari: unlocked }); return null;
} });
export const setSeriesAccess = internalMutation({ args: { userId: v.id('users'), seriesId: v.string(), access: v.boolean() }, returns: v.null(), handler: async (ctx, { userId, seriesId, access }) => {
  const series = await ctx.db.query('series').withIndex('by_slug', q => q.eq('slug', seriesId)).unique(); if (!series) throw new ConvexError('Unknown series.');
  const row = await ctx.db.query('seriesAccess').withIndex('by_user_series', q => q.eq('userId', userId).eq('seriesId', series._id)).unique();
  if (row && !access) await ctx.db.delete(row._id); if (!row && access) await ctx.db.insert('seriesAccess', { userId, seriesId: series._id, grantedAt: Date.now() }); return null;
} });

import { v } from 'convex/values';
export const guna = v.union(v.literal('sattva'), v.literal('rajas'), v.literal('tamas'));
export const gunaValues = v.object({ sattva: v.number(), rajas: v.number(), tamas: v.number() });
export const gunaPrompt = v.union(v.literal('unseen'), v.literal('later'), v.literal('done'));
export const gunaResult = v.object({ scores: gunaValues, percents: gunaValues, dominant: guna, secondary: guna,
  profileType: v.union(v.literal('dominant'), v.literal('dual'), v.literal('balanced')), answers: v.record(v.string(), v.number()), takenAt: v.number() });
export const yakshaFields = { question: v.string(), answer: v.string(), distractors: v.array(v.string()), reference: v.string(), meaning: v.string(), approved: v.boolean() };
export const yakshaQuestion = v.object({ id: v.string(), dayKey: v.string(), ...yakshaFields });
export const yakshaState = v.object({ questionId: v.string(), choice: v.union(v.string(), v.null()), revealed: v.boolean(), correct: v.union(v.boolean(), v.null()) });
export const seriesPart = v.object({ number: v.number(), title: v.string(), when: v.optional(v.string()), locked: v.optional(v.boolean()), free: v.optional(v.boolean()), seasonId: v.optional(v.string()), episodeIds: v.optional(v.array(v.string())) });
export const seriesFields = { titleDev: v.string(), title: v.string(), color: v.string(), motif: v.union(v.literal('wheel'), v.literal('bow'), v.literal('ash'), v.literal('yantra')),
  description: v.string(), status: v.union(v.literal('reading'), v.literal('upcoming'), v.literal('free-first')), parts: v.array(seriesPart) };
export const seriesResult = v.object({ id: v.string(), ...seriesFields });

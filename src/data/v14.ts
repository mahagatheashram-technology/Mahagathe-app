/** Shared pure transformations keep mock and Convex results identical. */
import type { GunaResult, Vakyam, VakyamMonth } from './types';
import { computeResult } from '../features/gunometer/lib/scoring';
import { coreQuestions } from '../features/gunometer/lib/questions';
export function groupVakyams(items: Vakyam[]): VakyamMonth[] {
  const groups = new Map<string, VakyamMonth>();
  for (const item of [...items].sort((a, b) => b.date.localeCompare(a.date))) {
    const month = item.date.slice(0, 7);
    let group = groups.get(month);
    if (!group) { group = { month, label: new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }), vakyams: [] }; groups.set(month, group); }
    group.vakyams.push(item);
  }
  return [...groups.values()];
}
/** Reject partial/unknown answers before saving; upstream scoring itself is unmodified. */
export function gunaResultFromAnswers(answers: Record<string, number>, takenAt: number, completionTimeSeconds?: number): GunaResult {
  if (Object.keys(answers).length !== coreQuestions.length || coreQuestions.some(q => !Number.isInteger(answers[q.id]) || answers[q.id] < 1 || answers[q.id] > 5)) throw new Error(`Answer all ${coreQuestions.length} questions from 1 to 5.`);
  const result = computeResult(answers, completionTimeSeconds);
  return { scores: result.scores0to100, percents: result.profilePercent, dominant: result.dominantGuna, secondary: result.secondaryGuna, profileType: result.profileType, answers, takenAt };
}

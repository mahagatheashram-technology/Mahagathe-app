import { gunaResultFromAnswers } from '../../data/v14';
import type { GunaResult } from '../../data/types';

/** Save and finish only after a complete, validated source answer set. */
export async function completeGunaQuiz(
  answers: Record<string, number>,
  save: (result: GunaResult) => Promise<void>,
  markDone: () => Promise<void>,
  takenAt = Date.now(),
  startedAt?: number,
) {
  const result = gunaResultFromAnswers(answers, takenAt, startedAt === undefined ? undefined : Math.max(0, (takenAt - startedAt) / 1000));
  await save(result);
  await markDone();
  return result;
}

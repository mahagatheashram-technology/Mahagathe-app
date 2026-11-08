import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { GunaResult } from '../../data/types';
import { coreQuestions } from './lib/questions';
import { completeGunaQuiz } from './completeQuiz';

void test('a full source answer set is saved before the prompt is marked done; a retake replaces it', async () => {
  let saved: GunaResult | null = null;
  const calls: string[] = [];
  const save = async (result: GunaResult) => { saved = result; calls.push('save'); };
  const done = async () => { assert.ok(saved); calls.push('done'); };
  const answers = Object.fromEntries(coreQuestions.map(q => [q.id, 3]));
  const first = await completeGunaQuiz(answers, save, done, 123);
  assert.equal(saved, first);
  assert.equal(first.takenAt, 123);
  assert.equal(Object.keys(first.answers).length, 24);
  assert.equal(Object.values(first.percents).reduce((a, b) => a + b, 0), 100);
  const replacement = await completeGunaQuiz({ ...answers, Q01: 5 }, save, done, 456);
  assert.equal(saved, replacement);
  assert.notDeepEqual(replacement.scores, first.scores);
  assert.deepEqual(calls, ['save', 'done', 'save', 'done']);
});
void test('partial answers and rejected saves cannot finish the prompt', async () => {
  let done = false;
  const markDone = async () => { done = true; };
  await assert.rejects(completeGunaQuiz({ Q01: 3 }, async () => assert.fail('must not save partial answers'), markDone), /Answer all 24/);
  const answers = Object.fromEntries(coreQuestions.map(q => [q.id, 3]));
  await assert.rejects(completeGunaQuiz(answers, async () => { throw new Error('offline'); }, markDone), /offline/);
  assert.equal(done, false);
});

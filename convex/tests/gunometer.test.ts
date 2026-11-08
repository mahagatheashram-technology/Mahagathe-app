import assert from 'node:assert/strict';
import { test } from 'node:test';
import { coreQuestions } from '../../src/features/gunometer/lib/questions';
import { computeResult } from '../../src/features/gunometer/lib/scoring';
import { gunaResultFromAnswers, groupVakyams } from '../../src/data/v14';
import { vakyams } from '../../src/data/fixtures';

void test('upstream scoring: midpoint is balanced, percentages total 100, quality flags remain', () => {
  // Source commit has 24 items; never silently invent item 25 to match a mock.
  assert.equal(coreQuestions.length, 24);
  const answers = Object.fromEntries(coreQuestions.map(q => [q.id, 3]));
  const result = computeResult(answers, 120);
  assert.deepEqual(result.scores0to100, { sattva: 50, rajas: 50, tamas: 50 });
  assert.deepEqual(result.profilePercent, { sattva: 34, rajas: 33, tamas: 33 });
  assert.equal(result.profileType, 'balanced');
  assert.deepEqual(result.dataQualityFlags, ['speeding', 'straightlining']);
});
void test('reverse scored responses and weighted mappings produce the upstream sattva profile', () => {
  const answers = Object.fromEntries(coreQuestions.map(q => [q.id, q.reverseScored ? q.mapping.primary.guna === 'sattva' ? 1 : 5 : q.mapping.primary.guna === 'sattva' ? 5 : 1]));
  const result = computeResult(answers, 400);
  assert.equal(result.dominantGuna, 'sattva');
  assert.equal(result.profileType, 'dominant');
  assert.equal(Object.values(result.profilePercent).reduce((a, b) => a + b), 100);
  assert.ok(result.scores0to100.sattva > 90);
  const saved = gunaResultFromAnswers(answers, 123);
  assert.deepEqual(saved.scores, result.scores0to100);
  assert.equal(saved.takenAt, 123);
  assert.throws(() => gunaResultFromAnswers({ Q01: 6 }, 123), /Answer all 24/);
});
void test('catalogue sorts dates descending within month groups', () => {
  const items = [vakyams[3], { ...vakyams[0], date: '2026-10-31' }, vakyams[0]];
  const groups = groupVakyams(items);
  assert.deepEqual(groups.map(g => g.month), ['2026-11', '2026-10']);
  assert.equal(groups[0].vakyams[0].id, vakyams[0].id);
});

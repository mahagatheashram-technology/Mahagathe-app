import type { YakshaQuestion } from '@/data';

/** Review markers such as "[verse to confirm]" stay on screen, but not in shared copy. */
const TAG = /\s*\[[^\]]+\]\s*$/;

export function splitReviewTag(text: string): { body: string; tag: string | null } {
  const match = text.match(TAG);
  return match ? { body: text.slice(0, match.index).trimEnd(), tag: match[0].trim() } : { body: text, tag: null };
}

/** "Āraṇyaka Parva 3.297 [verse to confirm]" → "Mahabharata, Āraṇyaka Parva 3.297" */
export function sourceLine(question: YakshaQuestion) {
  return `Mahabharata, ${splitReviewTag(question.reference).body}`;
}

/** Plain-text fallback for the system share sheet. */
export function yakshaShareText(question: YakshaQuestion) {
  return `${question.question} … ${question.answer}. (${sourceLine(question)}) via Mahagathe`;
}

/** Answers appear in a fixed, per-question order (not always the same slot). */
export function yakshaChoices(question: YakshaQuestion) {
  const [a, b] = question.distractors;
  const slot = [...question.id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 3;
  const list = [a, b];
  list.splice(slot, 0, question.answer);
  return list;
}

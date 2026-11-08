import type { Guna, GunaResult } from '@/data';
import { v14Colors as colors } from '@/theme/tokens';
import { gunaContent } from './lib/recommendations';

export const gunaNames: Record<Guna, { title: string; dev: string; color: string }> = {
  sattva: { title: 'Sattva', dev: 'सत्त्व', color: colors.darkLeaf },
  rajas: { title: 'Rajas', dev: 'रजस्', color: colors.rajas },
  tamas: { title: 'Tamas', dev: 'तमस्', color: colors.tamas },
};
// Sattva's white strand is outlined; its display name uses dark leaf ink for AA contrast.
export function gunaDate(takenAt: number) {
  return new Date(takenAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
}
export function gunaSummary(result: GunaResult) {
  if (result.profileType === 'balanced') return `Your strands are close, with ${result.secondary} alongside ${result.dominant}.`;
  return `Your strongest strand, with ${result.secondary} ${result.profileType === 'dual' ? 'close behind' : 'as your secondary strand'}.`;
}
export function gunaSections(guna: Guna) {
  const content = gunaContent[guna];
  const summaries = guna === 'rajas' ? [
    'You decide fast, enjoy a challenge and like to see progress.',
    'Execution, leadership under pressure, fast-moving teams',
    'Energising meals, active mornings, real recovery',
    'Long waits, vague goals, burning out without rest',
  ] : [];
  return [
    { title: 'How it shows up', items: content.showsUpAs },
    { title: 'Work that suits you', items: content.workAlignment },
    { title: 'Food and daily rhythm', items: [...content.foodAlignment, ...content.dailyRhythm] },
    { title: 'What to watch for', items: content.frictionPatterns },
  ].map((section, index) => ({ ...section, summary: summaries[index] ?? section.items[0] }));
}

/**
 * W-14: spelling and transliteration tolerant matching.
 * "adi" matches "Ādi", "vakyam" matches "Vākyam", "shaunaka" matches "Śaunaka".
 */
export function foldForSearch(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[“”‘’"'`]/g, '')
    .replace(/sh/g, 's')
    .replace(/aa/g, 'a')
    .replace(/ii|ee/g, 'i')
    .replace(/uu|oo/g, 'u')
    .replace(/w/g, 'v')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every whitespace-separated term of the query must match the start of a word in the haystack. */
export function matchesFolded(haystackFolded: string, query: string): boolean {
  const terms = foldForSearch(query)
    .split(' ')
    .map((t) => t.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean);
  const padded = ` ${haystackFolded.replace(/[^a-z0-9\s]/g, ' ')} `;
  return terms.length > 0 && terms.every((t) => padded.includes(` ${t}`));
}

/** Local retrieval only: rank matching words and a small, deterministic synonym set. */
const synonyms = [ ['calm', 'steady', 'steadiness', 'settle', 'patience', 'stressful', 'stress'], ['work', 'task', 'offering', 'job'], ['family', 'home', 'walls'], ['truth', 'honest', 'conduct', 'dharma'] ];
export function semanticScore(text: string, query: string): number {
  if (!query.trim()) return 0;
  const folded = foldForSearch(text);
  if (matchesFolded(folded, query)) return 100;
  const terms = foldForSearch(query).split(' ').filter(t => t.length > 2);
  return terms.reduce((score, t) => score + (matchesFolded(folded, t) ? 4 : synonyms.some(group => group.some(s => foldForSearch(s) === t) && group.some(s => matchesFolded(folded, s))) ? 1 : 0), 0);
}

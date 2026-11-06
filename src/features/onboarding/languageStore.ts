import { useCallback, useSyncExternalStore } from 'react';

import type { Language } from '@/data';

/**
 * Local interface-language choice for Welcome (i18n itself is out of scope for this milestone).
 * Kept in memory for the session; the Profile language setting is the persisted one (P-07).
 */
export const LANGUAGES: { value: Language; label: string; name: string }[] = [
  { value: 'en', label: 'English', name: 'English' },
  { value: 'te', label: 'తెలుగు', name: 'Telugu' },
  { value: 'hi', label: 'हिंदी', name: 'Hindi' },
];

let current: Language = 'en';
const listeners = new Set<() => void>();

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useLanguagePref() {
  const language = useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  );
  const cycle = useCallback(() => {
    const i = LANGUAGES.findIndex((l) => l.value === current);
    current = LANGUAGES[(i + 1) % LANGUAGES.length].value;
    listeners.forEach((l) => l());
  }, []);
  return { language, cycle };
}

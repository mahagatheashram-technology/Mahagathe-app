import { useSyncExternalStore } from 'react';

/** Reader text size (EpisodeV3 "Aa"). Kept in memory for the session. */
export type TextSizeKey = 'small' | 'default' | 'large';

export const TEXT_SIZES: Record<TextSizeKey, { label: string; fontSize: number; lineHeight: number }> = {
  small: { label: 'Small', fontSize: 16, lineHeight: 28 },
  default: { label: 'Default', fontSize: 18, lineHeight: 31.5 },
  large: { label: 'Large', fontSize: 21, lineHeight: 37 },
};

let current: TextSizeKey = 'default';
const listeners = new Set<() => void>();

export function setTextSize(next: TextSizeKey) {
  current = next;
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useTextSize(): TextSizeKey {
  return useSyncExternalStore(subscribe, () => current, () => current);
}

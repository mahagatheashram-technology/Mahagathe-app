import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { SeriesNotification } from './types';
const key = 'mg-v14-series-interest';
let state: Record<string, boolean> = {};
let loaded = false;
let hydration: Promise<void> | undefined;
let writes = Promise.resolve();
const listeners = new Set<() => void>();
function hydrate() {
  return (hydration ??= (async () => {
    try {
      const raw =
        Platform.OS === 'web' ? localStorage.getItem(key) : await SecureStore.getItemAsync(key);
      const parsed: unknown = JSON.parse(raw ?? '{}');
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed))
        state = Object.fromEntries(
          Object.entries(parsed).filter(([id, value]) => /^[a-z0-9-]+$/.test(id) && value === true),
        );
    } catch {
      /* Current-session preferences still work when storage is unavailable. */
    }
    loaded = true;
    listeners.forEach((l) => l());
  })());
}
export function useLocalSeriesNotification(seriesId: string): SeriesNotification {
  useEffect(() => {
    void hydrate();
  }, []);
  const enabled = useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => (loaded ? state[seriesId] === true : undefined),
    () => undefined,
  );
  const setEnabled = useCallback(
    async (value: boolean) => {
      await hydrate();
      const write = writes.then(async () => {
        const next = { ...state, [seriesId]: value };
        const serialized = JSON.stringify(next);
        if (Platform.OS === 'web') localStorage.setItem(key, serialized);
        else await SecureStore.setItemAsync(key, serialized);
        state = next;
        listeners.forEach((l) => l());
      });
      writes = write.catch(() => {});
      await write;
    },
    [seriesId],
  );
  return { enabled, setEnabled };
}

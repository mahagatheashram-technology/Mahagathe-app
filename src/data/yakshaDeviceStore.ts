/** Anonymous daily answers survive app reloads, independently of any account. */
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { YakshaState } from './types';
const key = 'mg-v14-guest-yaksha';
let answers: Record<string, YakshaState> = {};
const listeners = new Set<() => void>();
let hydration: Promise<void> | undefined;
function parse(value: string | null): Record<string, YakshaState> {
  try { const result = JSON.parse(value ?? '{}'); return result && typeof result === 'object' && !Array.isArray(result) ? result : {}; } catch { return {}; }
}
export function hydrateGuestYaksha() {
  return hydration ??= (async () => {
    try {
      const saved = Platform.OS === 'web' ? typeof localStorage === 'undefined' ? null : localStorage.getItem(key) : await SecureStore.getItemAsync(key);
      answers = { ...parse(saved), ...answers }; listeners.forEach(l => l());
    } catch { /* Device storage can be unavailable; current-session answers still work. */ }
  })();
}
export function useGuestYakshaAnswers() {
  void hydrateGuestYaksha();
  return useSyncExternalStore(l => { listeners.add(l); return () => { listeners.delete(l); }; }, () => answers, () => answers);
}
export async function saveGuestYakshaAnswer(day: string, state: YakshaState) {
  await hydrateGuestYaksha();
  if (answers[day]?.revealed) return;
  answers = { ...answers, [day]: state }; listeners.forEach(l => l());
  // Keep at most seven day records; SecureStore has limited per-value capacity.
  const persisted = Object.fromEntries(Object.entries(answers).sort(([a], [b]) => b.localeCompare(a)).slice(0, 7));
  const value = JSON.stringify(persisted);
  try { if (Platform.OS === 'web') localStorage.setItem(key, value); else await SecureStore.setItemAsync(key, value); } catch { /* Retain current-session state. */ }
}

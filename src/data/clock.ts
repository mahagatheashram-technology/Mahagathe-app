import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

export const istDay = (now: number) => new Date(now + 330 * 60_000).toISOString().slice(0, 10);
let now = Date.now();
function subscribe(listener: () => void) {
  now = Date.now();
  const resume = AppState.addEventListener('change', state => { if (state === 'active') { now = Date.now(); listener(); } });
  const timer = setInterval(() => { now = Date.now(); listener(); }, 15_000);
  return () => { clearInterval(timer); resume.remove(); };
}
/** Shared day/cutoff invalidation for the zero-key demo, including a resumed app. */
export function useClock() { return useSyncExternalStore(subscribe, () => now, () => now); }

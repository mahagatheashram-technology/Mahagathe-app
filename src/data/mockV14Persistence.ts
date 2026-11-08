/** Mock account state survives reloads without putting phone numbers in storage keys. */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { MockState } from './mockStore';
import { getState } from './mockStore';
import { gunaResultFromAnswers } from './v14';

type Saved = Pick<MockState, 'gunaResult' | 'gunaPrompt' | 'practiceUnlocks' | 'seriesAccess' | 'yakshaAnswers'>;
export function mockAccountKey(phone: string) {
  let hash = 2166136261;
  for (const c of phone) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return `mg-v14-mock-${(hash >>> 0).toString(16)}`;
}
export async function readMockV14(phone: string): Promise<Partial<Saved>> {
  try {
    const key = mockAccountKey(phone);
    const value = Platform.OS === 'web' ? localStorage.getItem(key) : await SecureStore.getItemAsync(key);
    if (!value) return {};
    const saved: Saved = JSON.parse(value);
    if (!['unseen', 'later', 'done'].includes(saved.gunaPrompt)) return {};
    return { gunaPrompt: saved.gunaPrompt, gunaResult: saved.gunaResult ? gunaResultFromAnswers(saved.gunaResult.answers, saved.gunaResult.takenAt) : null,
      practiceUnlocks: { dhyanbhaari: saved.practiceUnlocks?.dhyanbhaari === true }, seriesAccess: Array.isArray(saved.seriesAccess) ? saved.seriesAccess.filter(id => typeof id === 'string') : [], yakshaAnswers: saved.yakshaAnswers ?? {} };
  } catch { return {}; }
}
let writes = Promise.resolve();
export function persistMockV14() {
  const s = getState(); const key = s.accountStorageKey;
  if (!key) return Promise.resolve();
  const data: Saved = { gunaResult: s.gunaResult, gunaPrompt: s.gunaPrompt, practiceUnlocks: s.practiceUnlocks, seriesAccess: s.seriesAccess,
    yakshaAnswers: Object.fromEntries(Object.entries(s.yakshaAnswers).sort(([a], [b]) => b.localeCompare(a)).slice(0, 5)) };
  const value = JSON.stringify(data);
  writes = writes.then(async () => { try { if (Platform.OS === 'web') localStorage.setItem(key, value); else await SecureStore.setItemAsync(key, value); } catch { /* Current-session state remains functional when storage is unavailable. */ } });
  return writes;
}
export async function eraseMockV14() {
  const key = getState().accountStorageKey; if (!key) return;
  await writes;
  try { if (Platform.OS === 'web') localStorage.removeItem(key); else await SecureStore.deleteItemAsync(key); } catch { /* Storage can be unavailable. */ }
}

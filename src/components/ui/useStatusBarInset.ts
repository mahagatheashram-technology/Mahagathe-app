import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** The mocks reserve ~52px at the top for the status bar. Use the device inset; fall back to 52 where there is none (web). */
export const MOCK_STATUS_BAR = 52;

export function useStatusBarInset() {
  const { top } = useSafeAreaInsets();
  return top > 0 ? top : MOCK_STATUS_BAR;
}

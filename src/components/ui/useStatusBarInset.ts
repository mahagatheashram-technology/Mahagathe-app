import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** The mocks reserve ~52px at the top for the status bar. Use the device inset; fall back to 52 where there is none (web). */
export const MOCK_STATUS_BAR = 52;

export function useStatusBarInset() {
  const { top } = useSafeAreaInsets();
  return top > 0 ? top : MOCK_STATUS_BAR;
}

/** Native uses the device's inset; web reserves the v3 mock's status area. */
export function useScreenInsets() {
  const insets = useSafeAreaInsets();
  return { ...insets, top: Platform.OS === 'web' ? MOCK_STATUS_BAR : insets.top };
}

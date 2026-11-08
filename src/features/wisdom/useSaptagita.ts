import { useCallback, useState } from 'react';
import { Linking, Platform } from 'react-native';
import type { ExternalLinks } from '@/data';

/** Shown on iOS until the App Store listing exists (there is no id to link to yet). */
export const SAPTAGITA_IOS_MESSAGE = 'Install Saptagita from the App Store';

type Links = Pick<ExternalLinks, 'saptagita' | 'saptagitaWeb'> | null | undefined;

/**
 * One way to open the sibling Saptagita app: try `saptagita://`; if that fails (or on web) fall
 * back to the Play Store page on Android/web. iOS has no store link yet, so it returns a short
 * inline message instead. Every failure is caught and surfaces as `message`.
 */
export function useOpenSaptagita(links: Links) {
  const [message, setMessage] = useState<string | null>(null);
  const open = useCallback(async () => {
    if (!links?.saptagita) {
      setMessage('The Saptagita link is not available yet.');
      return;
    }
    try {
      if (Platform.OS === 'web') {
        await Linking.openURL(links.saptagitaWeb);
      } else {
        try {
          await Linking.openURL(links.saptagita);
        } catch {
          if (Platform.OS === 'ios') {
            setMessage(SAPTAGITA_IOS_MESSAGE);
            return;
          }
          await Linking.openURL(links.saptagitaWeb);
        }
      }
      setMessage(null);
    } catch {
      setMessage(
        Platform.OS === 'ios'
          ? SAPTAGITA_IOS_MESSAGE
          : 'Install Saptagita to open the app, then try again.',
      );
    }
  }, [links]);
  return { open, message };
}

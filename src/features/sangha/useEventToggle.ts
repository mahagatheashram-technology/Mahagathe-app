import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useRegisterForEvent, useSession, type EventItem } from '@/data';

/**
 * Register ↔ Going for one event list. Guests are sent to Welcome (T-01).
 * `busyId` is the event whose change is in flight.
 */
export function useEventToggle() {
  const router = useRouter();
  const { status, canUsePersonalFeatures: isSignedIn } = useSession();
  const register = useRegisterForEvent();
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = useCallback(
    async (event: EventItem) => {
      if (!isSignedIn) {
        router.push(status === 'signedIn' ? '/setup' : '/welcome');
        return;
      }
      setBusyId(event.id);
      try {
        await register(event.id, !event.registered);
      } catch {
        Alert.alert('Registration unchanged', 'We could not update your registration. Please try again.');
      } finally {
        setBusyId(null);
      }
    },
    [isSignedIn, status, register, router],
  );
  return { toggle, busyId };
}

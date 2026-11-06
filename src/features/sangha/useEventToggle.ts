import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useRegisterForEvent, useSession, type EventItem } from '@/data';

/**
 * Register ↔ Going for one event list. Guests are sent to Welcome (T-01).
 * `busyId` is the event whose change is in flight.
 */
export function useEventToggle() {
  const router = useRouter();
  const { isSignedIn } = useSession();
  const register = useRegisterForEvent();
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = useCallback(
    async (event: EventItem) => {
      if (!isSignedIn) {
        router.push('/welcome');
        return;
      }
      setBusyId(event.id);
      try {
        await register(event.id, !event.registered);
      } finally {
        setBusyId(null);
      }
    },
    [isSignedIn, register, router],
  );
  return { toggle, busyId };
}

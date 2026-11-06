import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useSession } from '@/data';

/** Guests (T-01) can browse, but practice, Mandala and reminders need sign-in: route them to /welcome. */
export function useAuthGate() {
  const router = useRouter();
  const { status } = useSession();
  const signedIn = status === 'signedIn';
  const gate = useCallback(
    (action: () => void) => () => {
      if (signedIn) action();
      else router.push('/welcome');
    },
    [signedIn, router],
  );
  return { signedIn, gate };
}

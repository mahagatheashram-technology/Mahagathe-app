import { Redirect, useSegments } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useProfile, useSession } from '@/data';
import { colors } from '@/theme/tokens';

/** Restored sessions and deep links obey the same setup/consent gate as OTP. */
export function AccountRouteGate({ children }: { children: ReactNode }) {
  const { status, canUsePersonalFeatures } = useSession();
  const profile = useProfile();
  const segments = useSegments();
  if (status === 'loading') return <View style={{ flex: 1, backgroundColor: colors.cream, justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Loading your account" color={colors.actionRed} /></View>;
  if (status === 'signedIn' && (!canUsePersonalFeatures || !profile?.displayName.trim()) && segments[0] !== 'setup' && segments[0] !== 'welcome') return <Redirect href="/setup" />;
  return <>{children}</>;
}

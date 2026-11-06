import type { ReactNode } from 'react';

/**
 * Single place for app-wide providers. Backend thread adds ClerkProvider +
 * ConvexProviderWithClerk here, only when the EXPO_PUBLIC_* keys are present
 * (otherwise the app stays in mock mode so it runs in Expo Go with no setup).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

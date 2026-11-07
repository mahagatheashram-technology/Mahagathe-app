import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import type { ReactNode } from 'react';

import { clerkPublishableKey, convexUrl, isLiveBackend } from '../data/backend';
import { LiveSessionProvider } from './LiveSessionProvider';

const convex = isLiveBackend ? new ConvexReactClient(convexUrl!) : null;

export function LiveAppProviders({ children }: { children: ReactNode }) {
  if (!convex) return <>{children}</>;
  return (
    <ClerkProvider publishableKey={clerkPublishableKey!} tokenCache={tokenCache}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <LiveSessionProvider>{children}</LiveSessionProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

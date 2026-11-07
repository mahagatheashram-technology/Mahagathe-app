/* eslint-disable @typescript-eslint/no-require-imports -- avoid evaluating auth SDKs in zero-key mode */
import type { ReactNode } from 'react';
import { isLiveBackend } from '../data/backend';

// Do not even evaluate Clerk's SDK in zero-key mode.
const LiveProviders = isLiveBackend
  ? (require('./LiveAppProviders') as typeof import('./LiveAppProviders')).LiveAppProviders
  : null;
export function AppProviders({ children }: { children: ReactNode }) {
  return LiveProviders ? <LiveProviders>{children}</LiveProviders> : <>{children}</>;
}

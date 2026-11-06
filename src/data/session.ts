import { isMinor, type Profile, type SessionStatus } from './types';

/** Clerk authentication alone never grants permission to store personal data. */
export function canUsePersonalFeatures(status: SessionStatus, profile: Profile | null | undefined): boolean {
  return status === 'signedIn' && profile?.ageBand != null &&
    (!isMinor(profile.ageBand) || profile.guardianConsent === 'granted');
}

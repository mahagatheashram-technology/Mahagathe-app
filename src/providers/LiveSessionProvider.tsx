import { useAuth, useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useConvexAuth, useMutation, useQuery } from 'convex/react';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { api } from '../../convex/_generated/api';
import { AppText, Button, Screen } from '../components/ui';
import type { Profile, SessionStatus, Session } from '../data/types';
import { canUsePersonalFeatures } from '../data/session';
import { phoneWithCountryCode } from '../data/phone';

export type LiveSession = Session & { profile: Profile | null | undefined };
const SessionContext = createContext<LiveSession | null>(null);

/** One auth/OTP state shared by every hook; bootstrap also covers restored sessions. */
export function LiveSessionProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const signInState = useSignIn();
  const signUpState = useSignUp();
  const upsert = useMutation(api.profiles.upsertFromIdentity);
  const profile = useQuery(api.profiles.me, isAuthenticated ? {} : 'skip');
  const [guest, setGuest] = useState(false);
  const [bootstrapError, setBootstrapError] = useState<Error | null>(null);
  const flow = useRef<'signIn' | 'signUp' | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    void upsert({}).catch((error: unknown) => {
      if (!cancelled) setBootstrapError(error instanceof Error ? error : new Error('Account setup failed.'));
    });
    return () => { cancelled = true; };
  }, [isAuthenticated, auth.userId, upsert]);

  const sendOtp = useCallback(async (input: string) => {
    if (busy.current) return;
    if (!signInState.isLoaded || !signUpState.isLoaded) throw new Error('Authentication is still loading.');
    busy.current = true;
    flow.current = null;
    try {
      const phone = phoneWithCountryCode(input);
      try {
        const attempt = await signInState.signIn.create({ identifier: phone });
        const factor = attempt.supportedFirstFactors?.find(f => f.strategy === 'phone_code');
        if (!factor || factor.strategy !== 'phone_code') throw new Error('Phone code sign-in is unavailable for this account.');
        await signInState.signIn.prepareFirstFactor({ strategy: 'phone_code', phoneNumberId: factor.phoneNumberId });
        flow.current = 'signIn';
      } catch (error: unknown) {
        // Only an unknown identifier starts sign-up; rate limits and invalid
        // numbers must remain errors rather than creating a different flow.
        const errors = typeof error === 'object' && error !== null && 'errors' in error ? error.errors : null;
        const unknownNumber = Array.isArray(errors) && errors.some((e: unknown) => typeof e === 'object' && e !== null && 'code' in e && e.code === 'form_identifier_not_found');
        if (!unknownNumber) throw error;
        await signUpState.signUp.create({ phoneNumber: phone });
        await signUpState.signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
        flow.current = 'signUp';
      }
    } finally { busy.current = false; }
  }, [signInState, signUpState]);

  const verifyOtp = useCallback(async (code: string) => {
    if (busy.current || !/^\d{6}$/.test(code)) return false;
    if (!signInState.isLoaded || !signUpState.isLoaded || !flow.current) throw new Error('Request a phone code first.');
    busy.current = true;
    try {
      const result = flow.current === 'signIn'
        ? await signInState.signIn.attemptFirstFactor({ strategy: 'phone_code', code })
        : await signUpState.signUp.attemptPhoneNumberVerification({ code });
      if (result.status !== 'complete' || !result.createdSessionId) throw new Error('Additional Clerk verification is required. Contact support.');
      await signInState.setActive({ session: result.createdSessionId });
      setGuest(false);
      setBootstrapError(null);
      flow.current = null;
      return true;
    } finally { busy.current = false; }
  }, [signInState, signUpState]);

  const signOut = useCallback(async () => {
    await auth.signOut();
    setGuest(false);
    setBootstrapError(null);
    flow.current = null;
  }, [auth]);
  const continueAsGuest = useCallback(() => setGuest(true), []);
  if (bootstrapError && !guest) return <Screen contentStyle={{ padding: 24, gap: 16, justifyContent: 'center' }}>
    <AppText>We could not load your account. Please try again.</AppText>
    <Button label="Try again" onPress={() => { setBootstrapError(null); void upsert({}).catch((e: unknown) => setBootstrapError(e instanceof Error ? e : new Error('Account setup failed.'))); }} />
    <Button label="Explore as a guest" variant="quiet" onPress={continueAsGuest} />
  </Screen>;
  const status: SessionStatus = guest ? 'guest'
    : !auth.isLoaded || isLoading || (auth.isSignedIn && (!isAuthenticated || !profile)) ? 'loading'
      : auth.isSignedIn ? 'signedIn' : 'signedOut';
  const visibleProfile = guest || !auth.isSignedIn ? null : profile;
  return (
    <SessionContext.Provider value={{ status, isSignedIn: status === 'signedIn', canUsePersonalFeatures: canUsePersonalFeatures(status, visibleProfile), profile: visibleProfile, sendOtp, verifyOtp, signOut, continueAsGuest }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useLiveSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('Live hooks require AppProviders.');
  return value;
}

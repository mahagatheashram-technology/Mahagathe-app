import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { useGunaPrompt, useProfile, useSession } from '@/data';
import { OtpStep } from '@/features/onboarding/OtpStep';
import { PhoneStep } from '@/features/onboarding/PhoneStep';

export default function SignInScreen() {
  const router = useRouter();
  const { status, canUsePersonalFeatures, sendOtp, verifyOtp } = useSession();
  const profile = useProfile();
  const gunaPrompt = useGunaPrompt();

  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [busy, setBusy] = useState(false);
  // Synchronous guard: Return-key submits ignore the busy prop, and state updates are async.
  const inFlight = useRef(false);
  const [error, setError] = useState<string | null>(null);

  // Once verified, go to Setup if the profile is incomplete (P-03), otherwise straight in.
  useEffect(() => {
    if (status !== 'signedIn' || !profile) return;
    if (!canUsePersonalFeatures || !profile.displayName.trim()) { router.replace('/setup'); return; }
    if (gunaPrompt) router.replace(gunaPrompt.state === 'unseen' ? '/gunometer/intro' : '/(tabs)');
  }, [status, canUsePersonalFeatures, gunaPrompt, profile, router]);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/welcome'));

  if (step === 'otp') {
    return (
      <OtpStep
        phone={phone}
        verifying={busy}
        error={error}
        onBack={() => {
          setError(null);
          setStep('phone');
        }}
        onResend={async () => {
          setError(null);
          await sendOtp(`+91${phone}`);
        }}
        onVerify={async (code) => {
          if (inFlight.current) return;
          inFlight.current = true;
          setBusy(true);
          setError(null);
          try {
            const ok = await verifyOtp(code);
            if (!ok) setError('That code does not look right. Enter the 6 digits we sent.');
          } catch {
            setError('We could not check the code. Please try again.');
          } finally {
            inFlight.current = false;
            setBusy(false);
          }
        }}
      />
    );
  }

  return (
    <PhoneStep
      initialPhone={phone}
      sending={busy}
      error={error}
      onBack={back}
      onSend={async (p) => {
        if (inFlight.current) return;
        inFlight.current = true;
        setBusy(true);
        setError(null);
        try {
          await sendOtp(`+91${p}`);
          setPhone(p);
          setStep('otp');
        } catch {
          setError('We could not send the code. Please try again.');
        } finally {
          inFlight.current = false;
          setBusy(false);
        }
      }}
    />
  );
}

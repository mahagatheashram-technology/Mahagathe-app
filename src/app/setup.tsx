import { Redirect, useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { isMinor, useProfile, useRequestGuardianConsent, useSession, useUpdateProfile, type AgeBand } from '@/data';
import { GuardianAsk, GuardianWaiting } from '@/features/onboarding/GuardianConsent';
import { SetupForm } from '@/features/onboarding/SetupForm';

type Step = 'form' | 'guardianAsk' | 'guardianWaiting';

export default function SetupScreen() {
  const router = useRouter();
  const { status, continueAsGuest } = useSession();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const requestConsent = useRequestGuardianConsent();

  const [step, setStep] = useState<Step>(profile?.guardianConsent === 'pending' ? 'guardianWaiting' : 'form');
  const [band, setBand] = useState<AgeBand | null>(null);
  const [draftName, setDraftName] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'signedOut' || status === 'guest') return <Redirect href="/welcome" />;

  const back = () => (router.canGoBack() ? router.back() : router.replace('/welcome'));

  if (step === 'guardianWaiting' && profile?.guardianConsent !== 'granted') {
    return (
      <GuardianWaiting
        maskedPhone={maskedPhone || 'the number you gave'}
        onBack={() => { setBand(profile?.ageBand ?? band); setStep(profile?.ageBand ? 'guardianAsk' : 'form'); }}
        onExplore={() => {
          continueAsGuest();
          router.replace('/(tabs)');
        }}
      />
    );
  }

  if (step === 'guardianAsk' && band && profile?.guardianConsent !== 'granted') {
    return (
      <GuardianAsk
        sending={busy}
        error={error}
        onBack={() => {
          setError(null);
          setStep('form');
        }}
        onSend={async (guardianPhone) => {
          if (inFlight.current) return;
          inFlight.current = true;
          setBusy(true);
          setError(null);
          try {
            await requestConsent({ ageBand: band, guardianPhone });
            setMaskedPhone(`+91 ••••• ••${guardianPhone.slice(-3)}`);
            setStep('guardianWaiting');
          } catch {
            setError('We could not send the request. Please try again.');
          } finally {
            inFlight.current = false;
            setBusy(false);
          }
        }}
      />
    );
  }

  return (
    <SetupForm
      initialName={draftName || profile?.displayName || ''}
      initialBand={band ?? profile?.ageBand ?? null}
      saving={busy}
      error={error}
      lockedBand={!!profile?.ageBand && isMinor(profile.ageBand)}
      onBack={back}
      onSubmit={async (name, picked) => {
        setBand(picked);
        setDraftName(name);
        // T-02: under 18 → stop and ask a guardian first. Nothing is saved at this point.
        if (isMinor(picked) && profile?.guardianConsent !== 'granted') {
          setStep('guardianAsk');
          return;
        }
        if (inFlight.current) return;
        inFlight.current = true;
        setBusy(true);
        setError(null);
        try {
          await updateProfile({ displayName: name, ageBand: picked });
          router.replace('/(tabs)');
        } catch {
          setError('We could not save your profile. Please try again.');
        } finally {
          inFlight.current = false;
          setBusy(false);
        }
      }}
    />
  );
}

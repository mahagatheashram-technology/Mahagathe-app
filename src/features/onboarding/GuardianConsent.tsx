import { useState } from 'react';
import { Pressable } from 'react-native';

import { AppText, Button } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';
import { AuthScaffold, InfoCallout, ScreenTitle } from './AuthScaffold';
import { TextField } from './TextField';

/**
 * PRD P-04 / T-02: a user under 18 must have a parent or guardian agree before anything is saved.
 * Step 1 (ask): collect the guardian's mobile number. Step 2 (waiting): nothing is saved yet; the user may browse as a guest.
 */
export function GuardianAsk({
  sending,
  error,
  onBack,
  onSend,
}: {
  sending: boolean;
  error: string | null;
  onBack: () => void;
  onSend: (guardianPhone: string) => void;
}) {
  const [phone, setPhone] = useState('');
  const [tried, setTried] = useState(false);
  const valid = /^[6-9]\d{9}$/.test(phone);
  const fieldError = error ?? (tried && !valid ? 'Enter a 10-digit Indian mobile number.' : null);

  return (
    <AuthScaffold
      stepLabel="Step 2 of 2"
      onBack={onBack}
      cta={
        <Button
          label="Ask my parent or guardian"
          loading={sending}
          onPress={() => {
            setTried(true);
            if (valid) onSend(phone);
          }}
        />
      }>
      <ScreenTitle
        title="We need a parent or guardian"
        subtitle="Because you are under 18, a parent or guardian has to agree before we keep anything about you."
      />

      <TextField
        label="Their mobile number"
        hint="We use it only to send one message asking for their consent."
        error={fieldError}
        prefix="+91"
        value={phone}
        onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
        keyboardType="number-pad"
        autoComplete="tel-national"
        textContentType="telephoneNumber"
        maxLength={10}
        placeholder="98765 43210"
      />

      <InfoCallout>
        We will send them a message with what we collect and why. Until they agree, we save nothing about you, not even
        your name.
      </InfoCallout>
    </AuthScaffold>
  );
}

export function GuardianWaiting({
  maskedPhone,
  onBack,
  onExplore,
}: {
  maskedPhone: string;
  onBack: () => void;
  onExplore: () => void;
}) {
  return (
    <AuthScaffold stepLabel="Step 2 of 2" onBack={onBack} cta={<Button label="Explore as a guest" onPress={onExplore} />}>
      <ScreenTitle
        title="Waiting for your guardian"
        subtitle={`We asked the guardian at ${maskedPhone} to agree. You can finish setting up as soon as they do.`}
      />

      <InfoCallout>
        Nothing about you is saved yet. While you wait, you can read Guru Vākyams and Wisdom as a guest.
      </InfoCallout>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Use a different age band or number"
        onPress={onBack}
        style={{ alignSelf: 'center', minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', marginTop: -8 }}>
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21, color: colors.actionRed }}>
          Change age band or number
        </AppText>
      </Pressable>
    </AuthScaffold>
  );
}

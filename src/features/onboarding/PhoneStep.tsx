import { useState } from 'react';

import { Button } from '@/components/ui';
import { AuthScaffold, InfoCallout, ScreenTitle } from './AuthScaffold';
import { TextField } from './TextField';

/** Sign-in, part 1: Indian mobile number (+91). */
export function PhoneStep({
  initialPhone,
  sending,
  error,
  onBack,
  onSend,
}: {
  initialPhone: string;
  sending: boolean;
  error: string | null;
  onBack: () => void;
  onSend: (phone: string) => void;
}) {
  const [phone, setPhone] = useState(initialPhone);
  const [tried, setTried] = useState(false);
  const valid = /^[6-9]\d{9}$/.test(phone);
  const fieldError = error ?? (tried && !valid ? 'Enter a 10-digit Indian mobile number.' : null);

  const send = () => {
    setTried(true);
    if (valid) onSend(phone);
  };

  return (
    <AuthScaffold
      stepLabel="Step 1 of 2"
      onBack={onBack}
      cta={<Button label="Send code" loading={sending} onPress={send} />}>
      <ScreenTitle
        title="Your phone number"
        subtitle="We will send a 6-digit code by SMS. There is no password to remember."
      />
      <TextField
        label="Mobile number"
        hint="Indian numbers only for now."
        error={fieldError}
        prefix="+91"
        value={phone}
        onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
        keyboardType="number-pad"
        autoComplete="tel-national"
        textContentType="telephoneNumber"
        maxLength={10}
        placeholder="98765 43210"
        returnKeyType="done"
        onSubmitEditing={send}
      />
      <InfoCallout>
        We use your number only to sign you in. Guests can keep reading Guru Vākyams and Wisdom without one.
      </InfoCallout>
    </AuthScaffold>
  );
}

import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Button } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';
import { AuthScaffold, InfoCallout, ScreenTitle } from './AuthScaffold';
import { TextField } from './TextField';

const RESEND_SECONDS = 30;

/** Sign-in, part 2: the 6-digit code. */
export function OtpStep({
  phone,
  verifying,
  error,
  onBack,
  onVerify,
  onResend,
}: {
  phone: string;
  verifying: boolean;
  error: string | null;
  onBack: () => void;
  onVerify: (code: string) => void;
  onResend: () => Promise<void>;
}) {
  const [code, setCode] = useState('');
  const [wait, setWait] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const pretty = `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;

  return (
    <AuthScaffold
      stepLabel="Step 1 of 2"
      onBack={onBack}
      cta={<Button label="Verify and continue" loading={verifying} onPress={() => onVerify(code)} />}>
      <ScreenTitle title="Enter the code" subtitle={`We sent a 6-digit code to ${pretty}.`} />
      <View style={{ gap: 4 }}>
        <TextField
          label="6-digit code"
          error={error}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          maxLength={6}
          placeholder="••••••"
          returnKeyType="done"
          onSubmitEditing={() => onVerify(code)}
          inputStyle={{ fontFamily: fonts.sansMedium, fontSize: 22, letterSpacing: 8, textAlign: 'center' }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: wait > 0 }}
          accessibilityLabel={wait > 0 ? `Resend code in ${wait} seconds` : 'Resend code'}
          disabled={wait > 0}
          onPress={async () => {
            setWait(RESEND_SECONDS);
            await onResend();
          }}
          style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' }}>
          <AppText
            style={{
              fontFamily: fonts.sansSemibold,
              fontSize: 14,
              lineHeight: 21,
              color: wait > 0 ? colors.muted : colors.actionRed,
            }}>
            {wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}
          </AppText>
        </Pressable>
      </View>
      <InfoCallout>Wrong number? Go back and change it. We never share your number.</InfoCallout>
    </AuthScaffold>
  );
}

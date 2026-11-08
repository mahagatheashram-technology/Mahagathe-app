import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppText, Icon, PrimaryButton } from '@/components/ui';
import { useProfile, useVolunteerSignup } from '@/data';
import { BottomSheet } from './BottomSheet';
import { colors, fonts } from '@/theme/tokens';

/**
 * Mount with a fresh `key` each time it is opened so the form starts from the profile with no consent ticked.
 * G-06: consent-first volunteer form. Nothing is sent until the person ticks the consent box
 * and taps submit; the confirmation replaces the form.
 */
export function VolunteerSheet({
  visible,
  onClose,
  vibhagaId,
  vibhagaName,
}: {
  visible: boolean;
  onClose: () => void;
  vibhagaId: string;
  vibhagaName: string;
}) {
  const profile = useProfile();
  const signup = useVolunteerSignup();
  const [name, setName] = useState(profile?.displayName ?? '');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0 && consent && !busy;

  const submit = async () => {
    if (!canSubmit || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(false);
    try {
      await signup({ vibhagaId, name: name.trim(), phone: phone.trim(), consent });
      setDone(true);
    } catch {
      setError(true);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={done ? 'Thank you' : `Volunteer with ${vibhagaName}`}>
      {done ? (
        <>
          <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.lateriteSoft, borderWidth: 2, borderColor: colors.laterite, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={28} color={colors.laterite} strokeWidth={2.2} />
            </View>
            <AppText accessibilityLiveRegion="polite" style={{ textAlign: 'center', fontFamily: fonts.uiMedium, fontSize: 14, lineHeight: 22.4 }}>
              We have shared your name and number with the {vibhagaName} team. The team may contact you about seva opportunities.
            </AppText>
          </View>
          <PrimaryButton label="Done" onPress={onClose} />
        </>
      ) : (
        <>
          <AppText style={{ fontFamily: fonts.uiMedium, fontSize: 14, lineHeight: 22.4, color: colors.text2 }}>
            Tell the {vibhagaName} team how to reach you. We only use these details to contact you about volunteering.
          </AppText>
          <Field label="Your name" value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
          <Field label="Mobile number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: consent }}
            accessibilityLabel={`I agree that Mahagathe may share my name and number with the ${vibhagaName} team so they can contact me about volunteering.`}
            onPress={() => setConsent((c) => !c)}
            style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', minHeight: 44 }}>
            <View
              style={{
                width: 22,
                height: 22,
                marginTop: 1,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: consent ? colors.laterite : colors.text2,
                backgroundColor: consent ? colors.laterite : colors.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {consent ? <Icon name="check" size={14} color={colors.white} strokeWidth={3} /> : null}
            </View>
            <AppText style={{ flex: 1, fontFamily: fonts.uiMedium, fontSize: 13, lineHeight: 20.8 }}>
              I agree that Mahagathe may share my name and number with the {vibhagaName} team so they can contact me about volunteering. I can withdraw this at any time.
            </AppText>
          </Pressable>
          {error ? (
            <AppText accessibilityLiveRegion="polite" variant="caption" color={colors.actionRed}>
              We could not send this just now. Please try again.
            </AppText>
          ) : null}
          <PrimaryButton label="Send my details" onPress={submit} disabled={!canSubmit} loading={busy} />
        </>
      )}
    </BottomSheet>
  );
}

function Field({
  label,
  ...input
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={{ gap: 6 }}>
      <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 13, lineHeight: 19.5 }}>{label}</AppText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        {...input}
        style={{
          height: 50,
          paddingHorizontal: 16,
          borderRadius: 14,
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.line,
          fontFamily: fonts.ui,
          fontSize: 15,
          color: colors.ink,
          outlineStyle: 'none',
        } as never}
      />
    </View>
  );
}

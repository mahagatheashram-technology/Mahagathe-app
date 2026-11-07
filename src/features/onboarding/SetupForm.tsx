import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';

import { AppText, Button, DetailHeader, Icon, Screen } from '@/components/ui';
import { AGE_BANDS, type AgeBand } from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { v12 } from '@/theme/v12';

/** Name and age, with an equal option to leave age unspecified. */
export function SetupForm({
  initialName,
  initialBand,
  saving,
  error,
  lockedBand,
  onBack,
  onSubmit,
}: {
  initialName: string;
  initialBand: AgeBand | null;
  saving: boolean;
  error?: string | null;
  lockedBand?: boolean;
  onBack: () => void;
  onSubmit: (name: string, band: AgeBand) => void;
}) {
  const [name, setName] = useState(initialName);
  const [band, setBand] = useState<AgeBand | null>(initialBand);
  const [tried, setTried] = useState(false);
  // DPDP: leaving age unspecified must not bypass guardian consent, so it requires an adult confirmation.
  const [adultConfirmed, setAdultConfirmed] = useState(false);

  const nameError = tried && !name.trim() ? 'Please tell us what to call you.' : null;
  const needsAdult = band === 'unspecified' && !adultConfirmed;
  const bandError = tried && !band ? 'Please choose your age band.' : tried && needsAdult ? 'Please confirm you are 18 or older, or choose your age band.' : null;

  const submit = () => {
    setTried(true);
    if (saving || !name.trim() || !band || needsAdult) return;
    onSubmit(name.trim(), band);
  };

  const rows = [AGE_BANDS.slice(0, 3), AGE_BANDS.slice(3, 6), AGE_BANDS.slice(6)];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        contentStyle={{ paddingTop: 4, paddingHorizontal: 24, paddingBottom: 40 }}
        scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
        <DetailHeader backLabel="Welcome" backHref="/welcome" onBack={onBack} label="Step 2 of 2" />
        <AppText
          accessibilityRole="header"
          style={{
            fontFamily: fonts.serifSemibold,
            fontSize: 30,
            lineHeight: 36,
            marginTop: 26,
            marginBottom: 30,
          }}>
          A little about you
        </AppText>
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23, marginBottom: 8 }}>
          What should we call you?
        </AppText>
        <TextInput
          value={name}
          onChangeText={setName}
          accessibilityLabel="What should we call you?"
          maxLength={40}
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="done"
          style={{
            height: 54,
            borderWidth: 1.5,
            borderColor: colors.ink,
            borderRadius: 14,
            paddingHorizontal: 16,
            fontFamily: fonts.sans,
            fontSize: 17,
            color: colors.ink,
            backgroundColor: colors.white,
          }}
        />
        {nameError ? (
          <AppText accessibilityLiveRegion="polite" color={colors.actionRed}>
            {nameError}
          </AppText>
        ) : null}
        <View accessibilityRole="radiogroup" accessibilityLabel="Your age" style={{ marginTop: 28 }}>
          <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23, marginBottom: 4 }}>
            Your age
          </AppText>
          <AppText style={{ fontSize: 14, lineHeight: 21, color: v12.muted, marginBottom: 12 }}>
            So we can suggest the right programmes for you.
          </AppText>
          <View style={{ gap: 10 }}>
            {rows.map((row, r) => (
              <View key={r} style={{ flexDirection: 'row', gap: 10 }}>
                {row.map((b) => {
                  const selected = band === b.value;
                  return (
                    <Pressable
                      key={b.value}
                      accessibilityRole="radio"
                      accessibilityState={{
                        selected,
                        checked: selected,
                        disabled: !!lockedBand && !selected,
                      }}
                      accessibilityLabel={b.label}
                      disabled={lockedBand && !selected}
                      onPress={() => setBand(b.value)}
                      style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 14,
                        flexDirection: 'row',
                        gap: 6,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: selected ? colors.actionRed : colors.white,
                        borderWidth: 1,
                        borderColor: selected ? colors.actionRed : v12.outline,
                      }}>
                      {selected ? <Icon name="check" size={14} color={colors.white} strokeWidth={3} /> : null}
                      <AppText
                        style={{
                          fontFamily: selected ? fonts.sansSemibold : fonts.sansMedium,
                          fontSize: 15,
                          lineHeight: 23,
                          color: selected ? colors.white : colors.ink,
                        }}>
                        {b.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
          {band === 'unspecified' ? (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: adultConfirmed }}
              accessibilityLabel="I confirm I am 18 or older"
              onPress={() => setAdultConfirmed((v) => !v)}
              style={{ marginTop: 12, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  borderWidth: 1.5,
                  borderColor: adultConfirmed ? colors.actionRed : v12.outline,
                  backgroundColor: adultConfirmed ? colors.actionRed : colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {adultConfirmed ? <Icon name="check" size={14} color={colors.white} strokeWidth={3} /> : null}
              </View>
              <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 22 }}>I confirm I am 18 or older</AppText>
            </Pressable>
          ) : null}
          {bandError ? (
            <AppText accessibilityLiveRegion="polite" color={colors.actionRed} style={{ marginTop: 8 }}>
              {bandError}
            </AppText>
          ) : null}
        </View>
        {error ? (
          <AppText accessibilityLiveRegion="polite" color={colors.actionRed}>
            {error}
          </AppText>
        ) : null}
        <View style={{ flexGrow: 1, maxHeight: 90, minHeight: 24 }} />
        <Button label="Continue" loading={saving} onPress={submit} />
        <AppText
          style={{ minHeight: 40, paddingTop: 10, textAlign: 'center', fontSize: 14, color: v12.muted }}>
          You can change these any time in Profile.
        </AppText>
      </Screen>
    </KeyboardAvoidingView>
  );
}

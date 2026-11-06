import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Button } from '@/components/ui';
import { AGE_BANDS, type AgeBand } from '@/data';
import { colors, fonts, radii } from '@/theme/tokens';
import { AuthScaffold, InfoCallout, ScreenTitle } from './AuthScaffold';
import { TextField } from './TextField';

/** SetupV3: display name + age band + why we ask. */
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

  const nameError = tried && !name.trim() ? 'Please tell us what to call you.' : null;
  const bandError = tried && !band ? 'Please choose your age band.' : null;

  const submit = () => {
    setTried(true);
    if (saving || !name.trim() || !band) return;
    onSubmit(name.trim(), band);
  };

  const rows = [AGE_BANDS.slice(0, 3), AGE_BANDS.slice(3)];

  return (
    <AuthScaffold
      stepLabel="Step 2 of 2"
      onBack={onBack}
      cta={<Button label="Continue" loading={saving} onPress={submit} />}>
      <ScreenTitle title="A little about you" subtitle="Two things, and why we ask. You can change them later in Profile." />

      <TextField
        label="What should we call you?"
        hint="Used only for your greeting. Never shown to others."
        error={nameError}
        value={name}
        onChangeText={setName}
        maxLength={40}
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="done"
      />

      <View accessibilityRole="radiogroup" accessibilityLabel="Your age band">
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21, marginBottom: 10 }}>
          Your age band
        </AppText>
        <View style={{ gap: 8 }}>
          {rows.map((row, r) => (
            <View key={r} style={{ flexDirection: 'row', gap: 8 }}>
              {row.map((b) => {
                const selected = band === b.value;
                return (
                  <Pressable
                    key={b.value}
                    accessibilityRole="radio"
                    accessibilityState={{ selected, checked: selected }}
                    accessibilityLabel={b.label}
                    disabled={lockedBand && !selected}
                    onPress={() => setBand(b.value)}
                    style={{
                      flex: 1,
                      height: 46,
                      borderRadius: radii.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? colors.actionRed : colors.white,
                      // same 1px border either way so all six cells stay equal width
                      borderWidth: 1,
                      borderColor: selected ? colors.actionRed : colors.border,
                    }}>
                    <AppText
                      style={{
                        fontFamily: selected ? fonts.sansSemibold : fonts.sansMedium,
                        fontSize: 14,
                        lineHeight: 21,
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
        {bandError ? (
          <AppText accessibilityLiveRegion="polite" style={{ marginTop: 8, fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18 }} color={colors.actionRed}>
            {bandError}
          </AppText>
        ) : null}
      </View>

      {error ? <AppText accessibilityLiveRegion="polite" color={colors.actionRed}>{error}</AppText> : null}
      <InfoCallout>
        We ask for an age band, not your birthday, so we can suggest the right programs. If you are under 18, we will
        ask a parent or guardian to agree before saving your name or personal activity.
      </InfoCallout>
    </AuthScaffold>
  );
}

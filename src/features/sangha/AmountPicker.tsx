import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';
import { formatRupees } from './format';

/** Three presets and "Other" in a 2×2 grid of large Eczar numerals; the custom field opens on "Other". */
export function AmountPicker({
  presets,
  preset,
  custom,
  onPreset,
  onCustom,
  invalid,
}: {
  presets: number[];
  preset: number | null;
  custom: string;
  onPreset: (n: number) => void;
  onCustom: (digits: string) => void;
  invalid?: boolean;
}) {
  const [other, setOther] = useState(custom !== '');
  const choices = [...presets.slice(0, 3), null];
  return (
    <View style={{ gap: 12 }}>
      <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {choices.map((n) => {
          const selected = n === null ? other : !other && custom === '' && preset === n;
          return (
            <Pressable
              key={n ?? 'other'}
              accessibilityRole="radio"
              accessibilityLabel={n === null ? 'Other amount' : formatRupees(n)}
              accessibilityState={{ checked: selected, selected }}
              onPress={() => {
                setOther(n === null);
                if (n !== null) onPreset(n);
                else onCustom('');
              }}
              style={{
                flexGrow: 1,
                flexBasis: '45%',
                height: 76,
                borderRadius: 14,
                borderWidth: selected ? 2 : 1.5,
                borderColor: selected ? colors.laterite : colors.line,
                backgroundColor: selected ? colors.lateriteSoft : colors.white,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AppText
                style={{
                  fontFamily: fonts.displaySemibold,
                  fontSize: n === null ? 20 : 26,
                  lineHeight: n === null ? 31 : 40.3,
                  color: selected ? colors.laterite : colors.v14Ink,
                }}>
                {n === null ? 'Other' : formatRupees(n)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {other ? (
        <View
          style={{
            height: 56,
            borderRadius: 14,
            borderWidth: invalid ? 2 : 1.5,
            borderColor: invalid ? colors.actionRed : colors.line,
            backgroundColor: colors.white,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 16,
          }}>
          <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 22, lineHeight: 34, color: colors.v14Ink }}>₹</AppText>
          <TextInput
            value={custom}
            autoFocus
            onChangeText={(t) => onCustom(t.replace(/\D/g, '').slice(0, 7))}
            keyboardType="number-pad"
            inputMode="numeric"
            placeholder="Enter amount"
            placeholderTextColor={colors.text2}
            accessibilityLabel="Other amount in rupees"
            maxLength={7}
            style={{ flex: 1, height: 54, fontFamily: fonts.ui, fontSize: 17, color: colors.v14Ink, outlineStyle: 'none' } as never}
          />
        </View>
      ) : null}
      {invalid ? (
        <AppText accessibilityLiveRegion="polite" style={{ fontFamily: fonts.uiMedium, fontSize: 13, lineHeight: 20, color: colors.actionRed }}>
          Enter an amount of ₹1 or more.
        </AppText>
      ) : null}
    </View>
  );
}

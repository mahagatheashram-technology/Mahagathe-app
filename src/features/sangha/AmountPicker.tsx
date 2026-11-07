import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { AppText, Icon } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';
import { formatRupees } from './format';

/** Three presets and an equal fourth tile; the custom field is revealed on request. */
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
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {choices.map((n) => {
          const selected = n === null ? other : !other && custom === '' && preset === n;
          return (
            <Pressable
              key={n ?? 'other'}
              accessibilityRole="button"
              accessibilityLabel={n === null ? 'Other amount' : formatRupees(n)}
              accessibilityState={{ selected }}
              onPress={() => {
                setOther(n === null);
                if (n !== null) onPreset(n);
                else onCustom('');
              }}
              style={{
                width: '48%',
                flexGrow: 1,
                height: 56,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: selected ? colors.actionRed : colors.outline,
                backgroundColor: selected ? colors.actionRed : colors.white,
                flexDirection: 'row',
                gap: 6,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {selected ? <Icon name="check" size={14} color={colors.white} strokeWidth={3} /> : null}
              <AppText
                style={{
                  fontFamily: fonts.sansSemibold,
                  fontSize: 17,
                  lineHeight: 26,
                  color: selected ? colors.white : colors.ink,
                }}>
                {n === null ? 'Other amount' : formatRupees(n)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      {other ? (
        <View
          style={{
            height: 54,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: invalid ? colors.actionRed : colors.outline,
            backgroundColor: colors.white,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 16,
          }}>
          <AppText style={{ fontSize: 17 }}>₹</AppText>
          <TextInput
            value={custom}
            autoFocus
            onChangeText={(t) => onCustom(t.replace(/\D/g, '').slice(0, 7))}
            keyboardType="number-pad"
            inputMode="numeric"
            placeholder="Enter amount"
            placeholderTextColor={colors.textSecondary}
            accessibilityLabel="Other amount in rupees"
            maxLength={7}
            style={{ flex: 1, height: 52, fontFamily: fonts.sans, fontSize: 17, color: colors.ink }}
          />
        </View>
      ) : null}
      {invalid ? (
        <AppText variant="caption" color={colors.actionRed} accessibilityLiveRegion="polite">
          Enter an amount of ₹1 or more.
        </AppText>
      ) : null}
    </View>
  );
}

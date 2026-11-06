import { Pressable, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui';
import { formatRupees } from './format';
import { colors, fonts } from '@/theme/tokens';

/** Preset amount tiles + a digits-only custom amount field (DonateV3). A typed amount overrides the preset. */
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
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {presets.map((n) => {
          const selected = custom === '' && preset === n;
          return (
            <Pressable
              key={n}
              accessibilityRole="button"
              accessibilityLabel={formatRupees(n)}
              accessibilityState={{ selected }}
              onPress={() => onPreset(n)}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? colors.actionRed : colors.white,
                borderWidth: selected ? 0 : 1,
                borderColor: colors.border,
              }}>
              <AppText
                style={{
                  fontFamily: selected ? fonts.sansSemibold : fonts.sansMedium,
                  fontSize: 15,
                  color: selected ? colors.white : colors.ink,
                }}>
                {formatRupees(n)}
              </AppText>
            </Pressable>
          );
        })}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          height: 50,
          paddingHorizontal: 16,
          borderRadius: 14,
          backgroundColor: colors.white,
          borderWidth: invalid ? 1.5 : 1,
          borderColor: invalid ? colors.actionRed : colors.border,
        }}>
        <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 15, color: colors.muted }}>₹</AppText>
        <TextInput
          value={custom}
          onChangeText={(t) => onCustom(t.replace(/\D/g, '').slice(0, 7))}
          keyboardType="number-pad"
          inputMode="numeric"
          placeholder="Other amount"
          placeholderTextColor={colors.muted}
          accessibilityLabel="Other amount in rupees"
          maxLength={7}
          style={{ flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.ink, paddingVertical: 0, height: 50, outlineStyle: 'none' } as never}
        />
      </View>
      {invalid ? (
        <AppText variant="caption" color={colors.actionRed} accessibilityLiveRegion="polite">
          Enter an amount of ₹1 or more.
        </AppText>
      ) : null}
    </View>
  );
}

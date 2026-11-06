import { useState } from 'react';
import { Platform, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, fonts, radii } from '@/theme/tokens';

const noOutline = Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null;

/** Label + 52px input (1.5px Action Red border on focus) + hint or error, as in SetupV3. */
export function TextField({
  label,
  hint,
  error,
  prefix,
  inputStyle,
  ...input
}: TextInputProps & { label: string; hint?: string; error?: string | null; prefix?: string; inputStyle?: object }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error || focused ? colors.actionRed : colors.border;
  return (
    <View style={{ gap: 8 }}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {prefix ? (
          <View style={[styles.box, styles.prefix, { borderColor: colors.border }]} accessible={false}>
            <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 16, lineHeight: 24 }}>{prefix}</AppText>
          </View>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.muted}
          selectionColor={colors.actionRed}
          {...input}
          onFocus={(e) => {
            setFocused(true);
            input.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            input.onBlur?.(e);
          }}
          style={[styles.box, styles.input, { borderColor, flex: 1 }, noOutline, inputStyle]}
        />
      </View>
      {error ? (
        <AppText accessibilityLiveRegion="polite" style={[styles.hint, { color: colors.actionRed }]}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText style={styles.hint}>{hint}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21, color: colors.ink },
  box: {
    height: 52,
    borderWidth: 1.5,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
  },
  prefix: { paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  input: { paddingHorizontal: 16, fontFamily: fonts.sans, fontSize: 16, color: colors.ink },
  hint: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18, color: colors.muted },
});

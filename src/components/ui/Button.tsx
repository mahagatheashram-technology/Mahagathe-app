import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { colors, fonts, minTouch, radii } from '@/theme/tokens';

/**
 * Pill buttons from the mocks.
 * - primary: filled Action Red, white text (Begin practice, Continue, Pay with UPI)
 * - outline: 1.5px Action Red border, red text (Register)
 * - onFeature: white fill, red text — used on the red feature block / Welcome
 * - ghostOnFeature: translucent white border, white text — "Explore as a guest"
 * - quiet: sand fill, ink text (Going, chips that act as buttons)
 */
export type ButtonVariant = 'primary' | 'outline' | 'onFeature' | 'ghostOnFeature' | 'quiet';
export type ButtonSize = 'lg' | 'md' | 'sm';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  accessibilityLabel?: string;
  /** Override the label size when a mock differs from the size scale (e.g. 15px on a 54px button). */
  fontSize?: number;
  /** Gap between icon and label (default 8). */
  iconGap?: number;
  style?: ViewStyle;
};

const heights: Record<ButtonSize, number> = { lg: 54, md: 48, sm: 40 };
const fontSizes: Record<ButtonSize, number> = { lg: 16, md: 15, sm: 13 };
const padX: Record<ButtonSize, number> = { lg: 22, md: 22, sm: 14 };

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  trailingIcon,
  disabled,
  loading,
  accessibilityLabel,
  fontSize,
  iconGap = 8,
  style,
}: Props) {
  const v = variantStyles[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      hitSlop={size === 'sm' ? 4 : 0}
      style={({ pressed }) => [
        styles.base,
        { height: heights[size], paddingHorizontal: padX[size], minHeight: Math.min(heights[size], minTouch) },
        v.container,
        pressed && { opacity: 0.85 },
        disabled && { opacity: 0.5 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.text} />
      ) : (
        <View style={[styles.row, { gap: iconGap }]}>
          {icon}
          <AppText
            style={{
              fontFamily: variant === 'ghostOnFeature' ? fonts.sansMedium : fonts.sansSemibold,
              fontSize: fontSize ?? fontSizes[size],
              color: v.text,
            }}>
            {label}
          </AppText>
          {trailingIcon}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: string }> = {
  primary: { container: { backgroundColor: colors.actionRed }, text: colors.white },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.actionRed },
    text: colors.actionRed,
  },
  onFeature: { container: { backgroundColor: colors.white }, text: colors.actionRed },
  ghostOnFeature: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.onFeatureBorder },
    text: colors.white,
  },
  quiet: { container: { backgroundColor: colors.sand }, text: colors.ink },
};

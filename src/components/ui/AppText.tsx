import { StyleSheet, Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { colors, fonts } from '@/theme/tokens';

/**
 * Type scale from the v3 mocks. Pick the variant, then override colour/size inline
 * only when the mock differs. Letter spacing in mocks is in em: 0.14em × 12px ≈ 1.7.
 */
export const textVariants = StyleSheet.create({
  /** Welcome wordmark: Lora 600 40 */
  display: { fontFamily: fonts.serifSemibold, fontSize: 40, lineHeight: 46, color: colors.ink },
  /** Screen titles: Lora 600 30 */
  title: { fontFamily: fonts.serifSemibold, fontSize: 30, lineHeight: 36, color: colors.ink },
  /** Section heading: Lora 600 21 */
  section: { fontFamily: fonts.serifSemibold, fontSize: 21, lineHeight: 28, color: colors.ink },
  /** Card title: Lora 600 18 */
  cardTitle: { fontFamily: fonts.serifSemibold, fontSize: 18, lineHeight: 24, color: colors.ink },
  /** Teaching / quote: Lora 400 27 */
  quote: { fontFamily: fonts.serif, fontSize: 27, lineHeight: 37, color: colors.ink },
  /** Reading prose: Lora 400 17 */
  prose: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 29, color: colors.ink },
  /** Uppercase eyebrow label: Poppins 600 12, tracking 0.14em */
  eyebrow: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    color: colors.actionRed,
  },
  /** Uppercase small section label (muted): Poppins 600 13, tracking 0.12em */
  overline: {
    fontFamily: fonts.sansSemibold,
    fontSize: 13,
    letterSpacing: 1.56,
    textTransform: 'uppercase',
    color: colors.muted,
  },
  body: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.ink },
  bodyLarge: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 27, color: colors.ink },
  label: { fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 20, color: colors.ink },
  /** Secondary line: Poppins 500 13 muted */
  meta: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 19, color: colors.muted },
  /** Caption: Poppins 500 12 muted */
  caption: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18, color: colors.muted },
  /** Devanagari scripture / season cover glyphs */
  deva: { fontFamily: fonts.devaSemibold, fontSize: 26, lineHeight: 34, color: colors.ink },
});

export type TextVariant = keyof typeof textVariants;

type Props = TextProps & { variant?: TextVariant; color?: string; style?: StyleProp<TextStyle> };

export function AppText({ variant = 'body', color, style, ...rest }: Props) {
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={[textVariants[variant], color ? { color } : null, style]}
    />
  );
}

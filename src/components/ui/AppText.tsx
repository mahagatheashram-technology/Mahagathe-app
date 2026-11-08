import { Platform, StyleSheet, Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { colors, fonts } from '@/theme/tokens';

/**
 * Type scale from the v3 mocks. Pick the variant, then override colour/size inline
 * only when the mock differs. Letter spacing in mocks is in em: 0.14em × 12px ≈ 1.7.
 */
export const textVariants = StyleSheet.create({
  v14Title: { fontFamily: fonts.displaySemibold, fontSize: 33, lineHeight: 39.6, color: colors.v14Ink },
  v14Section: { fontFamily: fonts.displaySemibold, fontSize: 21, lineHeight: 27.3, color: colors.v14Ink },
  v14Body: { fontFamily: fonts.ui, fontSize: 16, lineHeight: 24.8, color: colors.v14Ink },
  reading: { fontFamily: fonts.display, fontSize: 18.5, lineHeight: 31.82, color: colors.v14Ink },
  /** Welcome wordmark: Lora 600 40 */
  display: { fontFamily: fonts.serifSemibold, fontSize: 40, lineHeight: 46, color: colors.ink },
  /** Screen titles: Lora 600 30 */
  title: { fontFamily: fonts.serifSemibold, fontSize: 30, lineHeight: 36, color: colors.ink },
  /** Section heading: Lora 600 21 */
  section: { fontFamily: fonts.serifSemibold, fontSize: 21, lineHeight: 27, color: colors.ink },
  /** Card title: Lora 600 18 */
  cardTitle: { fontFamily: fonts.serifSemibold, fontSize: 18, lineHeight: 23, color: colors.ink },
  /** Teaching / quote: Lora 400 27 */
  quote: { fontFamily: fonts.serif, fontSize: 27, lineHeight: 37, color: colors.ink },
  /** Reading prose: Lora 400 17 */
  prose: { fontFamily: fonts.serif, fontSize: 17, lineHeight: 29, color: colors.ink },
  /** Uppercase eyebrow label: Poppins 600 12, tracking 0.14em */
  eyebrow: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
    letterSpacing: 1.68,
    lineHeight: 17.5,
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
  meta: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 19.5, color: colors.muted },
  /** Caption: Poppins 500 12 muted */
  caption: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 17.5, color: colors.muted },
  /** Devanagari scripture / season cover glyphs */
  deva: { fontFamily: fonts.devaSemibold, fontSize: 26, lineHeight: 34, color: colors.ink },
});

export type TextVariant = keyof typeof textVariants;

type Props = TextProps & { variant?: TextVariant; color?: string; style?: StyleProp<TextStyle> };

/**
 * Font vertical metrics (hhea, per em). Eczar's tall ascent and deep descent (1.143 / 0.634) are
 * there for Devanagari. iOS places the baseline at `lineHeight - descent`, so with any line height
 * tighter than the font's natural 1.78em the tops of Eczar glyphs were cut off on device, while web
 * centres the spare space and looked right. On iOS we move the text down to the web position with
 * top padding and cancel it with negative margins, so layout and line spacing stay as designed and
 * the full ascent has room.
 */
const METRICS: { prefix: string; ascent: number; descent: number }[] = [
  { prefix: 'Eczar', ascent: 1.143, descent: 0.634 },
  { prefix: 'Mukta', ascent: 1.13, descent: 0.532 },
];

function iosBaselineFix(style: TextStyle): TextStyle | null {
  const { fontFamily, fontSize, lineHeight } = style;
  if (!fontFamily || !fontSize || !lineHeight) return null;
  const m = METRICS.find(x => fontFamily.startsWith(x.prefix));
  if (!m) return null;
  const natural = (m.ascent + m.descent) * fontSize;
  const deficit = natural - lineHeight;
  if (deficit <= 0.5) return null;
  const num = (v: unknown) => (typeof v === 'number' ? v : 0);
  const pt = num(style.paddingTop ?? style.paddingVertical ?? style.padding);
  const mt = num(style.marginTop ?? style.marginVertical ?? style.margin);
  const mb = num(style.marginBottom ?? style.marginVertical ?? style.margin);
  return { paddingTop: pt + deficit, marginTop: mt - deficit / 2, marginBottom: mb - deficit / 2 };
}

export function AppText({ variant = 'body', color, style, ...rest }: Props) {
  const composed = [textVariants[variant], color ? { color } : null, style];
  const fix = Platform.OS === 'ios' ? iosBaselineFix(StyleSheet.flatten(composed) ?? {}) : null;
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      {...rest}
      style={fix ? [...composed, fix] : composed}
    />
  );
}

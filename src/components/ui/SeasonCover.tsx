import { StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { colors, fonts } from '@/theme/tokens';

/**
 * Mahabharata season "book cover" (WisdomV3): deep colour, inset gold hairline,
 * Devanagari parva name. `lead` = 112×156 (the published season), `small` = 88×124 (coming seasons).
 */
const PALETTE = [colors.maroon, colors.coverPlum, colors.coverMoss, colors.coverBrown, colors.coverRose];
/** Small-cover Devanagari sizes from the mock (longer names are set smaller to fit 88pt). */
const SMALL_DEVA_LINE: Record<number, number> = { 27: 42, 18: 28, 25: 38.5 };
const SMALL_DEVA_SIZE: Record<number, number> = { 2: 27, 3: 18, 4: 25, 5: 25 };

type Props = {
  /** Parva number 1..18. Picks the cover colour. */
  number: number;
  roman: string;
  devanagari: string;
  /** Latin name, shown under the glyphs on the lead cover ("Ādi"). */
  name: string;
  variant?: 'lead' | 'small' | 'resume';
  /** Bottom caption. Defaults to the Latin name (lead) or "Coming" (small). */
  caption?: string;
  style?: ViewStyle;
};

export function SeasonCover({ number, roman, devanagari, name, variant = 'lead', caption, style }: Props) {
  if (variant === 'resume') return (
    <View accessible accessibilityLabel={`Parva ${roman}, ${name}`} style={[{ width: 78, height: 108, borderRadius: 10, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', gap: 4 }, style]}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 4, left: 4, right: 4, bottom: 4, borderRadius: 6, borderWidth: 1, borderColor: colors.coverGoldLineMid }} />
      <AppText style={{ fontFamily: fonts.devaSemibold, fontSize: 26, lineHeight: 31, color: colors.coverText }}>{devanagari}</AppText>
      <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 9, lineHeight: 13.5, letterSpacing: 1.44, color: colors.gold }}>PARVA {roman}</AppText>
    </View>
  );
  const lead = variant === 'lead';
  const bg = PALETTE[(number - 1) % PALETTE.length];
  const dims = lead
    ? { width: 112, height: 156, radius: 12, padV: 14, inset: 6, line: colors.coverGoldLine }
    : { width: 88, height: 124, radius: 10, padV: 10, inset: 4, line: colors.coverGoldLineSoft };
  const devaSize = lead ? 40 : (SMALL_DEVA_SIZE[number] ?? 25);
  return (
    <View
      accessible
      accessibilityLabel={lead ? `Parva ${roman}, ${name}` : `Parva ${roman}, ${name}, ${caption ?? 'coming'}`}
      style={[
        {
          width: dims.width,
          height: dims.height,
          borderRadius: dims.radius,
          backgroundColor: bg,
          paddingVertical: dims.padV,
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        style,
      ]}>
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            margin: dims.inset,
            borderRadius: dims.radius - dims.inset,
            borderWidth: 1,
            borderColor: dims.line,
          },
        ]}
      />
      <AppText
        style={{
          fontFamily: fonts.sansSemibold,
          fontSize: lead ? 10 : 9,
          lineHeight: lead ? 15 : 13.5,
          letterSpacing: lead ? 1.8 : 1.44,
          color: colors.gold,
        }}>
        {lead ? `PARVA ${roman}` : roman}
      </AppText>
      <AppText
        style={{
          fontFamily: fonts.devaSemibold,
          fontSize: devaSize,
          lineHeight: lead ? devaSize * 1.1 : (SMALL_DEVA_LINE[devaSize] ?? devaSize * 1.56),
          color: colors.coverText,
        }}>
        {devanagari}
      </AppText>
      <AppText
        style={{
          fontSize: lead ? 11 : 10,
          lineHeight: lead ? 16 : 15,
          color: colors.coverSub,
        }}>
        {caption ?? (lead ? name : 'Coming')}
      </AppText>
    </View>
  );
}

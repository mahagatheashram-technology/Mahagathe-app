import { useId } from 'react';
import { Image, View, type ViewProps } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';
import { AppText } from './AppText';
import { colors, fonts } from '@/theme/tokens';
export type PhotoPlaceholderProps = ViewProps & { label: string; height?: number; radius?: number };
export function PhotoPlaceholder({ label, height = 200, radius = 12, style, ...props }: PhotoPlaceholderProps) {
  const id = `photo-${useId().replace(/:/g, '')}`;
  return <View accessible accessibilityRole="image" accessibilityLabel={label} {...props} style={[{ height, borderRadius: radius, overflow: 'hidden', backgroundColor: colors.laterite, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 }, style]}><Svg pointerEvents="none" accessible={false} width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}><Defs><Pattern id={id} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><Line x1={0} y1={0} x2={0} y2={14} stroke={colors.photoStripe} strokeWidth={2} /></Pattern></Defs><Rect width="100%" height="100%" fill={`url(#${id})`} /></Svg><View style={{ width: 74, height: 74, borderRadius: 37, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}><Image accessible={false} source={require('../../../assets/brand/mahagathe-emblem.png')} style={{ height: 52, width: 42 }} resizeMode="contain" /></View><AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 14, color: colors.photoText, textAlign: 'center' }}>{label}</AppText></View>;
}
/** The laterite diagonal stripe layer on its own (program cards, village headers). Additive export. */
export function LateriteStripes() {
  const id = `stripes-${useId().replace(/:/g, '')}`;
  return <Svg pointerEvents="none" accessible={false} width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}><Defs><Pattern id={id} width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><Line x1={0} y1={0} x2={0} y2={14} stroke={colors.photoStripe} strokeWidth={2} /></Pattern></Defs><Rect width="100%" height="100%" fill={`url(#${id})`} /></Svg>;
}

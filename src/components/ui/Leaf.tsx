import { useId } from 'react';
import { View, type ViewProps } from 'react-native';
import Svg, { Defs, Line, Pattern, Rect } from 'react-native-svg';
import { colors } from '@/theme/tokens';

export type LeafProps = ViewProps & { holes?: boolean; holeTop?: number | `${number}%` };
/** Native SVG preserves the mock's seven-point ruling without CSS-only backgrounds. */
export function LeafRules() {
  const id = `leaf-${useId().replace(/:/g, '')}`;
  return <Svg pointerEvents="none" accessible={false} width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}><Defs><Pattern id={id} width={7} height={7} patternUnits="userSpaceOnUse"><Line x1={0} y1={6.5} x2={7} y2={6.5} stroke={colors.leafRule} strokeWidth={1} /></Pattern></Defs><Rect width="100%" height="100%" fill={`url(#${id})`} /></Svg>;
}
export function Leaf({ holes = false, holeTop = '50%', children, style, ...props }: LeafProps) {
  return <View {...props} style={[{ backgroundColor: colors.leaf, borderWidth: 1, borderColor: colors.leafEdge, borderRadius: 16, overflow: 'hidden', paddingVertical: 16, paddingLeft: 30, paddingRight: 22 }, style]}>
    <LeafRules />{holes && [11, undefined].map((left, i) => <View key={i} pointerEvents="none" style={{ position: 'absolute', left, right: i ? 11 : undefined, top: holeTop, marginTop: -4.5, width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.limewash, borderTopWidth: 1, borderColor: colors.leafEdge }} />)}{children}
  </View>;
}
export function LeafBand({ children, style, ...props }: ViewProps) {
  return <View {...props} style={[{ backgroundColor: colors.leaf, borderBottomWidth: 1, borderColor: colors.leafEdge, overflow: 'hidden', paddingHorizontal: 20, paddingVertical: 24 }, style]}><LeafRules />{children}</View>;
}

import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText } from './AppText';
import { colors, fonts } from '@/theme/tokens';

export type LampRingProps = ViewProps & { done: number; size?: number; center?: ReactNode | false; label?: string; sub?: string; children?: ReactNode };
/** gen13.py ring(): forty lamps, clockwise from twelve o'clock. */
export function LampRing({ done, size = 236, center, label, sub = 'lamps lit', children, style, ...props }: LampRingProps) {
  const count = Math.min(40, Math.max(0, Math.floor(done)));
  const c = size / 2, r = c - Math.max(6, size * .05), dot = Math.max(2.6, size / 44);
  return <View accessible accessibilityRole="image" accessibilityLabel={label ?? `${count} of 40 ${sub}`} {...props} style={[{ width: size, height: size, flexShrink: 0 }, style]}>
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} accessible={false}>
      {Array.from({ length: 40 }, (_, i) => {
        const angle = -Math.PI / 2 + 2 * Math.PI * i / 40;
        const cx = c + r * Math.cos(angle), cy = c + r * Math.sin(angle);
        return i < count ? <ViewLamp key={i} cx={cx} cy={cy} dot={dot} /> : <Circle key={i} cx={cx} cy={cy} r={dot * .8} fill="none" stroke={colors.onDark2} strokeOpacity={.55} strokeWidth={1} />;
      })}
    </Svg>
    {center !== false && <View pointerEvents="none" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
      {center === undefined || center === true ? <><AppText style={{ fontFamily: fonts.displaySemibold, fontSize: Math.round(size * .27), lineHeight: Math.round(size * .27), color: colors.white }}>{label ?? count}</AppText><AppText style={{ fontSize: Math.max(13, Math.round(size * .062)), lineHeight: Math.max(13, Math.round(size * .062)) * 1.55, color: colors.onDark2, marginTop: size * .02 }}>of 40 {sub}</AppText></> : typeof center === 'string' || typeof center === 'number' ? <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: Math.round(size * .27), lineHeight: Math.round(size * .27), color: colors.white }}>{center}</AppText> : center}
    </View>}{children}
  </View>;
}
function ViewLamp({ cx, cy, dot }: { cx: number; cy: number; dot: number }) {
  return <><Circle cx={cx} cy={cy} r={dot * 1.7} fill={colors.lamp} opacity={.16} /><Circle cx={cx} cy={cy} r={dot} fill={colors.lamp} /></>;
}

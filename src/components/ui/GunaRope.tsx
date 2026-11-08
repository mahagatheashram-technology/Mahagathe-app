import { View, type ViewProps } from 'react-native';
import Svg, { G, Polyline } from 'react-native-svg';
import { AppText } from './AppText';
import { colors, fonts } from '@/theme/tokens';
import type { Guna } from '@/data/types';
export type GunaPercents = Record<Guna, number>;
const strands = ['sattva', 'rajas', 'tamas'] as const;
export type GunaRopeProps = ViewProps & { percents: GunaPercents; width?: number; height?: number; amplitude?: number };
/** gen131c.py rope(): three phase-shifted strands, width follows percent. */
export function GunaRope({ percents, width = 300, height = 70, amplitude = height * .26, style, ...props }: GunaRopeProps) {
  return <View accessible accessibilityRole="image" accessibilityLabel={strands.map(g => `${g} ${percents[g]} percent`).join(', ')} {...props} style={style}><Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} accessible={false}>{strands.map((g, k) => {
    const sw = 4 + percents[g] * .34 * (height / 70);
    const points = Array.from({ length: Math.max(0, Math.ceil((width - 23) / 3)) }, (_, n) => { const x = 12 + n * 3; return `${x},${height / 2 + amplitude * Math.sin(2 * Math.PI * x / (width / 2.5) + k * 2 * Math.PI / 3)}`; }).join(' ');
    return <G key={g}>{g === 'sattva' && <Polyline points={points} fill="none" stroke={colors.leafEdge} strokeWidth={sw + 3} strokeLinecap="round" strokeLinejoin="round" />}<Polyline points={points} fill="none" stroke={colors[g]} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></G>;
  })}</Svg></View>;
}
export type GunaBarProps = ViewProps & { percents: GunaPercents; labels?: boolean };
export function GunaBar({ percents, labels = true, style, ...props }: GunaBarProps) {
  return <View accessible accessibilityLabel={strands.map(g => `${g} ${percents[g]} percent`).join(', ')} {...props} style={style}><View style={{ height: 14, flexDirection: 'row', borderRadius: 7, borderWidth: 1, borderColor: colors.leafEdge, overflow: 'hidden' }}>{strands.map(g => <View key={g} style={{ flex: Math.max(0, percents[g]), backgroundColor: colors[g] }} />)}</View>{labels && <View style={{ marginTop: 8, flexDirection: 'row', justifyContent: 'space-between' }}>{strands.map(g => <AppText key={g} style={{ color: g === 'rajas' ? colors.rajas : colors.v14Ink, fontSize: 15, fontFamily: fonts.uiSemibold }}>{g[0].toUpperCase() + g.slice(1)} {percents[g]}%</AppText>)}</View>}</View>;
}

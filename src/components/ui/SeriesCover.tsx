import { Pressable, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { LeafRules } from './Leaf';
import { AppText } from './AppText';
import { colors, fonts } from '@/theme/tokens';
import type { Series } from '@/data/types';
export type SeriesMotifName = Series['motif'];
export function SeriesMotif({ motif, size = 32, color = colors.motif }: { motif: SeriesMotifName; size?: number; color?: string }) {
  return <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" accessible={false}>
    {motif === 'wheel' && <><Circle cx={16} cy={16} r={11} /><Circle cx={16} cy={16} r={2.5} />{Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4; return <Path key={k} d={`M${(16 + 2.5 * Math.cos(a)).toFixed(1)} ${(16 + 2.5 * Math.sin(a)).toFixed(1)}L${(16 + 11 * Math.cos(a)).toFixed(1)} ${(16 + 11 * Math.sin(a)).toFixed(1)}`} />; })}</>}
    {motif === 'bow' && <><Path d="M9 4c9 4 9 20 0 24" /><Path d="M9 4v24" /><Path d="M5 16h22M23 12.5l4 3.5-4 3.5" /></>}
    {motif === 'ash' && <><Path d="M5 11h22M4 16h24M5 21h22" /><Circle cx={16} cy={16} r={2.4} fill={colors.motifDot} stroke="none" /></>}
    {motif === 'yantra' && <><Rect x={5} y={5} width={22} height={22} /><Path d="M16 8l8 14H8z" /><Circle cx={16} cy={17} r={2} /></>}
  </Svg>;
}
export type SeriesCoverProps = Omit<PressableProps, 'style' | 'children'> & { titleDev: string; title: string; color: string; motif: SeriesMotifName; state: string; active?: boolean; height?: number; titleDevSize?: number; style?: StyleProp<ViewStyle> };
export function SeriesCover({ titleDev, title, color, motif, state, active = false, height = 196, titleDevSize = 27, style, ...props }: SeriesCoverProps) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${state}`} {...props} style={({ pressed }) => [{ minWidth: 44, minHeight: 44, opacity: pressed ? .85 : 1 }, style]}><View style={{ height }}>
    {[{ left: 6, right: -2, top: 10, bottom: -6 }, { left: 3, right: 1, top: 5, bottom: -3 }].map((offsets, i) => <View key={i} style={{ position: 'absolute', ...offsets, borderRadius: 6, backgroundColor: colors.leaf, borderWidth: 1, borderColor: colors.leafEdge, overflow: 'hidden' }}><LeafRules /></View>)}
    <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 4, borderRadius: 6, backgroundColor: color, padding: 14, overflow: 'hidden' }}><SeriesMotif motif={motif} /><View style={{ position: 'absolute', left: 0, right: 0, top: '44%', height: 2, backgroundColor: colors.cord }} /><View style={{ position: 'absolute', left: 22, top: '44%', marginTop: -5, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.knot }} /><View style={{ marginTop: 'auto' }}><AppText style={{ fontFamily: fonts.display, fontSize: titleDevSize, lineHeight: titleDevSize * 1.1, color: colors.white }}>{titleDev}</AppText><AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 14, lineHeight: 21.7, color: colors.white, opacity: .92, marginTop: 2 }}>{title}</AppText></View></View>
    </View><AppText style={{ marginTop: 12, fontSize: 14, color: active ? colors.laterite : colors.text2, fontFamily: active ? fonts.uiSemibold : fonts.ui }}>{state}</AppText></Pressable>;
}

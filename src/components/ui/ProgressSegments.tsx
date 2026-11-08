import { View, type ViewProps } from 'react-native';
import { colors } from '@/theme/tokens';
export type ProgressSegmentsProps = ViewProps & { done: number; total: number; current?: number; color?: string; offColor?: string };
/** current is zero-based, exactly like gen13.py segs(cur). */
export function ProgressSegments({ done, total, current, color = colors.v14Ink, offColor = colors.segmentOff, style, ...props }: ProgressSegmentsProps) {
  return <View accessible accessibilityRole="progressbar" accessibilityLabel={`${done} of ${total} episodes read`} accessibilityValue={{ min: 0, max: total, now: done }} aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} {...props} style={[{ flexDirection: 'row', gap: 3 }, style]}>{Array.from({ length: Math.max(0, Math.floor(total)) }, (_, i) => <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < done ? color : i === current ? colors.laterite : offColor }} />)}</View>;
}

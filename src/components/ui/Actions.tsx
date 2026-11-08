import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { Icon } from './Icon';
import { colors, fonts } from '@/theme/tokens';

type ActionProps = Omit<PressableProps, 'style' | 'children'> & { label: string; style?: StyleProp<ViewStyle>; icon?: ReactNode; trailingIcon?: ReactNode; loading?: boolean; color?: string };
export function PrimaryButton({ label, style, icon, trailingIcon, loading, disabled, ...props }: ActionProps) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} {...props} disabled={disabled || loading} aria-busy={!!loading} aria-disabled={!!disabled || !!loading} accessibilityState={{ disabled: !!disabled, busy: !!loading, ...props.accessibilityState }} style={({ pressed }) => [{ minHeight: 54, borderRadius: 14, backgroundColor: colors.actionRed, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20, opacity: disabled ? .5 : pressed ? .85 : 1 }, style]}>{loading ? <ActivityIndicator color={colors.white} /> : <>{icon}<AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 17, lineHeight: 26.35, color: colors.white }}>{label}</AppText>{trailingIcon}</>}</Pressable>;
}
export function OutlineButton({ label, color = colors.v14Ink, style, icon, trailingIcon, disabled, loading, ...props }: ActionProps) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} {...props} disabled={disabled || loading} aria-busy={!!loading} aria-disabled={!!disabled || !!loading} accessibilityState={{ disabled: !!disabled, busy: !!loading, ...props.accessibilityState }} style={({ pressed }) => [{ minHeight: 44, borderRadius: 14, borderWidth: 1.5, borderColor: color, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', gap: 6, opacity: disabled ? .5 : pressed ? .75 : 1 }, style]}>{loading ? <ActivityIndicator color={color} /> : <>{icon}<AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color }}>{label}</AppText>{trailingIcon}</>}</Pressable>;
}
export function TextLink({ label, color = colors.v14Ink, style, icon, trailingIcon, ...props }: ActionProps) {
  return <Pressable accessibilityRole="link" accessibilityLabel={label} {...props} style={({ pressed }) => [{ minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, opacity: pressed ? .7 : 1 }, style]}>{icon}<AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color, textDecorationLine: 'underline' }}>{label}</AppText>{trailingIcon}</Pressable>;
}
export type BackPillProps = Omit<ActionProps, 'label'> & { destination: string; dark?: boolean };
export function BackPill({ destination, dark = false, color = dark ? colors.white : colors.v14Ink, style, ...props }: BackPillProps) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`Back to ${destination}`} {...props} style={({ pressed }) => [{ minHeight: 44, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 8, paddingRight: 14, borderRadius: 20, backgroundColor: dark ? colors.pillDark : colors.pillLight, opacity: pressed ? .7 : 1 }, style]}><Icon name="back" size={20} color={color} strokeWidth={2.2} /><AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, color }}>{destination}</AppText></Pressable>;
}

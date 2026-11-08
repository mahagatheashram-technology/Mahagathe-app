import { View, type ViewProps } from 'react-native';
import { AppText } from './AppText';
import { colors, fonts } from '@/theme/tokens';
export type ReviewTagProps = ViewProps & { label: string; dark?: boolean };
export function ReviewTag({ label, dark = false, style, ...props }: ReviewTagProps) {
  const color = dark ? colors.lamp : colors.reviewText;
  return <View accessible accessibilityLabel={label} {...props} style={[{ alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: color, backgroundColor: dark ? colors.reviewDarkBackground : colors.reviewBackground }, style]}><AppText style={{ color, fontFamily: fonts.uiSemibold, fontSize: 13, lineHeight: 16.9 }}>{label}</AppText></View>;
}

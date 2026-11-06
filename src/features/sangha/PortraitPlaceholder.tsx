import { View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors } from '@/theme/tokens';

/** Rounded-rect stand-in for the approved Gurudev photo, on the red feature block. */
export function PortraitPlaceholder({
  width,
  height,
  radius,
  label,
  fontSize,
  lineHeight,
  padding,
}: {
  width: number;
  height: number;
  radius: number;
  label: string;
  fontSize: number;
  lineHeight: number;
  padding: number;
}) {
  return (
    <View
      accessibilityLabel="Photo placeholder, awaiting approved photo"
      style={{
        width,
        height,
        borderRadius: radius,
        borderWidth: 2,
        borderColor: colors.onFeatureMuted,
        backgroundColor: colors.featureDeep,
        alignItems: 'center',
        justifyContent: 'center',
        padding,
        flexShrink: 0,
      }}>
      <AppText style={{ fontSize, lineHeight, textAlign: 'center', color: colors.onFeatureMuted }}>{label}</AppText>
    </View>
  );
}

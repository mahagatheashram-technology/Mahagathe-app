import { View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { useSmallStep } from '@/data';
import { colors, fonts } from '@/theme/tokens';

/** H-06: a gentle suggestion, never mandatory. */
export function SmallStepLine() {
  const step = useSmallStep();
  if (!step) return null;
  return (
    <View style={{ paddingTop: 18, paddingHorizontal: 24, paddingBottom: 26, flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
      <View style={{ marginTop: 1 }}>
        <Icon name="drop" size={20} color={colors.earth} />
      </View>
      <AppText style={{ flex: 1, fontSize: 14, lineHeight: 21 }}>
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21, color: colors.earth }}>
          A small step, if you like:
        </AppText>{' '}
        {step.text}
      </AppText>
    </View>
  );
}

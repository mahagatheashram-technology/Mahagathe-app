import { View } from 'react-native';

import { AppText } from './AppText';
import { Screen } from './Screen';
import { colors } from '@/theme/tokens';

/** Temporary stub for a route whose screen has not been built yet. Delete when the screen lands. */
export function Placeholder({ title, mock }: { title: string; mock: string }) {
  return (
    <Screen contentStyle={{ padding: 24, justifyContent: 'center' }}>
      <View style={{ gap: 8 }}>
        <AppText variant="eyebrow">Not built yet</AppText>
        <AppText variant="title">{title}</AppText>
        <AppText variant="meta" color={colors.muted}>
          Target design: docs/design/mocks/{mock}
        </AppText>
      </View>
    </Screen>
  );
}

import { View } from 'react-native';

import { AppText, BottomSheet, Button, Chip } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';

/**
 * Mandala rules (S-08: read before beginning). Rule text is the v3 mock's; the teacher-set rules
 * are a placeholder until the teachers supply them (PRD D-23).
 */
const RULES = [
  'A Mandala is 40 sittings, completed at your own pace.',
  'One sitting counts on each date the server records. Your teachers explain how pauses fit your practice.',
  'Sitting together shows only counts. No names, no ranks.',
];

export function RulesSheet({
  visible,
  onClose,
  onBegin,
  beginning,
}: {
  visible: boolean;
  onClose: () => void;
  /** When given, shows "I have read the rules" to start a Mandala (S-08). */
  onBegin?: () => void;
  beginning?: boolean;
}) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="How the Mandala works"
    >
      <View style={{ gap: 12 }}>
        {RULES.map((r, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
            <AppText
              style={{
                fontFamily: fonts.serifSemibold,
                fontSize: 16,
                lineHeight: 24,
                width: 16,
              }}
              color={colors.actionRed}
            >
              {i + 1}
            </AppText>
            <AppText style={{ flex: 1, fontSize: 15, lineHeight: 24 }}>
              {r}
            </AppText>
          </View>
        ))}
        <Chip
          variant="dashed"
          label="[Teacher-set Mandala rules to be added]"
          style={{ height: 'auto', paddingVertical: 8 }}
        />
      </View>
      {onBegin ? (
        <View style={{ gap: 10, marginTop: 4 }}>
          <Button
            label="I have read the rules. Begin"
            onPress={onBegin}
            loading={beginning}
          />
          <Button label="Not now" variant="quiet" onPress={onClose} />
        </View>
      ) : (
        <Button
          label="Close"
          variant="quiet"
          onPress={onClose}
          style={{ marginTop: 4 }}
        />
      )}
    </BottomSheet>
  );
}

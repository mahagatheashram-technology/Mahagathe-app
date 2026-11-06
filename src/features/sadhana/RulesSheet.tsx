import { View } from 'react-native';

import { AppText, BottomSheet, Button, Chip } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';

/**
 * Mandala rules (S-08: read before beginning). Rule text is the v3 mock's; the teacher-set rules
 * are a placeholder until the teachers supply them (PRD D-23).
 */
const RULES = [
  'A day counts once, on the date the server records.',
  'A missed day stays open in your grid; your teachers set what it means for the Mandala.',
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
    <BottomSheet visible={visible} onClose={onClose} title="Mandala rules">
      <View style={{ gap: 12 }}>
        {RULES.map((r, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
            <AppText
              style={{ fontFamily: fonts.serifSemibold, fontSize: 16, lineHeight: 24, width: 16 }}
              color={colors.actionRed}>
              {i + 1}
            </AppText>
            <AppText style={{ flex: 1, fontSize: 15, lineHeight: 24 }}>{r}</AppText>
          </View>
        ))}
        <Chip variant="dashed" label="[Teacher-set Mandala rules to be added]" style={{ height: 'auto', paddingVertical: 8 }} />
      </View>
      {onBegin ? (
        <View style={{ gap: 10, marginTop: 4 }}>
          <Button label="I have read the rules. Begin" onPress={onBegin} loading={beginning} />
          <Button label="Not now" variant="quiet" onPress={onClose} />
        </View>
      ) : (
        <Button label="Close" variant="quiet" onPress={onClose} style={{ marginTop: 4 }} />
      )}
    </BottomSheet>
  );
}

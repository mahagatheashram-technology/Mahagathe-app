import { Pressable, View } from 'react-native';

import { AppText, Card } from '@/components/ui';
import type { DonationPurpose } from '@/data';
import { colors, fonts } from '@/theme/tokens';

/** "Where should it go?" radio cards (DonateV3). */
export function PurposeList({
  purposes,
  value,
  onChange,
}: {
  purposes: DonationPurpose[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <Card radius={18} accessibilityRole="radiogroup">
      {purposes.map((p, i) => {
        const checked = p.id === value;
        return (
          <Pressable
            key={p.id}
            accessibilityRole="radio"
            accessibilityLabel={`${p.name}, ${p.tagline}`}
            accessibilityState={{ checked }}
            onPress={() => onChange(p.id)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              paddingHorizontal: 16,
              paddingVertical: 15,
              borderBottomWidth: i === purposes.length - 1 ? 0 : 1,
              borderBottomColor: colors.sand,
            }}>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: checked ? 2 : 1.5,
                borderColor: checked ? colors.actionRed : colors.muted,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {checked ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.actionRed }} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 22.5 }}>{p.name}</AppText>
              <AppText variant="caption">{p.tagline}</AppText>
            </View>
          </Pressable>
        );
      })}
    </Card>
  );
}

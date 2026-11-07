import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, Card, Icon } from '@/components/ui';
import { Emblem } from '@/components/ui/Emblem';
import { colors, fonts } from '@/theme/tokens';

/** H-09 */
export function ParamparaCard() {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="The Paramparā. A living lineage of seventy Mahādhibhūs"
      onPress={() => router.push('/parampara')}
      style={{ marginTop: 4, marginHorizontal: 20, marginBottom: 28 }}>
      <Card radius={20} style={{ flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: colors.tile,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Emblem width={30} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 18, lineHeight: 23 }}>The Paramparā</AppText>
          <AppText variant="caption" style={{ lineHeight: 18 }}>
            A living lineage of seventy Mahādhibhūs
          </AppText>
        </View>
        <Icon name="chevronRight" size={18} color={colors.actionRed} strokeWidth={2.2} />
      </Card>
    </Pressable>
  );
}

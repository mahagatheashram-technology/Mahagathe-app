import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, Icon, RedFeature } from '@/components/ui';
import { useParampara } from '@/data';
import { PortraitPlaceholder } from './PortraitPlaceholder';
import { colors, fonts } from '@/theme/tokens';

/** The single red feature block on Sangha: guru + lineage entry point (→ /parampara). */
export function ParamparaCard() {
  const router = useRouter();
  const content = useParampara();
  if (!content) return <AppText>{content === undefined ? 'Loading Paramparā…' : 'Paramparā will appear here once approved.'}</AppText>;
  const { guru } = content;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Paramparā, ${guru.name}, ${guru.lineage}. See the lineage`}
      onPress={() => router.push('/parampara')}>
      <RedFeature style={{ borderRadius: 24, padding: 20, gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
          <PortraitPlaceholder width={76} height={92} radius={16} label="Approved photo of Gurudev" fontSize={10} lineHeight={13} padding={6} />
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="eyebrow" color={colors.onFeatureMuted}>
              Paramparā
            </AppText>
            <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 20, lineHeight: 25, color: colors.white }}>{guru.name}</AppText>
            <AppText variant="caption" color={colors.onFeatureMuted}>
              {guru.lineage}
            </AppText>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 14,
            borderTopWidth: 1,
            borderTopColor: colors.onFeatureDivider,
          }}>
          <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 19.5, color: colors.white }}>See the lineage</AppText>
          <Icon name="chevronRight" size={16} color={colors.white} strokeWidth={2.2} />
        </View>
      </RedFeature>
    </Pressable>
  );
}

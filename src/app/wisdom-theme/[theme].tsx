import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText, DetailHeader, Icon, Screen } from '@/components/ui';
import { THEME_LABELS, useVakyamsByTheme, type VakyamTheme } from '@/data';
import { VakyamListCard } from '@/features/wisdom/VakyamListCard';
import { colors, fonts } from '@/theme/tokens';

/** Not drawn in the mocks: Guru Vākyams for one theme, in the calm style (no red block). */
export default function WisdomThemeScreen() {
  const { theme } = useLocalSearchParams<{ theme: string }>();
  const known = theme && theme in THEME_LABELS ? (theme as VakyamTheme) : null;
  const vakyams = useVakyamsByTheme(known ?? 'inner-life');
  const list = known ? vakyams : [];

  return (
    <Screen contentStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}>
      <DetailHeader label="Guru Vākyams" />
      <View style={{ paddingTop: 12, paddingBottom: 20, gap: 4 }}>
        <AppText variant="eyebrow">By theme</AppText>
        <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 30, lineHeight: 36 }}>
          {known ? THEME_LABELS[known] : 'Theme not found'}
        </AppText>
      </View>

      {list === undefined ? (
        <AppText variant="meta">Loading…</AppText>
      ) : list.length === 0 ? (
        <View style={{ alignItems: 'center', gap: 10, paddingTop: 48, paddingHorizontal: 12 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.sand,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name="wisdom" size={24} color={colors.muted} />
          </View>
          <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 18, lineHeight: 24, textAlign: 'center' }}>
            No Vākyams here yet
          </AppText>
          <AppText variant="meta" style={{ textAlign: 'center' }}>
            New teachings are added after they are reviewed. Please check back soon.
          </AppText>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {list.map((v) => (
            <VakyamListCard key={v.id} vakyam={v} />
          ))}
        </View>
      )}
    </Screen>
  );
}

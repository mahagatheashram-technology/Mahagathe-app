import { useRouter } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

import { AppText, BackPill, Icon, Screen } from '@/components/ui';
import { photos, usePathways, useVibhagas } from '@/data';
import { ProgramRow, Meta, SectionHeading, village } from '@/features/sangha/village';
import { colors, fonts } from '@/theme/tokens';

/** Offer seva: the vibhāgas (photo rows) and the programs, in the village's calm list style. */
export default function SevaScreen() {
  const router = useRouter();
  const vibhagas = useVibhagas();
  const pathways = usePathways();
  return (
    <Screen background={colors.limewash} contentStyle={{ paddingTop: 2, paddingBottom: 36 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <BackPill destination="Sangha" onPress={() => router.dismissTo('/(tabs)/sangha')} />
      </View>
      <View style={{ paddingTop: 16, paddingHorizontal: 24 }}>
        <AppText accessibilityRole="header" style={{ fontFamily: fonts.displaySemibold, fontSize: 33, lineHeight: 51, color: village.ink }}>
          Offer seva
        </AppText>
        <AppText style={{ fontFamily: fonts.ui, fontSize: 15, lineHeight: 23.25, color: village.text2 }}>
          Volunteer with a vibhāga, or give to it.
        </AppText>
      </View>

      <View style={{ paddingTop: 22, paddingHorizontal: 16 }}>
        <SectionHeading style={{ marginHorizontal: 8 }}>Our seva</SectionHeading>
        {vibhagas === undefined ? (
          <Meta accessibilityLiveRegion="polite" style={{ marginHorizontal: 8 }}>Loading seva…</Meta>
        ) : !vibhagas.length ? (
          <Meta style={{ marginHorizontal: 8 }}>Seva opportunities will appear here soon.</Meta>
        ) : (
          vibhagas.map((v, i) => (
            <Pressable
              key={v.id}
              accessibilityRole="link"
              accessibilityLabel={`${v.name}, ${v.tagline}`}
              onPress={() => router.push({ pathname: '/vibhaga/[id]', params: { id: v.id } })}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                minHeight: 44,
                paddingVertical: 12,
                paddingHorizontal: 8,
                borderBottomWidth: i === vibhagas.length - 1 ? 0 : 1,
                borderBottomColor: village.line,
              }}>
              <Image source={photos[v.photo]} accessibilityIgnoresInvertColors style={{ width: 64, height: 64, borderRadius: 12 }} resizeMode="cover" />
              <View style={{ flex: 1 }}>
                <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 13, lineHeight: 20.15, color: village.laterite }}>{v.vibhaga}</AppText>
                <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 19, lineHeight: 26, color: village.ink }}>{v.name}</AppText>
                <Meta style={{ lineHeight: 21.7 }}>{v.tagline}</Meta>
              </View>
              <Icon name="chevronRight" size={20} color={colors.text2} strokeWidth={2} />
            </Pressable>
          ))
        )}
      </View>

      <View style={{ paddingTop: 28, paddingHorizontal: 16 }}>
        <SectionHeading style={{ marginHorizontal: 8 }}>Programs</SectionHeading>
        {pathways === undefined ? (
          <Meta accessibilityLiveRegion="polite" style={{ marginHorizontal: 8 }}>Loading programs…</Meta>
        ) : pathways.length === 0 ? (
          <Meta style={{ marginHorizontal: 8 }}>Programs will appear here soon.</Meta>
        ) : (
          pathways.map((p, i) => (
            <ProgramRow
              key={p.id}
              titleDev={p.titleDev.split(' ')[0]}
              name={p.name}
              line={`${p.tagline}. [Description to come]`}
              last={i === pathways.length - 1}
              onPress={() => router.push({ pathname: '/pathway/[id]', params: { id: p.id } })}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

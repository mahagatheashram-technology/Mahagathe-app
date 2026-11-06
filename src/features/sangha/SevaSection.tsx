import { useRouter } from 'expo-router';
import { Image, Pressable, View } from 'react-native';

import { AppText, SandBand } from '@/components/ui';
import { photos, usePathways, useVibhagas } from '@/data';
import { colors, fonts, radii } from '@/theme/tokens';

/** Sand band: "Our seva" vibhaga photo tiles (2-up) and Pathways chips. */
export function SevaSection() {
  const router = useRouter();
  const vibhagas = useVibhagas();
  const pathways = usePathways();

  const rows: (typeof vibhagas)[] = [];
  for (let i = 0; i < vibhagas.length; i += 2) rows.push(vibhagas.slice(i, i + 2));

  return (
    <SandBand accessibilityLabel="Vibhagas" style={{ paddingVertical: 28, paddingHorizontal: 20, gap: 14 }}>
      <View style={{ gap: 2 }}>
        <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 22, lineHeight: 28 }}>
          Our seva
        </AppText>
        <AppText variant="meta">The vibhagas of the Trust. Volunteer or give to any of them.</AppText>
      </View>

      <View style={{ gap: 10 }}>
        {rows.map((row, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
            {row.map((v) => (
              <Pressable
                key={v.id}
                accessibilityRole="link"
                accessibilityLabel={`${v.name}, ${v.tagline}`}
                onPress={() => router.push({ pathname: '/vibhaga/[id]', params: { id: v.id } })}
                style={{ flex: 1, borderRadius: radii.lg + 4, backgroundColor: colors.white, overflow: 'hidden' }}>
                <Image source={photos[v.photo]} accessibilityIgnoresInvertColors style={{ width: '100%', height: 100 }} resizeMode="cover" />
                <View style={{ padding: 12 }}>
                  <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 16, lineHeight: 20.5 }}>{v.name}</AppText>
                  <AppText variant="caption">{v.tagline}</AppText>
                </View>
              </Pressable>
            ))}
            {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
          </View>
        ))}
      </View>

      <View style={{ gap: 8, paddingTop: 6 }}>
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 19.5 }}>Pathways</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {pathways.map((p) => (
            <Pressable
              key={p.id}
              accessibilityRole="link"
              accessibilityLabel={p.name}
              onPress={() => router.push({ pathname: '/pathway/[id]', params: { id: p.id } })}
              hitSlop={{ top: 2, bottom: 2 }}
              style={{
                height: 42, // mock chip is content-box: 40 + 1px border each side
                paddingHorizontal: 14,
                borderRadius: radii.pill,
                backgroundColor: colors.white,
                borderWidth: 1,
                borderColor: colors.borderStrong,
                justifyContent: 'center',
              }}>
              <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 19.5 }}>{p.name}</AppText>
            </Pressable>
          ))}
        </View>
      </View>
    </SandBand>
  );
}

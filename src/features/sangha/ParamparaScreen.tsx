import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, DetailHeader, LineOrnament, ListRow, Screen } from '@/components/ui';
import { Emblem } from '@/components/ui/Emblem';
import { useParampara } from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { v12 } from '@/theme/v12';
import { BottomSheet } from './BottomSheet';

export function ParamparaScreen() {
  const content = useParampara();
  const [sheet, setSheet] = useState<'lineage' | 'milestones' | null>(null);
  return (
    <Screen contentStyle={{ paddingTop: 4, paddingHorizontal: 24, paddingBottom: 36 }}>
      <DetailHeader backLabel="Wisdom" backHref="/(tabs)/wisdom" />
      {!content ? (
        <AppText style={{ marginTop: 22 }}>
          {content === undefined ? 'Loading Paramparā…' : 'Paramparā will appear here once approved.'}
        </AppText>
      ) : (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 22 }}>
            <View style={{ width: 92, height: 92, alignItems: 'center', justifyContent: 'center' }}>
              <View style={StyleSheet.absoluteFill}>
                <LineOrnament size={92} opacity={0.6} />
              </View>
              <View
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 999,
                  backgroundColor: colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: colors.shadow,
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                }}>
                <Emblem width={32} />
              </View>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText
                style={{
                  fontFamily: fonts.sansSemibold,
                  fontSize: 12,
                  lineHeight: 18,
                  letterSpacing: 1.44,
                  textTransform: 'uppercase',
                  color: v12.label,
                }}>
                70th head of the lineage
              </AppText>
              <AppText
                accessibilityRole="header"
                style={{ fontFamily: fonts.serifSemibold, fontSize: 23, lineHeight: 28.75 }}>
                {content.guru.name}
              </AppText>
            </View>
          </View>
          <AppText style={{ marginTop: 18, fontSize: 16, lineHeight: 25.6, color: v12.muted }}>
            {content.guru.bio}
          </AppText>
          <View style={{ marginTop: 18 }}>
            <ListRow
              icon="lamp"
              title="The full lineage"
              subtitle="All seventy heads, in order"
              onPress={() => setSheet('lineage')}
            />
            <ListRow
              icon="drop"
              title="Dīkṣā milestones"
              subtitle="Initiations given through the years"
              last
              onPress={() => setSheet('milestones')}
            />
          </View>
          <View style={{ marginTop: 18, padding: 22, borderRadius: 22, backgroundColor: v12.sand }}>
            <AppText
              style={{ fontFamily: fonts.serifItalic, fontSize: 19, lineHeight: 28.5, textAlign: 'center' }}>
              “[A short teaching on the lineage, as approved.]”
            </AppText>
          </View>
          <BottomSheet
            visible={sheet !== null}
            onClose={() => setSheet(null)}
            title={sheet === 'lineage' ? 'The full lineage' : 'Dīkṣā milestones'}>
            <View style={{ gap: 18 }}>
              {sheet === 'lineage' ? (
                <>
                  {content.lineage.map((n) => (
                    <View key={n.label} style={{ gap: 4 }}>
                      <AppText color={v12.muted}>{n.label}</AppText>
                      <AppText variant="label">{n.name}</AppText>
                    </View>
                  ))}
                  <AppText color={v12.muted}>
                    The full list will appear here once approved by the content authority.
                  </AppText>
                </>
              ) : (
                content.milestones.map((m, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 14 }}>
                    <AppText variant="label">{m.year}</AppText>
                    <AppText style={{ flex: 1 }}>{m.text}</AppText>
                  </View>
                ))
              )}
            </View>
          </BottomSheet>
        </>
      )}
    </Screen>
  );
}

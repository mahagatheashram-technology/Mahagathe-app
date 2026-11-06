import { Pressable, View } from 'react-native';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { useState } from 'react';

import { AppText, Card, DetailHeader, Icon, RedFeature, Screen } from '@/components/ui';
import { useParampara } from '@/data';
import { BottomSheet } from '@/features/sangha/BottomSheet';
import { PortraitPlaceholder } from '@/features/sangha/PortraitPlaceholder';
import { colors, fonts } from '@/theme/tokens';

/** ParamparaV3: guru header on the red feature, lineage timeline, dīkṣā milestones, approval chip. */
export default function ParamparaScreen() {
  const insets = useScreenInsets();
  const content = useParampara();
  const [allOpen, setAllOpen] = useState(false);

  if (!content) return <Screen><DetailHeader /><AppText style={{ padding: 20 }}>{content === undefined ? 'Loading Paramparā…' : 'Paramparā will appear here once approved.'}</AppText></Screen>;
  const { guru, lineage, milestones } = content;
  const first = lineage[0];
  const rest = lineage.slice(1);

  return (
    <Screen edgeToEdgeTop>
      <RedFeature style={{ paddingTop: insets.top, paddingHorizontal: 24, paddingBottom: 28, gap: 18 }}>
        <DetailHeader tint={colors.white} />
        <View style={{ flexDirection: 'row', gap: 18, alignItems: 'center' }}>
          <PortraitPlaceholder width={104} height={128} radius={18} label="Approved portrait of the Mahamuni" fontSize={11} lineHeight={15.4} padding={8} />
          <View style={{ flex: 1, gap: 6 }}>
            <AppText variant="eyebrow" color={colors.onFeatureMuted}>
              {guru.title}
            </AppText>
            <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 24, lineHeight: 30, color: colors.white }}>
              {guru.name}
            </AppText>
          </View>
        </View>
        <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 22.4, color: colors.onFeatureMuted }}>{guru.bio}</AppText>
      </RedFeature>

      <View style={{ flex: 1, gap: 24, paddingTop: 28, paddingHorizontal: 24, paddingBottom: 32 }}>
        <View accessibilityLabel="The lineage">
          <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 22, lineHeight: 28, marginBottom: 18 }}>
            The lineage
          </AppText>
          {first ? <Node label={first.label} name={first.name} /> : null}
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ width: 14, alignItems: 'center' }}>
              <View style={{ width: 2, height: 6, backgroundColor: colors.border }} />
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderStrong }} />
              <View style={{ flex: 1, width: 2, backgroundColor: colors.border }} />
            </View>
            <View style={{ flex: 1, paddingBottom: 22, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 19.5, color: colors.muted }}>68 Mahādhibhūs · </AppText>
              <Pressable accessibilityRole="button" accessibilityLabel="See all Mahādhibhūs" onPress={() => setAllOpen(true)} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
                <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 19.5, color: colors.actionRed }}>See all</AppText>
              </Pressable>
            </View>
          </View>
          {rest.map((n, i) => (
            <Node key={n.label} label={n.label} name={n.name} present={n.present} last={i === rest.length - 1} />
          ))}
        </View>

        <View style={{ gap: 12 }}>
          <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 22, lineHeight: 28 }}>
            Dīkṣā milestones
          </AppText>
          <Card radius={18}>
            {milestones.map((m, i) => (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  gap: 14,
                  paddingHorizontal: 16,
                  paddingVertical: 15,
                  borderBottomWidth: i === milestones.length - 1 ? 0 : 1,
                  borderBottomColor: colors.sand,
                }}>
                <AppText style={{ width: 52, fontFamily: fonts.serifSemibold, fontSize: 16, lineHeight: 20.5, color: colors.actionRed }}>{m.year}</AppText>
                <AppText style={{ flex: 1, fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 21 }}>{m.text}</AppText>
              </View>
            ))}
          </Card>
        </View>

        <View
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            height: 30,
            paddingHorizontal: 12,
            borderRadius: 999,
            backgroundColor: colors.sand,
          }}>
          <Icon name="shieldCheck" size={13} color={colors.actionRed} strokeWidth={2.2} />
          <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 12, lineHeight: 18 }}>Approved by the content authority</AppText>
        </View>
      </View>

      <BottomSheet visible={allOpen} onClose={() => setAllOpen(false)} title="All Mahādhibhūs">
        <AppText style={{ lineHeight: 23 }}>
          The full list of the 68 Mahādhibhūs between the founding ācārya and the 69th will appear here once the content authority has approved it.
        </AppText>
      </BottomSheet>
    </Screen>
  );
}

/** One lineage node on the vertical timeline. `present` = filled dot + red label. */
function Node({ label, name, present, last }: { label: string; name: string; present?: boolean; last?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <View style={{ width: 14, alignItems: 'center' }}>
        {present ? (
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: colors.actionRed }} />
        ) : (
          <>
            <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2.5, borderColor: colors.actionRed }} />
            <View style={{ flex: 1, width: 2, backgroundColor: colors.border }} />
          </>
        )}
      </View>
      <View style={{ flex: 1, paddingBottom: last || present ? 0 : 22 }}>
        <AppText style={{ fontFamily: present ? fonts.sansSemibold : fonts.sansMedium, fontSize: 12, lineHeight: 18, color: present ? colors.actionRed : colors.muted }}>{label}</AppText>
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 22.5 }}>{name}</AppText>
      </View>
    </View>
  );
}

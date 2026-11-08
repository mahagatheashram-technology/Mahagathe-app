import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, View } from 'react-native';

import {
  AppText,
  LateriteStripes,
  OutlineButton,
  PhotoPlaceholder,
  Screen,
  TextLink,
} from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { photos, usePathways, useEvents, useVibhagas } from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { gatheringLine, istDate, programLine, withoutYear } from './format';
import { useEventToggle } from './useEventToggle';
import { Meta, ProgramRow, RegisterButton, SectionHeading, VillageEventRow, village } from './village';

/** Sangha: the village. Laterite header with a photo slot, the next gathering, what is coming up, programs, seva, give. */
export function SanghaScreen() {
  const router = useRouter();
  const insets = useScreenInsets();
  const events = useEvents();
  const pathways = usePathways();
  const vibhagas = useVibhagas();
  const { toggle, busyId } = useEventToggle();

  const featured = events?.find((e) => e.imageKey) ?? events?.[0] ?? null;
  const comingUp = (events ?? []).filter((e) => e !== featured).slice(0, 4);
  const feature = pathways?.find((p) => p.featured);
  const others = (pathways ?? []).filter((p) => p !== feature);
  const date = featured ? istDate(featured.startsAt) : null;
  // The mock header is 330 high with the status area (52) inside it.
  const headerHeight = 278 + insets.top;

  return (
    <Screen background={colors.limewash} edgeToEdgeTop contentStyle={{ paddingBottom: 28 }}>
      <View>
        <PhotoPlaceholder
          label="[Ashram or Abhyudaya anniversary photo to come]"
          height={headerHeight}
          radius={0}
          style={{ paddingHorizontal: 24 }}
        />
        <AppText
          accessibilityRole="header"
          style={{
            position: 'absolute',
            left: 24,
            top: insets.top,
            fontFamily: fonts.displaySemibold,
            fontSize: 33,
            lineHeight: 51,
            color: colors.white,
          }}>
          Sangha
        </AppText>
        {date ? (
          <View
            accessible
            accessibilityLabel={`${date.weekday} ${date.day} ${date.monthLong}`}
            style={{
              position: 'absolute',
              left: 16,
              bottom: -34,
              width: 84,
              height: 92,
              borderRadius: 14,
              backgroundColor: colors.white,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.lateriteShadow,
              shadowOpacity: 0.25,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 6 },
              elevation: 6,
            }}>
            <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 15.75, color: village.laterite }}>{date.month}</AppText>
            <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 38, lineHeight: 41.8, color: village.laterite }}>{date.day}</AppText>
            <AppText style={{ fontFamily: fonts.ui, fontSize: 13, lineHeight: 13.65, color: village.laterite }}>{date.weekday}</AppText>
          </View>
        ) : null}
      </View>

      <View style={{ paddingTop: date ? 46 : 28, paddingHorizontal: 24 }}>
        {featured ? (
          <>
            <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color: village.laterite }}>The next gathering</AppText>
            <AppText
              accessibilityRole="header"
              style={{ fontFamily: fonts.displaySemibold, fontSize: 28, lineHeight: 33.6, marginTop: 2, color: village.ink }}>
              {featured.title}
            </AppText>
            <AppText style={{ fontFamily: fonts.ui, fontSize: 16, lineHeight: 24.8, marginTop: 6, color: village.text2 }}>
              {gatheringLine(featured)}
            </AppText>
            <View style={{ marginTop: 16 }}>
              <RegisterButton
                wide
                event={featured}
                busy={busyId === featured.id}
                onToggle={() => toggle(featured)}
                label={`Register for ${withoutYear(featured.title)}`}
              />
            </View>
          </>
        ) : (
          <AppText style={{ fontFamily: fonts.ui, fontSize: 16, lineHeight: 24.8, color: village.text2 }}>
            {events === undefined ? 'Loading gatherings…' : 'New gatherings will appear here when announced.'}
          </AppText>
        )}
      </View>

      <View style={{ paddingTop: 34, paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionHeading>Coming up</SectionHeading>
          <TextLink label="Full calendar" color={village.ink} onPress={() => router.push('/events')} />
        </View>
        {comingUp.length ? (
          <View style={{ marginTop: 0 }}>
            {comingUp.map((e, i) => (
              <VillageEventRow key={e.id} event={e} first={i === 0} onPress={() => router.push('/events')} />
            ))}
          </View>
        ) : (
          <Meta>{events === undefined ? 'Loading…' : 'No other dates yet. New ones appear here when announced.'}</Meta>
        )}
      </View>

      <View style={{ paddingTop: 34, paddingHorizontal: 16 }}>
        <SectionHeading style={{ marginHorizontal: 8 }}>Programs</SectionHeading>
        <AppText
          style={{ fontFamily: fonts.ui, fontSize: 15, lineHeight: 23.25, marginHorizontal: 8, marginTop: 2, marginBottom: 14, color: village.text2 }}>
          Ways to learn and grow with the ashram.
        </AppText>
        {pathways === undefined ? (
          <Meta style={{ marginHorizontal: 8 }}>Loading programs…</Meta>
        ) : (
          <>
            {feature ? (
              <View style={{ borderRadius: 16, overflow: 'hidden', backgroundColor: colors.laterite }}>
                <LateriteStripes />
                <View style={{ paddingTop: 20, paddingHorizontal: 20, paddingBottom: 18 }}>
                  <AppText accessibilityRole="header" style={{ fontFamily: fonts.display, fontSize: 36, lineHeight: 39.6, color: colors.photoText }}>
                    {feature.titleDev}
                  </AppText>
                  <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 24, lineHeight: 37.2, marginTop: 4, color: colors.white }}>
                    {feature.name}
                  </AppText>
                  <AppText style={{ fontFamily: fonts.ui, fontSize: 15, lineHeight: 23.25, marginTop: 4, marginBottom: 14, color: colors.photoText }}>
                    {programLine(feature)}. [Description to come]
                  </AppText>
                  <OutlineButton
                    label={`Meet ${feature.name}`}
                    color={colors.white}
                    onPress={() => router.push({ pathname: '/pathway/[id]', params: { id: feature.id } })}
                  />
                </View>
              </View>
            ) : null}
            {others.map((p, i) => (
              <ProgramRow
                key={p.id}
                // Rows are narrow: the mock shows the first word only (बाल चेतना → बाल).
                titleDev={p.titleDev.split(' ')[0]}
                name={p.name}
                line={`${p.tagline}. [Description to come]`}
                last={i === others.length - 1}
                onPress={() => router.push({ pathname: '/pathway/[id]', params: { id: p.id } })}
              />
            ))}
          </>
        )}
      </View>

      <View style={{ paddingTop: 34 }}>
        <View style={{ paddingHorizontal: 24 }}>
          <SectionHeading>Our seva</SectionHeading>
          <AppText style={{ fontFamily: fonts.ui, fontSize: 15, lineHeight: 23.25, marginTop: 2, marginBottom: 14, color: village.text2 }}>
            Four kinds of service the sangha does every week.
          </AppText>
        </View>
        {vibhagas === undefined ? (
          <Meta style={{ paddingHorizontal: 24 }}>Loading seva…</Meta>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 24 }}>
            {vibhagas.map((v) => (
              <Pressable
                key={v.id}
                accessibilityRole="link"
                accessibilityLabel={`${v.name}, ${v.tagline}`}
                onPress={() => router.push({ pathname: '/vibhaga/[id]', params: { id: v.id } })}
                style={{ width: 200 }}>
                <Image
                  source={photos[v.photo]}
                  accessibilityIgnoresInvertColors
                  style={{ width: 200, height: 130, borderRadius: 12 }}
                  resizeMode="cover"
                />
                <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 13, lineHeight: 20.15, marginTop: 10, color: village.laterite }}>{v.vibhaga}</AppText>
                <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 19, lineHeight: 22.8, color: village.ink }}>{v.name}</AppText>
                <AppText style={{ fontFamily: fonts.ui, fontSize: 14, lineHeight: 21.7, color: village.text2 }}>{v.tagline}</AppText>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      <View
        style={{
          marginTop: 30,
          marginHorizontal: 16,
          padding: 20,
          borderRadius: 16,
          backgroundColor: village.soft,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}>
        <View style={{ flex: 1 }}>
          <AppText accessibilityRole="header" style={{ fontFamily: fonts.displaySemibold, fontSize: 20, lineHeight: 31, color: village.ink }}>Give dāna</AppText>
          <AppText style={{ fontFamily: fonts.ui, fontSize: 15, lineHeight: 23.25, color: village.text2 }}>
            Support the seva by UPI. A receipt comes by SMS.
          </AppText>
        </View>
        <OutlineButton label="Give" color={village.laterite} accessibilityLabel="Give dāna" onPress={() => router.push('/donate')} />
      </View>
    </Screen>
  );
}

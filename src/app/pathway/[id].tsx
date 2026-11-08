import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  AppText,
  BackPill,
  LateriteStripes,
  OutlineButton,
  PhotoPlaceholder,
  PrimaryButton,
  ReviewTag,
  Screen,
} from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { useEvents, usePathway } from '@/data';
import { openWhatsApp } from '@/features/sangha/AboutSheet';
import { istDate, plainTime } from '@/features/sangha/format';
import { useEventToggle } from '@/features/sangha/useEventToggle';
import { Meta, SectionHeading, village } from '@/features/sangha/village';
import { colors, fonts } from '@/theme/tokens';

const WHAT_WE_DO = ['[Activity 1]', '[Activity 2]', '[Activity 3]'];

/** A program page (V131Program): laterite header, photo slot, description, what we do, next class. */
export default function PathwayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useScreenInsets();
  const pathway = usePathway(id);
  const events = useEvents();
  const { toggle, busyId } = useEventToggle();

  const goBack = () => router.dismissTo('/(tabs)/sangha');

  if (!pathway) {
    return (
      <Screen background={colors.limewash} contentStyle={{ paddingHorizontal: 16, paddingTop: 2, gap: 18 }}>
        <BackPill destination="Sangha" onPress={goBack} />
        <View style={{ paddingHorizontal: 8, gap: 4 }}>
          <AppText accessibilityLiveRegion="polite" style={{ fontFamily: fonts.displaySemibold, fontSize: 21, lineHeight: 32.55, color: village.ink }}>
            {pathway === undefined ? 'Loading program…' : 'This page is not available'}
          </AppText>
          <Meta>Go back to Sangha to see the programs.</Meta>
        </View>
      </Screen>
    );
  }

  // Match by pathwayId first; fall back to the program's name in the title ("Yuva Chetana class").
  const nextClass =
    (events ?? []).find((e) => e.pathwayId === pathway.id) ??
    (events ?? []).find((e) => e.title.toLowerCase().includes(pathway.name.toLowerCase())) ??
    null;
  const d = nextClass ? istDate(nextClass.startsAt) : null;
  const headline = pathway.featured && pathway.ageRange ? `${pathway.tagline}. For ages ${pathway.ageRange}.` : `${pathway.tagline}.`;

  return (
    <Screen background={colors.limewash} edgeToEdgeTop contentStyle={{ paddingBottom: 40 }}>
      <View style={{ backgroundColor: colors.laterite, paddingTop: insets.top + 2, paddingHorizontal: 16, paddingBottom: 24 }}>
        <LateriteStripes />
        <BackPill destination="Sangha" dark onPress={goBack} />
        <View style={{ paddingTop: 18, paddingHorizontal: 8 }}>
          <AppText style={{ fontFamily: fonts.display, fontSize: 50, lineHeight: 55, color: colors.photoText }}>{pathway.titleDev}</AppText>
          <AppText accessibilityRole="header" style={{ fontFamily: fonts.displaySemibold, fontSize: 32, lineHeight: 49.6, marginTop: 2, color: colors.white }}>
            {pathway.name}
          </AppText>
          <AppText style={{ fontFamily: fonts.ui, fontSize: 17, lineHeight: 26.35, marginTop: 6, color: colors.photoText }}>{headline}</AppText>
        </View>
      </View>

      <View style={{ paddingTop: 16, paddingHorizontal: 16 }}>
        <PhotoPlaceholder label={`[${pathway.name} photos to come]`} height={200} radius={12} />
      </View>

      <View style={{ paddingTop: 22, paddingHorizontal: 24 }}>
        <AppText style={{ fontFamily: fonts.ui, fontSize: 17, lineHeight: 27.2, color: village.ink }}>{pathway.about}</AppText>
        <ReviewTag label="Copy and photos to come from the team" style={{ marginTop: 10 }} />
      </View>

      <View style={{ paddingTop: 24, paddingHorizontal: 24 }}>
        <SectionHeading style={{ marginBottom: 4 }}>What we do</SectionHeading>
        {WHAT_WE_DO.map((label, i) => (
          <View
            key={label}
            style={[{ flexDirection: 'row', gap: 14, paddingVertical: 13 }, i > 0 ? { borderTopWidth: 1, borderTopColor: village.line } : null]}>
            <AppText style={{ width: 24, fontFamily: fonts.displaySemibold, fontSize: 19, lineHeight: 29.45, color: village.laterite }}>{i + 1}</AppText>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: village.ink }}>{label}</AppText>
              <Meta>[One line on it]</Meta>
            </View>
          </View>
        ))}
      </View>

      <View
        style={{
          marginTop: 18,
          marginHorizontal: 16,
          paddingVertical: 16,
          paddingHorizontal: 18,
          borderRadius: 16,
          backgroundColor: village.soft,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}>
        {nextClass && d ? (
          <>
            <View accessible accessibilityLabel={`${d.weekday} ${d.day} ${d.monthLong}`} style={{ width: 52, alignItems: 'center' }}>
              <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 13, lineHeight: 14.3, color: village.laterite }}>{d.weekdayShort}</AppText>
              <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 26, lineHeight: 28.6, color: village.laterite }}>{d.day}</AppText>
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: village.ink }}>Next class</AppText>
              <Meta>
                {plainTime(nextClass.timeLabel)} at {nextClass.place}
                {nextClass.registered ? '. You’re going' : ''}
              </Meta>
            </View>
          </>
        ) : (
          <View style={{ flex: 1 }}>
            <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: village.ink }}>Next class</AppText>
            <Meta>{events === undefined ? 'Loading…' : '[Date to come]'}</Meta>
          </View>
        )}
      </View>

      <View style={{ paddingTop: 22, paddingHorizontal: 16 }}>
        {nextClass ? (
          nextClass.registered ? (
            <OutlineButton
              label="Cancel my place"
              color={village.laterite}
              loading={busyId === nextClass.id}
              onPress={() => toggle(nextClass)}
              accessibilityLabel={`You’re going to ${nextClass.title}. Double tap to cancel your registration`}
              style={{ alignSelf: 'stretch', minHeight: 54 }}
            />
          ) : (
            <PrimaryButton
              label={nextClass.placesLeft === 0 ? 'Class is full' : 'Join the next class'}
              disabled={nextClass.placesLeft === 0}
              loading={busyId === nextClass.id}
              onPress={() => toggle(nextClass)}
            />
          )
        ) : (
          <PrimaryButton label="Ask about the next class" onPress={openWhatsApp} />
        )}
      </View>
    </Screen>
  );
}

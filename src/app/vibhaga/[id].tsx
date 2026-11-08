import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, View } from 'react-native';

import { AppText, BackPill, Icon, OutlineButton, PrimaryButton, ReviewTag, Screen } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { photos, useEvents, useSession, useVibhaga } from '@/data';
import { VolunteerSheet } from '@/features/sangha/VolunteerSheet';
import { useEventToggle } from '@/features/sangha/useEventToggle';
import { Meta, SectionHeading, VillageEventRow, village } from '@/features/sangha/village';
import { colors, fonts } from '@/theme/tokens';

/** A vibhāga (G-04): photo, about, head, upcoming events, Volunteer (G-06), Give to this vibhāga. */
export default function VibhagaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useScreenInsets();
  const vibhaga = useVibhaga(id);
  const events = useEvents();
  const { status, canUsePersonalFeatures: isSignedIn } = useSession();
  const { toggle, busyId } = useEventToggle();
  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const { list, filtered } = useMemo(() => {
    const all = events ?? [];
    const own = all.filter((e) => e.vibhagaId === id);
    return own.length > 0 ? { list: own, filtered: true } : { list: all, filtered: false };
  }, [events, id]);

  const goBack = () => router.dismissTo('/(tabs)/sangha');

  if (!vibhaga) {
    return (
      <Screen background={colors.limewash} contentStyle={{ paddingHorizontal: 16, paddingTop: 2, gap: 18 }}>
        <BackPill destination="Sangha" onPress={goBack} />
        <View style={{ paddingHorizontal: 8 }}>
          <AppText accessibilityLiveRegion="polite" style={{ fontFamily: fonts.displaySemibold, fontSize: 21, lineHeight: 32.55, color: village.ink }}>
            {vibhaga === undefined ? 'Loading vibhāga…' : 'This page is not available'}
          </AppText>
          <Meta>Go back to Sangha to see the vibhāgas of the Trust.</Meta>
        </View>
      </Screen>
    );
  }

  const requireSignIn = (go: () => void) => (isSignedIn ? go() : router.push(status === 'signedIn' ? '/setup' : '/welcome'));

  return (
    <Screen background={colors.limewash} edgeToEdgeTop contentStyle={{ paddingBottom: 40 }}>
      <View style={{ height: 240 + insets.top }}>
        <Image source={photos[vibhaga.photo]} accessibilityIgnoresInvertColors style={{ width: '100%', height: 240 + insets.top }} resizeMode="cover" />
        <View style={{ position: 'absolute', left: 16, top: insets.top + 2 }}>
          <BackPill destination="Sangha" dark style={{ backgroundColor: 'rgba(42,30,20,.45)' }} onPress={goBack} />
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
        <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color: village.laterite }}>{vibhaga.vibhaga}</AppText>
        <AppText accessibilityRole="header" style={{ fontFamily: fonts.displaySemibold, fontSize: 33, lineHeight: 42, marginTop: 2, color: village.ink }}>
          {vibhaga.name}
        </AppText>
        <AppText style={{ fontFamily: fonts.ui, fontSize: 16, lineHeight: 24.8, color: village.text2 }}>{vibhaga.tagline}</AppText>

        <AppText style={{ fontFamily: fonts.ui, fontSize: 17, lineHeight: 27.2, marginTop: 18, color: village.ink }}>{vibhaga.about}</AppText>
        <ReviewTag label="Copy and photos to come from the team" style={{ marginTop: 10 }} />

        <View
          style={{
            marginTop: 20,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            padding: 14,
            borderRadius: 16,
            backgroundColor: village.soft,
          }}>
          <View
            accessible
            accessibilityLabel="Photo to come"
            style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.laterite, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="people" size={24} color={colors.photoText} />
          </View>
          <View style={{ flex: 1 }}>
            <Meta style={{ lineHeight: 21.7 }}>Head of the vibhāga</Meta>
            <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: village.ink }}>[Name, as approved]</AppText>
          </View>
        </View>

        <View style={{ paddingTop: 28 }}>
          <SectionHeading>Coming up</SectionHeading>
          {!filtered && list.length > 0 ? <Meta style={{ lineHeight: 21.7 }}>No dates listed for {vibhaga.name} yet. Showing all sangha events.</Meta> : null}
          {events === undefined ? (
            <Meta accessibilityLiveRegion="polite">Loading events…</Meta>
          ) : list.length === 0 ? (
            <Meta>No events right now. New dates appear here when they are announced.</Meta>
          ) : (
            list.map((e, i) => (
              <VillageEventRow key={e.id} event={e} first={i === 0} showPlaces busy={busyId === e.id} onToggle={() => toggle(e)} />
            ))
          )}
        </View>
      </View>

      <View style={{ paddingTop: 26, paddingHorizontal: 16, gap: 12 }}>
        <PrimaryButton label={`Give to ${vibhaga.name}`} onPress={() => router.push({ pathname: '/donate', params: { purpose: vibhaga.id } })} />
        <OutlineButton
          label={`Volunteer with ${vibhaga.name}`}
          color={village.laterite}
          style={{ alignSelf: 'stretch', minHeight: 54 }}
          onPress={() =>
            requireSignIn(() => {
              setFormKey((k) => k + 1);
              setVolunteerOpen(true);
            })
          }
        />
      </View>

      <VolunteerSheet key={formKey} visible={volunteerOpen} onClose={() => setVolunteerOpen(false)} vibhagaId={vibhaga.id} vibhagaName={vibhaga.name} />
    </Screen>
  );
}

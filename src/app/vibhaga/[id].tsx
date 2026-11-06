import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApprovedPhotoPlaceholder, AppText, Button, Card, DetailHeader, EventList, EventRow, Icon, Screen } from '@/components/ui';
import { photos, useEvents, useSession, useVibhaga } from '@/data';
import { VolunteerSheet } from '@/features/sangha/VolunteerSheet';
import { useEventToggle } from '@/features/sangha/useEventToggle';
import { colors, fonts, shadows } from '@/theme/tokens';

/** Vibhaga hub (G-04): photo, about, head, upcoming events, Volunteer (G-06), Give to this vibhaga. */
export default function VibhagaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const vibhaga = useVibhaga(id);
  const events = useEvents();
  const { isSignedIn } = useSession();
  const { toggle, busyId } = useEventToggle();
  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const { list, filtered } = useMemo(() => {
    const all = events ?? [];
    const own = all.filter((e) => e.vibhagaId === id);
    return own.length > 0 ? { list: own, filtered: true } : { list: all, filtered: false };
  }, [events, id]);

  if (!vibhaga) {
    return (
      <Screen contentStyle={{ paddingHorizontal: 20, gap: 16 }}>
        <DetailHeader />
        <Card style={{ padding: 20, gap: 4 }}>
          <AppText variant="label">This page is not available</AppText>
          <AppText variant="meta">Go back to Sangha to see the vibhagas of the Trust.</AppText>
        </Card>
      </Screen>
    );
  }

  const requireSignIn = (go: () => void) => (isSignedIn ? go() : router.push('/welcome'));

  return (
    <Screen edgeToEdgeTop contentStyle={{ paddingBottom: 32 }}>
      <View style={{ height: 220 + insets.top }}>
        <Image source={photos[vibhaga.photo]} accessibilityIgnoresInvertColors style={{ width: '100%', height: 220 + insets.top }} resizeMode="cover" />
        <View style={{ position: 'absolute', left: 10, top: insets.top + 4 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/sangha'))}
            style={[{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, shadows.card]}>
            <Icon name="back" size={22} color={colors.ink} />
          </Pressable>
        </View>
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 22, gap: 24 }}>
        <View style={{ gap: 4 }}>
          <AppText variant="eyebrow">Vibhaga</AppText>
          <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 32, lineHeight: 41 }}>
            {vibhaga.name}
          </AppText>
          <AppText variant="meta">{vibhaga.tagline}</AppText>
        </View>

        <View style={{ gap: 12 }}>
          <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 22, lineHeight: 28 }}>
            About
          </AppText>
          <Card radius={18} style={{ padding: 16 }}>
            <AppText style={{ lineHeight: 23 }}>{vibhaga.about}</AppText>
          </Card>
          <Card radius={18} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 }}>
            <ApprovedPhotoPlaceholder size={52} label="Photo" />
            <View style={{ flex: 1 }}>
              <AppText variant="caption">Head of the vibhaga</AppText>
              <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 22.5 }}>[Name, as approved]</AppText>
            </View>
          </Card>
        </View>

        <View style={{ gap: 12 }}>
          <View style={{ gap: 2 }}>
            <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 22, lineHeight: 28 }}>
              Upcoming events
            </AppText>
            {!filtered && list.length > 0 ? <AppText variant="caption">No events listed for {vibhaga.name} yet. Showing all Sangha events.</AppText> : null}
          </View>
          {events === undefined ? (
            <AppText variant="meta">Loading events…</AppText>
          ) : list.length === 0 ? (
            <Card style={{ padding: 20 }}>
              <AppText variant="meta">No events right now. New dates appear here when they are announced.</AppText>
            </Card>
          ) : (
            <EventList>
              {list.map((e, i) => (
                <EventRow key={e.id} event={e} showPlaces busy={busyId === e.id} last={i === list.length - 1} onToggle={() => toggle(e)} />
              ))}
            </EventList>
          )}
        </View>

        <View style={{ gap: 12 }}>
          <Button label={`Volunteer with ${vibhaga.name}`} variant="outline" onPress={() => requireSignIn(() => {
            setFormKey((k) => k + 1);
            setVolunteerOpen(true);
          })} />
          <Button label={`Give to ${vibhaga.name}`} onPress={() => router.push({ pathname: '/donate', params: { purpose: vibhaga.id } })} />
        </View>
      </View>

      <VolunteerSheet key={formKey} visible={volunteerOpen} onClose={() => setVolunteerOpen(false)} vibhagaId={vibhaga.id} vibhagaName={vibhaga.name} />
    </Screen>
  );
}

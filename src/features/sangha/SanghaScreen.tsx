import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { AppText, EventCard, Icon, ListRow, Screen } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { photos, useEvents } from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { v12 } from '@/theme/v12';
import { BottomSheet } from './BottomSheet';
import { useEventToggle } from './useEventToggle';

export function SanghaScreen() {
  const router = useRouter();
  const insets = useScreenInsets();
  const events = useEvents();
  const [gatheringOpen, setGatheringOpen] = useState(false);
  const { toggle, busyId } = useEventToggle();
  const featured = events?.find((e) => e.imageKey) ?? events?.[0];
  const date = featured
    ? new Date(featured.startsAt)
        .toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          timeZone: 'Asia/Kolkata',
        })
        .replace(',', '')
    : '';
  const count = events?.length ?? 0;
  const going = events?.filter((e) => e.registered).length ?? 0;
  return (
    <Screen edgeToEdgeTop>
      <LinearGradient
        colors={[v12.headerTop, colors.cream]}
        style={{ paddingTop: insets.top + 32, paddingHorizontal: 24, paddingBottom: 24 }}>
        <AppText
          accessibilityRole="header"
          style={{ fontFamily: fonts.serifSemibold, fontSize: 32, lineHeight: 41, marginBottom: 6 }}>
          Sangha
        </AppText>
        <AppText style={{ fontSize: 15, lineHeight: 23, color: v12.muted }}>
          Gather, serve and give together.
        </AppText>
      </LinearGradient>
      <View style={{ paddingHorizontal: 24, paddingBottom: 24, gap: 14 }}>
        <AppText
          style={{
            fontFamily: fonts.sansSemibold,
            fontSize: 12,
            lineHeight: 18,
            letterSpacing: 1.68,
            color: v12.label,
            textTransform: 'uppercase',
          }}>
          Next gathering
        </AppText>
        {featured ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`View gathering: ${featured.title}`}
            onPress={() => setGatheringOpen(true)}
            style={{
              overflow: 'hidden',
              borderRadius: 24,
              borderWidth: 1,
              borderColor: v12.cardBorder,
              backgroundColor: colors.white,
              shadowColor: colors.shadow,
              shadowOpacity: 0.06,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}>
            {featured.imageKey ? (
              <Image
                source={photos[featured.imageKey]}
                accessibilityLabel="A past Mahagathe gathering"
                style={{ width: '100%', height: 140 }}
                contentFit="cover"
                contentPosition={{ left: '50%', top: '30%' }}
              />
            ) : (
              <View style={{ height: 140, backgroundColor: v12.sand }} />
            )}
            <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12, gap: 2 }}>
              <AppText
                style={{ fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21, color: v12.label }}>
                {date} · {featured.timeLabel.toLowerCase()}
              </AppText>
              <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 19, lineHeight: 25 }}>
                {featured.title}
              </AppText>
              <AppText
                style={{ fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 21, color: v12.muted }}>
                {featured.place} · {featured.eligibility.toLowerCase()}
              </AppText>
              <View
                style={{
                  marginTop: 8,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderTopColor: v12.divider,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23 }}>
                  View gathering
                </AppText>
                <Icon name="chevronRight" size={16} strokeWidth={2.4} />
              </View>
            </View>
          </Pressable>
        ) : (
          <AppText>
            {events === undefined ? 'Loading gatherings…' : 'New gatherings will appear here when announced.'}
          </AppText>
        )}
        <ListRow
          icon="clock"
          title="All gatherings"
          subtitle={`${count} upcoming · you’re going to ${going}`}
          last
          onPress={() => router.push('/events')}
        />
        <View>
          <ListRow
            icon="heart"
            title="Offer seva"
            subtitle="Food, learning or care for elders"
            onPress={() => router.push('/seva')}
          />
          <ListRow
            icon="offering-hands"
            title="Give dāna"
            subtitle="Support the seva, by UPI"
            last
            onPress={() => router.push('/donate')}
          />
        </View>
      </View>
      <BottomSheet visible={gatheringOpen} onClose={() => setGatheringOpen(false)} title="Gathering">
        {featured ? (
          <EventCard event={featured} busy={busyId === featured.id} onToggle={() => toggle(featured)} />
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

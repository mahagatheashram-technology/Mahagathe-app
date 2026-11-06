import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Card, EventCard, EventList, EventRow, Icon } from '@/components/ui';
import { useEvents } from '@/data';
import { useEventToggle } from './useEventToggle';
import { colors, fonts } from '@/theme/tokens';

/** Sangha "Events": featured photo event + the next few as rows. */
export function EventsSection() {
  const router = useRouter();
  const events = useEvents();
  const { toggle, busyId } = useEventToggle();

  const { featured, rest } = useMemo(() => {
    const list = events ?? [];
    const featured = list.find((e) => e.imageKey) ?? null;
    return { featured, rest: list.filter((e) => e !== featured).slice(0, 4) };
  }, [events]);

  return (
    <View accessibilityLabel="Events" style={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 28, gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 22, lineHeight: 28 }}>
          Events
        </AppText>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel="Calendar"
          onPress={() => router.push('/events')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}>
          <Icon name="calendar" size={16} color={colors.actionRed} />
          <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 13, color: colors.actionRed }}>Calendar</AppText>
        </Pressable>
      </View>

      {events === undefined ? (
        <Card style={{ padding: 20 }}>
          <AppText variant="meta">Loading events…</AppText>
        </Card>
      ) : !featured && rest.length === 0 ? (
        <Card style={{ padding: 20, gap: 4 }}>
          <AppText variant="label">No events right now</AppText>
          <AppText variant="meta">New dates appear here when they are announced.</AppText>
        </Card>
      ) : (
        <>
          {featured ? <EventCard event={featured} busy={busyId === featured.id} onToggle={() => toggle(featured)} /> : null}
          {rest.length > 0 ? (
            <EventList>
              {rest.map((e, i) => (
                <EventRow key={e.id} event={e} busy={busyId === e.id} last={i === rest.length - 1} onToggle={() => toggle(e)} />
              ))}
            </EventList>
          ) : null}
        </>
      )}
    </View>
  );
}

import { useMemo } from 'react';
import { View } from 'react-native';

import { AppText, Card, DetailHeader, EventList, EventRow, Icon, Screen, eventDateParts } from '@/components/ui';
import { useEvents, type EventItem } from '@/data';
import { useEventToggle } from '@/features/sangha/useEventToggle';
import { colors, fonts } from '@/theme/tokens';

/** Events calendar (G-03): upcoming events grouped by month, in the calm Sangha row style. */
export default function EventsScreen() {
  const events = useEvents();
  const { toggle, busyId } = useEventToggle();

  const months = useMemo(() => {
    const groups: { key: string; label: string; items: EventItem[] }[] = [];
    for (const e of events ?? []) {
      const p = eventDateParts(e.startsAt);
      let g = groups.find((x) => x.key === p.monthKey);
      if (!g) groups.push((g = { key: p.monthKey, label: `${p.monthName} ${p.year}`, items: [] }));
      g.items.push(e);
    }
    return groups;
  }, [events]);

  return (
    <Screen contentStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 22 }}>
      <DetailHeader backLabel="Sangha" backHref="/(tabs)/sangha" />
      <View style={{ gap: 6 }}>
        <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 32, lineHeight: 41 }}>
          Events
        </AppText>
        <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 22.4, color: colors.muted }}>
          Gatherings of the Sangha. Register to keep your place. Times are in IST.
        </AppText>
      </View>

      {events === undefined ? (
        <AppText variant="meta">Loading events…</AppText>
      ) : months.length === 0 ? (
        <Card style={{ alignItems: 'center', gap: 10, padding: 28 }}>
          <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.tile, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="calendar" size={22} color={colors.actionRed} />
          </View>
          <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 18, lineHeight: 24 }}>No upcoming events</AppText>
          <AppText variant="meta" style={{ textAlign: 'center' }}>
            New dates will appear here when they are announced.
          </AppText>
        </Card>
      ) : (
        months.map((m) => (
          <View key={m.key} style={{ gap: 12 }}>
            <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 22, lineHeight: 28 }}>
              {m.label}
            </AppText>
            <EventList>
              {m.items.map((e, i) => (
                <EventRow key={e.id} event={e} showPlaces busy={busyId === e.id} last={i === m.items.length - 1} onToggle={() => toggle(e)} />
              ))}
            </EventList>
          </View>
        ))
      )}
    </Screen>
  );
}

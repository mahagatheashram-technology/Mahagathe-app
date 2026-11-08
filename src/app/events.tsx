import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { AppText, BackPill, Screen } from '@/components/ui';
import { useEvents, type EventItem } from '@/data';
import { istDate } from '@/features/sangha/format';
import { useEventToggle } from '@/features/sangha/useEventToggle';
import { Meta, SectionHeading, VillageEventRow, village } from '@/features/sangha/village';
import { colors, fonts } from '@/theme/tokens';

/** The full calendar (G-03): upcoming gatherings grouped by month, in the village's calm list style. */
export default function EventsScreen() {
  const router = useRouter();
  const events = useEvents();
  const { toggle, busyId } = useEventToggle();

  const months = useMemo(() => {
    const groups: { key: string; label: string; items: EventItem[] }[] = [];
    for (const e of events ?? []) {
      const p = istDate(e.startsAt);
      let g = groups.find((x) => x.key === p.monthKey);
      if (!g) groups.push((g = { key: p.monthKey, label: `${p.monthLong} ${p.year}`, items: [] }));
      g.items.push(e);
    }
    return groups;
  }, [events]);

  return (
    <Screen background={colors.limewash} contentStyle={{ paddingTop: 2, paddingBottom: 36 }}>
      <View style={{ paddingHorizontal: 16 }}>
        <BackPill destination="Sangha" onPress={() => router.dismissTo('/(tabs)/sangha')} />
      </View>
      <View style={{ paddingTop: 16, paddingHorizontal: 24 }}>
        <AppText accessibilityRole="header" style={{ fontFamily: fonts.displaySemibold, fontSize: 33, lineHeight: 51, color: village.ink }}>
          Calendar
        </AppText>
        <AppText style={{ fontFamily: fonts.ui, fontSize: 15, lineHeight: 23.25, color: village.text2 }}>
          Gatherings of the sangha. Register to keep your place. Times are in IST.
        </AppText>
      </View>

      <View style={{ paddingTop: 12, paddingHorizontal: 24 }}>
        {events === undefined ? (
          <Meta accessibilityLiveRegion="polite">Loading events…</Meta>
        ) : months.length === 0 ? (
          <View style={{ marginTop: 12, padding: 20, borderRadius: 16, backgroundColor: village.soft, gap: 2 }}>
            <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 21, lineHeight: 32.55, color: village.ink }}>No upcoming events</AppText>
            <Meta>New dates will appear here when they are announced.</Meta>
          </View>
        ) : (
          months.map((m) => (
            <View key={m.key} style={{ paddingTop: 22 }}>
              <SectionHeading>{m.label}</SectionHeading>
              {m.items.map((e, i) => (
                <VillageEventRow
                  key={e.id}
                  event={e}
                  first={i === 0}
                  showPlaces
                  busy={busyId === e.id}
                  onToggle={() => toggle(e)}
                />
              ))}
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

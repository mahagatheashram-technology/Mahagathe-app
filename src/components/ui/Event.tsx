import { Image, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { Card } from './surfaces';
import { photos, type EventItem } from '@/data';
import { colors, fonts, radii } from '@/theme/tokens';

/**
 * Event UI from SanghaV3: the date-block list row and the featured photo card.
 * Shared by Sangha, the events calendar, vibhaga hubs and Home.
 * Events are displayed in IST (the Trust's timezone), regardless of device zone.
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function eventDateParts(iso: string) {
  const d = new Date(new Date(iso).getTime() + IST_OFFSET_MS);
  const month = d.getUTCMonth();
  return {
    mon: MONTHS[month],
    day: String(d.getUTCDate()).padStart(2, '0'),
    monthName: MONTH_NAMES[month],
    year: d.getUTCFullYear(),
    monthKey: `${d.getUTCFullYear()}-${String(month + 1).padStart(2, '0')}`,
  };
}

export function placesLabel(n: number | null) {
  if (n === null) return null;
  if (n === 0) return 'Full';
  return `${n} ${n === 1 ? 'place' : 'places'} left`;
}

type ToggleProps = {
  event: EventItem;
  onToggle: () => void;
  /** A registration change is in flight. */
  busy?: boolean;
};

/** Register (outline) ↔ Going (sand + check). `size` follows the mock: row = 40 high, card = 50 high full width. */
function RegisterControl({ event, onToggle, busy, wide }: ToggleProps & { wide?: boolean }) {
  const full = !event.registered && event.placesLeft === 0;
  const common = {
    accessibilityRole: 'button' as const,
    disabled: busy || full,
    onPress: onToggle,
    style: ({ pressed }: { pressed: boolean }) => [
      styles.btnBase,
      wide ? styles.btnWide : styles.btnRow,
      event.registered
        ? { backgroundColor: colors.sand }
        : wide
          ? { backgroundColor: colors.actionRed }
          : { borderWidth: 1.5, borderColor: colors.actionRed },
      (pressed || busy) && { opacity: 0.7 },
      full && { opacity: 0.5 },
    ],
  };
  if (event.registered) {
    return (
      <Pressable
        {...common}
        accessibilityLabel={`Going to ${event.title}. Double tap to cancel your registration`}
        accessibilityState={{ selected: true, busy: !!busy }}>
        <Icon name="check" size={14} color={colors.ink} strokeWidth={2.6} />
        <AppText style={[styles.btnText, { color: colors.ink, fontSize: wide ? 15 : 13 }]}>Going</AppText>
      </Pressable>
    );
  }
  return (
    <Pressable
      {...common}
      accessibilityLabel={full ? `${event.title} is full` : `Register for ${event.title}`}
      accessibilityState={{ disabled: full, busy: !!busy }}>
      <AppText style={[styles.btnText, { color: wide ? colors.white : colors.actionRed, fontSize: wide ? 15 : 13 }]}>
        {full ? 'Full' : 'Register'}
      </AppText>
    </Pressable>
  );
}

/** Featured event: photo with date badge, title, meta, full-width Register/Going button. */
export function EventCard({ event, onToggle, busy }: ToggleProps) {
  const p = eventDateParts(event.startsAt);
  const places = placesLabel(event.placesLeft);
  return (
    <Card style={{ overflow: 'hidden' }}>
      <View style={{ height: 170 }}>
        {event.imageKey ? (
          <Image source={photos[event.imageKey]} accessibilityIgnoresInvertColors style={{ width: '100%', height: 170 }} resizeMode="cover" />
        ) : (
          <View style={{ height: 170, backgroundColor: colors.sand }} />
        )}
        <View style={styles.badge} accessibilityLabel={`${p.day} ${p.monthName}`}>
          <AppText style={styles.badgeMon}>{p.mon}</AppText>
          <AppText style={styles.badgeDay}>{p.day.replace(/^0/, '')}</AppText>
        </View>
      </View>
      <View style={{ gap: 12, padding: 16 }}>
        <View>
          <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 21, lineHeight: 27 }}>{event.title}</AppText>
          <AppText variant="meta" style={{ marginTop: 2 }}>
            {event.place} · {event.timeLabel} · {event.eligibility}
          </AppText>
          {places ? <AppText variant="meta">{places}</AppText> : null}
        </View>
        <RegisterControl event={event} onToggle={onToggle} busy={busy} wide />
      </View>
    </Card>
  );
}

/** One date-block row. Put several inside <EventList> (it draws the hairlines between rows). */
export function EventRow({
  event,
  onToggle,
  busy,
  showPlaces,
  last,
}: ToggleProps & { showPlaces?: boolean; last?: boolean }) {
  const p = eventDateParts(event.startsAt);
  const places = showPlaces ? placesLabel(event.placesLeft) : null;
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: colors.sand }]}>
      <View style={{ width: 44, alignItems: 'center' }} accessibilityLabel={`${p.day} ${p.monthName}`}>
        <AppText style={styles.rowMon}>{p.mon}</AppText>
        <AppText style={styles.rowDay}>{p.day}</AppText>
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21 }}>{event.title}</AppText>
        {showPlaces ? (
          <>
            <AppText variant="caption">
              {event.place} · {event.timeLabel}
            </AppText>
            <AppText variant="caption">
              {event.eligibility}
              {places ? ` · ${places}` : ''}
            </AppText>
          </>
        ) : (
          <AppText variant="caption">
            {event.place} · {event.eligibility}
          </AppText>
        )}
      </View>
      <RegisterControl event={event} onToggle={onToggle} busy={busy} />
    </View>
  );
}

/** White card, 18-radius container for a stack of <EventRow>s. */
export function EventList({ children }: { children: React.ReactNode }) {
  return (
    <Card radius={radii.xl + 2} style={{ overflow: 'hidden' }}>
      {children}
    </Card>
  );
}

const styles = StyleSheet.create({
  btnBase: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radii.pill },
  btnRow: { height: 40, paddingHorizontal: 14, gap: 4, minWidth: 44 },
  btnWide: { height: 50, gap: 6 },
  btnText: { fontFamily: fonts.sansSemibold },
  badge: {
    position: 'absolute',
    left: 14,
    top: 14,
    width: 56,
    paddingVertical: 6,
    borderRadius: radii.md,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  badgeMon: { fontFamily: fonts.sansSemibold, fontSize: 11, lineHeight: 16, letterSpacing: 0.88, color: colors.actionRed },
  badgeDay: { fontFamily: fonts.serifSemibold, fontSize: 24, lineHeight: 26.4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  rowMon: { fontFamily: fonts.sansSemibold, fontSize: 11, lineHeight: 16, letterSpacing: 0.88, color: colors.actionRed },
  rowDay: { fontFamily: fonts.serifSemibold, fontSize: 22, lineHeight: 24.2 },
});

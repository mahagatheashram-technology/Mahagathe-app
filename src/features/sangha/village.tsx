import { Pressable, View, type TextProps, type ViewProps } from 'react-native';

import { AppText, Icon, OutlineButton, PrimaryButton } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';
import type { EventItem } from '@/data';
import { eventMeta, istDate, placesText } from './format';

/** Shared pieces of the village language: laterite on limewash, Eczar titles, Mukta UI. */

export const village = {
  ink: colors.v14Ink,
  text2: colors.text2,
  laterite: colors.laterite,
  soft: colors.lateriteSoft,
  line: colors.line,
} as const;

/** Eczar section heading (21 / 600). */
export function SectionHeading({ children, style }: { children: string; style?: object }) {
  return (
    <AppText
      accessibilityRole="header"
      style={[{ fontFamily: fonts.displaySemibold, fontSize: 21, lineHeight: 32.55, color: village.ink }, style]}>
      {children}
    </AppText>
  );
}

/** Mukta 14 secondary line; 24.8 line height as drawn in the mocks. */
export function Meta({ children, style, ...rest }: TextProps) {
  return <AppText {...rest} style={[{ fontFamily: fonts.ui, fontSize: 14, lineHeight: 24.8, color: village.text2 }, style]}>{children}</AppText>;
}

/** Laterite weekday over an Eczar day number. */
export function DateStack({ iso, daySize = 24, width = 52 }: { iso: string; daySize?: number; width?: number }) {
  const d = istDate(iso);
  return (
    <View accessible accessibilityLabel={`${d.weekday} ${d.day} ${d.monthLong}`} style={{ width, alignItems: 'center' }}>
      <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 13, lineHeight: 14.3, color: village.laterite }}>{d.weekdayShort}</AppText>
      <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: daySize, lineHeight: daySize * 1.1, color: village.laterite }}>{d.day}</AppText>
    </View>
  );
}

/** Register ↔ Going, in laterite. ≥44pt high. */
export function RegisterButton({
  event,
  onToggle,
  busy,
  wide,
  label,
}: {
  event: EventItem;
  onToggle: () => void;
  busy?: boolean;
  wide?: boolean;
  /** Wide primary label, e.g. "Register for Abhyudaya". */
  label?: string;
}) {
  const full = !event.registered && event.placesLeft === 0;
  const stretch = { alignSelf: wide ? ('stretch' as const) : ('center' as const) };
  if (event.registered) {
    return (
      <OutlineButton
        label="Going"
        color={village.laterite}
        loading={busy}
        onPress={onToggle}
        accessibilityLabel={`Going to ${event.title}. Double tap to cancel your registration`}
        accessibilityState={{ selected: true }}
        icon={<Icon name="check" size={16} color={village.laterite} strokeWidth={2.6} />}
        style={[{ backgroundColor: village.soft, borderColor: village.soft }, wide ? { minHeight: 54 } : null, stretch]}
      />
    );
  }
  if (wide) {
    return (
      <PrimaryButton
        label={full ? 'Full' : (label ?? 'Register')}
        disabled={full}
        loading={busy}
        onPress={onToggle}
        accessibilityLabel={full ? `${event.title} is full` : `Register for ${event.title}`}
      />
    );
  }
  return (
    <OutlineButton
      label={full ? 'Full' : 'Register'}
      color={village.laterite}
      disabled={full}
      loading={busy}
      onPress={onToggle}
      accessibilityLabel={full ? `${event.title} is full` : `Register for ${event.title}`}
      style={stretch}
    />
  );
}

/** Calendar row: date stack, title and meta, optional Register control. Hairline above unless `first`. */
export function VillageEventRow({
  event,
  first,
  onPress,
  onToggle,
  busy,
  showPlaces,
}: {
  event: EventItem;
  first?: boolean;
  onPress?: () => void;
  onToggle?: () => void;
  busy?: boolean;
  showPlaces?: boolean;
}) {
  const places = showPlaces ? placesText(event.placesLeft) : null;
  const body = (
    <>
      <DateStack iso={event.startsAt} />
      <View style={{ flex: 1 }}>
        <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: village.ink }}>{event.title}</AppText>
        <Meta>
          {eventMeta(event, !onToggle)}
          {places ? `. ${places}` : ''}
        </Meta>
      </View>
    </>
  );
  const rowStyle = { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12, minHeight: 44 } as const;
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'center', gap: 12 },
        first ? null : { borderTopWidth: 1, borderTopColor: village.line },
      ]}>
      {onPress ? (
        <Pressable accessibilityRole="link" accessibilityLabel={`${event.title}, ${istDate(event.startsAt).weekday} ${istDate(event.startsAt).day} ${istDate(event.startsAt).monthLong}`} onPress={onPress} style={[rowStyle, { flex: 1 }]}>
          {body}
        </Pressable>
      ) : (
        <View style={[rowStyle, { flex: 1 }]}>{body}</View>
      )}
      {onToggle ? <RegisterButton event={event} onToggle={onToggle} busy={busy} /> : null}
    </View>
  );
}

/** Row with Devanagari title on the left, name and line in the middle, chevron. */
export function ProgramRow({
  titleDev,
  name,
  line,
  onPress,
  last,
}: {
  titleDev: string;
  name: string;
  line: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${name}. ${line}`}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        minHeight: 44,
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: village.line,
      }}>
      <AppText style={{ fontFamily: fonts.display, fontSize: 20, lineHeight: 31, width: 84, color: village.laterite }}>{titleDev}</AppText>
      <View style={{ flex: 1 }}>
        <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: village.ink }}>{name}</AppText>
        <Meta>{line}</Meta>
      </View>
      <Icon name="chevronRight" size={20} color={village.text2} strokeWidth={2} />
    </Pressable>
  );
}

export function Divider(props: ViewProps) {
  return <View {...props} style={[{ height: 1, backgroundColor: village.line }, props.style]} />;
}

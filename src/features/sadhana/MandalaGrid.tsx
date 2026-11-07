import { StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import type { MandalaDayState } from '@/data';
import { colors, fonts } from '@/theme/tokens';

/** The 40-day grid from MandalaV3: 8 columns × 5 rows, 7pt gaps, square cells with 10pt radius. */
export function MandalaGrid({ days, currentDay }: { days: MandalaDayState[]; currentDay: number }) {
  const rows = Array.from({ length: 5 }, (_, r) => days.slice(r * 8, r * 8 + 8));
  const sat = days.filter((d) => d === 'sat').length;
  const ahead = days.filter((d) => d === 'future').length;
  return (
    <View
      style={{ gap: 7 }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${sat} days sat, today is day ${currentDay}, ${ahead} days ahead`}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 7 }}>
          {row.map((state, c) => {
            const day = r * 8 + c + 1;
            return (
              <View key={day} style={styles.slot}>
                <View style={[styles.cell, cellStyle[state]]}>
                  {state === 'sat' ? (
                    <Icon name="check" size={15} strokeWidth={3} color={colors.white} />
                  ) : (
                    <AppText
                      style={[
                        styles.num,
                        state === 'today' && { fontFamily: fonts.sansSemibold, fontSize: 13, color: colors.actionRed },
                      ]}>
                      {day}
                    </AppText>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function MandalaLegend() {
  const items = [
    { label: 'Sat', style: cellStyle.sat },
    { label: 'Missed', style: cellStyle.missed },
    { label: 'Today', style: cellStyle.today },
  ];
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
      {items.map((i) => (
        <View key={i.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={[{ width: 12, height: 12, borderRadius: 4 }, i.style, i.label === 'Today' && { borderWidth: 2 }]} />
          <AppText variant="caption" style={{ lineHeight: 17.5 }}>{i.label}</AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // Border thickness belongs to the inner square, so Today cannot widen a grid column.
  slot: { flex: 1, minWidth: 0, aspectRatio: 1 },
  cell: { flex: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  num: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18, color: colors.muted },
});
const cellStyle = StyleSheet.create({
  sat: { backgroundColor: colors.actionRed },
  missed: { backgroundColor: colors.border },
  today: { borderWidth: 2.5, borderColor: colors.actionRed },
  future: { borderWidth: 1, borderColor: colors.border },
});

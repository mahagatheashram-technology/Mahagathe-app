import { StyleSheet, View } from 'react-native';

import type { MandalaDayState } from '@/data';
import { colors } from '@/theme/tokens';

/** The 40-day strip in the Sādhanā summary card: two rows of 20 mini cells, 10pt tall, 4pt gaps. */
export function MandalaStrip({ days }: { days: MandalaDayState[] }) {
  const rows = [days.slice(0, 20), days.slice(20, 40)];
  return (
    <View style={{ gap: 4 }}>
      {rows.map((row, r) => (
        <View key={r} style={{ flexDirection: 'row', gap: 4 }}>
          {row.map((d, i) => (
            <View key={i} style={[styles.cell, cellStyle[d]]} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ cell: { flex: 1, minWidth: 0, height: 10, borderRadius: 3 } });
const cellStyle = StyleSheet.create({
  sat: { backgroundColor: colors.actionRed },
  missed: { backgroundColor: colors.border },
  today: { borderWidth: 2, borderColor: colors.actionRed },
  future: { borderWidth: 1, borderColor: colors.border },
});

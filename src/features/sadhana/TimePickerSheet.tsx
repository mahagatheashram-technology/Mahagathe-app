import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, BottomSheet, Button } from '@/components/ui';
import { colors, fonts, radii } from '@/theme/tokens';

/**
 * Reminder time picker: three tap-or-scroll columns (hour · minute · AM/PM), one look on every platform.
 * (`@react-native-community/datetimepicker` is native-only and renders a different dialog per OS; this keeps the
 * calm v3 style and is verifiable on web.) Value is "HH:mm" 24h, matching `Profile.reminderTime`.
 */
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const ROW = 44;
const VISIBLE = 5;
const LABEL_H = 18;

function parse(value: string | null) {
  const [h, m] = (value ?? '06:00').split(':').map(Number);
  const rounded = Math.min(55, Math.round(m / 5) * 5);
  return { hour12: h % 12 === 0 ? 12 : h % 12, minute: rounded, pm: h >= 12 };
}

export function TimePickerSheet({
  visible,
  value,
  onClose,
  onSave,
}: {
  visible: boolean;
  value: string | null;
  onClose: () => void;
  onSave: (time: string) => Promise<void> | void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Daily reminder">
      {/* Body mounts fresh each time the sheet opens, so it seeds from the saved value. */}
      <PickerBody value={value} onClose={onClose} onSave={onSave} />
    </BottomSheet>
  );
}

function PickerBody({
  value,
  onClose,
  onSave,
}: {
  value: string | null;
  onClose: () => void;
  onSave: (time: string) => Promise<void> | void;
}) {
  const [initial] = useState(() => parse(value));
  const [hour12, setHour] = useState(initial.hour12);
  const [minute, setMinute] = useState(initial.minute);
  const [pm, setPm] = useState(initial.pm);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const h24 = (hour12 % 12) + (pm ? 12 : 0);
    setSaving(true);
    try {
      await onSave(`${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <View style={styles.cols}>
        <Column
          label="Hour"
          items={HOURS.map((h) => ({ key: h, text: String(h) }))}
          selected={hour12}
          onSelect={setHour}
        />
        <Column
          label="Minute"
          items={MINUTES.map((m) => ({ key: m, text: String(m).padStart(2, '0') }))}
          selected={minute}
          onSelect={setMinute}
        />
        <View style={{ flex: 1 }}>
          <View style={{ height: LABEL_H + 6 }} />
          {(['AM', 'PM'] as const).map((s) => {
            const on = (s === 'PM') === pm;
            return (
              <Pressable
                key={s}
                accessibilityRole="button"
                accessibilityLabel={s}
                aria-selected={on}
                onPress={() => setPm(s === 'PM')}
                style={[styles.item, on && styles.itemOn]}>
                <AppText style={[styles.itemText, on && styles.itemTextOn]}>{s}</AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Button label="Save reminder" onPress={save} loading={saving} />
    </>
  );
}

function Column({
  label,
  items,
  selected,
  onSelect,
}: {
  label: string;
  items: { key: number; text: string }[];
  selected: number;
  onSelect: (k: number) => void;
}) {
  const scroller = useRef<{ scrollTo: (o: { y: number; animated: boolean }) => void } | null>(null);
  useEffect(() => {
    const idx = Math.max(0, items.findIndex((i) => i.key === selected));
    const t = setTimeout(() => scroller.current?.scrollTo({ y: idx * ROW - ROW * 2, animated: false }), 30);
    return () => clearTimeout(t);
    // Scroll to the saved value once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <AppText variant="overline" style={{ fontSize: 11, lineHeight: LABEL_H, textAlign: 'center', marginBottom: 6 }}>
        {label}
      </AppText>
      <ScrollView
        ref={(r) => {
          scroller.current = r;
        }}
        style={{ height: ROW * VISIBLE }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {items.map((it) => {
          const on = it.key === selected;
          return (
            <Pressable
              key={it.key}
              accessibilityRole="button"
              accessibilityLabel={`${label} ${it.text}`}
              aria-selected={on}
              onPress={() => onSelect(it.key)}
              style={[styles.item, on && styles.itemOn]}>
              <AppText style={[styles.itemText, on && styles.itemTextOn]}>{it.text}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  cols: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  item: { height: ROW, alignItems: 'center', justifyContent: 'center', borderRadius: radii.md },
  itemOn: { backgroundColor: colors.sand },
  itemText: { fontFamily: fonts.sansMedium, fontSize: 18, color: colors.muted },
  itemTextOn: { fontFamily: fonts.sansSemibold, color: colors.actionRed },
});

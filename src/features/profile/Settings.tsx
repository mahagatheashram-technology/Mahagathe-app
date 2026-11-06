import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';

/** Section label + white bordered card of rows, exactly as drawn in ProfileV3. */
export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <AppText variant="overline" style={{ fontSize: 12, lineHeight: 18, letterSpacing: 1.44, marginBottom: 4, marginLeft: 4 }} accessibilityRole="header">
        {title}
      </AppText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export function SettingsRow({
  label,
  value,
  strongValue,
  danger,
  last,
  right,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  value?: string;
  /** Time-style value: Poppins 600 15 ink (otherwise 500 14 muted). */
  strongValue?: boolean;
  danger?: boolean;
  last?: boolean;
  right?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const content = (
    <>
      <AppText
        style={{
          flex: 1,
          fontFamily: danger ? fonts.sansSemibold : fonts.sansMedium,
          fontSize: 15,
          lineHeight: 22,
          color: danger ? colors.actionRed : colors.ink,
        }}>
        {label}
      </AppText>
      {value ? (
        <AppText
          style={
            strongValue
              ? { fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 22 }
              : { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 21, color: colors.muted }
          }
          numberOfLines={1}>
          {value}
        </AppText>
      ) : null}
      {right}
    </>
  );
  const rowStyle = [styles.row, !last && styles.divider, !last && { minHeight: 55 }];
  if (!onPress) return <View style={rowStyle}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (value ? `${label}, ${value}` : label)}
      onPress={onPress}
      style={({ pressed }) => [rowStyle, pressed && { backgroundColor: colors.cream }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 18, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54, paddingHorizontal: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.sand },
});

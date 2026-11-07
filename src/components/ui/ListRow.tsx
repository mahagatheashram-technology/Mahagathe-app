import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { colors, fonts } from '@/theme/tokens';

export type ListRowProps = {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress: () => void;
  last?: boolean;
};

/** Quiet secondary destination shared by the v12 browsing and detail screens. */
export function ListRow({ icon, title, subtitle, onPress, last }: ListRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      onPress={onPress}
      style={({ pressed }) => [styles.row, !last && styles.divider, pressed && { opacity: 0.7 }]}>
      <View style={styles.circle}>
        <Icon name={icon} size={19} color={colors.label} strokeWidth={1.8} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23 }}>{title}</AppText>
        {subtitle ? (
          <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 20, color: colors.textSecondary }}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <Icon name="chevronRight" size={18} color={colors.chevron} strokeWidth={2.2} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: { minHeight: 84, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 14 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.iconSand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

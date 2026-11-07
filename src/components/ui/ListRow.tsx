import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { fonts } from '@/theme/tokens';
import { v12 } from '@/theme/v12';

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
        <Icon name={icon} size={19} color={v12.label} strokeWidth={1.8} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 16, lineHeight: 24 }}>{title}</AppText>
        {subtitle ? (
          <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 21, color: v12.muted }}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <Icon name="chevronRight" size={18} color={v12.chevron} strokeWidth={2.2} />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  row: { minHeight: 64, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 14 },
  divider: { borderBottomWidth: 1, borderBottomColor: v12.divider },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: v12.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

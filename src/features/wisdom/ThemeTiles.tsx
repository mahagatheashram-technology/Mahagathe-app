import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon, type IconName } from '@/components/ui';
import type { ThemeSummary, VakyamTheme } from '@/data';
import { colors, fonts } from '@/theme/tokens';

const THEME_ICONS: Record<VakyamTheme, IconName> = {
  'inner-life': 'drop',
  work: 'briefcase',
  family: 'homeHeart',
  conduct: 'scales',
};

/** "Guru Vākyams by theme": 2×2 neutral tiles. */
export function ThemeTiles({ themes }: { themes: ThemeSummary[] }) {
  const router = useRouter();
  const rows: ThemeSummary[][] = [];
  for (let i = 0; i < themes.length; i += 2) rows.push(themes.slice(i, i + 2));
  return (
    <View style={{ gap: 10 }}>
      {rows.map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
          {row.map((t) => (
            <Pressable
              key={t.theme}
              accessibilityRole="link"
              accessibilityLabel={`${t.label}, ${t.count} vākyams`}
              onPress={() => router.push(`/wisdom-theme/${t.theme}`)}
              style={({ pressed }) => [styles.tile, pressed && { opacity: 0.85 }]}>
              <View style={styles.iconTile}>
                <Icon name={THEME_ICONS[t.theme]} size={20} color={colors.actionRed} />
              </View>
              <View style={{ flexShrink: 1 }}>
                <AppText style={styles.label}>{t.label}</AppText>
                <AppText style={styles.count}>{t.count} vākyams</AppText>
              </View>
            </Pressable>
          ))}
          {row.length === 1 ? <View style={{ flex: 1 }} /> : null}
        </View>
      ))}
    </View>
  );
}

export const tileStyles = StyleSheet.create({
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconTile: tileStyles.iconTile,
  label: { fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 22 },
  count: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18, color: colors.muted },
});

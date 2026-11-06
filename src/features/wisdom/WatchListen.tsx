import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { tileStyles } from './ThemeTiles';
import { AppText, Icon, type IconName } from '@/components/ui';
import { externalLinks } from '@/data';
import { colors, fonts } from '@/theme/tokens';

const ITEMS: { key: string; title: string; sub: string; icon: IconName; url: string }[] = [
  { key: 'youtube', title: 'YouTube', sub: 'Talks and answers', icon: 'video', url: externalLinks.youtube },
  { key: 'podcast', title: 'Dharma Speaks', sub: 'Weekly podcast', icon: 'mic', url: externalLinks.podcast },
];

/** W-13: links out of the app. */
export function WatchListen() {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {ITEMS.map((it) => (
        <Pressable
          key={it.key}
          accessibilityRole="link"
          accessibilityLabel={`${it.title}, ${it.sub}. Opens outside the app`}
          onPress={() => Linking.openURL(it.url).catch(() => {})}
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
          <View style={styles.top}>
            <View style={tileStyles.iconTile}>
              <Icon name={it.icon} size={18} color={colors.actionRed} />
            </View>
            <Icon name="externalLink" size={16} color={colors.muted} />
          </View>
          <View>
            <AppText style={styles.title}>{it.title}</AppText>
            <AppText style={styles.sub}>{it.sub}</AppText>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 10,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 22 },
  sub: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18, color: colors.muted },
});

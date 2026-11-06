import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { VakyamListCard } from './VakyamListCard';
import { AppText, Card, Icon } from '@/components/ui';
import { useWisdomSearch } from '@/data';
import { colors, fonts } from '@/theme/tokens';

/** W-14 results: Vākyams then episodes, or a calm empty state. */
export function SearchResults({ query }: { query: string }) {
  const router = useRouter();
  const results = useWisdomSearch(query);

  if (results === undefined) {
    return (
      <AppText variant="meta" style={{ paddingHorizontal: 20, paddingVertical: 24 }}>
        Searching…
      </AppText>
    );
  }
  const total = results.vakyams.length + results.episodes.length;
  if (total === 0) {
    return (
      <View style={styles.empty} accessibilityLiveRegion="polite">
        <View style={styles.emptyIcon}>
          <Icon name="search" size={22} color={colors.muted} />
        </View>
        <AppText style={styles.emptyTitle}>Nothing found for “{query.trim()}”</AppText>
        <AppText variant="meta" style={{ textAlign: 'center' }}>
          Try another word. Spelling without accents works too, like “vakyam” or “adi”.
        </AppText>
      </View>
    );
  }
  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite">
      {results.vakyams.length > 0 ? (
        <View style={{ gap: 10 }}>
          <AppText variant="overline">Guru Vākyams</AppText>
          {results.vakyams.map((v) => (
            <VakyamListCard key={v.id} vakyam={v} showTheme />
          ))}
        </View>
      ) : null}
      {results.episodes.length > 0 ? (
        <View style={{ gap: 10 }}>
          <AppText variant="overline">Mahabharata episodes</AppText>
          {results.episodes.map((e) => (
            <Pressable
              key={e.id}
              accessibilityRole="link"
              accessibilityLabel={`${e.seasonTitle}, episode ${e.number}: ${e.title}`}
              onPress={() => router.push(`/episode/${e.id}`)}
              style={({ pressed }) => pressed && { opacity: 0.85 }}>
              <Card radius={16} style={styles.episode}>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText style={styles.epMeta}>
                    {e.seasonTitle} · Episode {e.number}
                  </AppText>
                  <AppText style={styles.epTitle}>{e.title}</AppText>
                  <AppText style={styles.epMeta}>{e.readMinutes} min read</AppText>
                </View>
                <Icon name="chevronRight" size={18} color={colors.muted} strokeWidth={2.2} />
              </Card>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 28, gap: 24 },
  empty: { paddingHorizontal: 32, paddingTop: 48, paddingBottom: 48, alignItems: 'center', gap: 10 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontFamily: fonts.serifSemibold, fontSize: 18, lineHeight: 24, textAlign: 'center', color: colors.ink },
  episode: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  epMeta: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18, color: colors.muted },
  epTitle: { fontFamily: fonts.serifSemibold, fontSize: 18, lineHeight: 24, color: colors.ink },
});

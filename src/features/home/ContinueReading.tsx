import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, SandBand, SeasonCover as SharedSeasonCover } from '@/components/ui';
import type { ReadingProgress } from '@/data';
import { colors } from '@/theme/tokens';
import { Skeleton } from './Skeleton';

/** Maroon season cover: Devanagari title + gold "PARVA I", inset gold hairline. */
export function SeasonCover({ devanagari, roman }: { devanagari: string; roman: string }) {
  return <SharedSeasonCover number={1} roman={roman} devanagari={devanagari} name="" variant="resume" />;
}

/** H-07: resume card. Hidden when nothing is unfinished (`null`). */
export function ContinueReading({ reading }: { reading: ReadingProgress | null | undefined }) {
  const router = useRouter();
  if (reading === null) return null;
  return (
    <SandBand style={{ paddingVertical: 26, paddingHorizontal: 20, gap: 14 }} accessibilityLabel="Continue reading">
      <AppText variant="section" accessibilityRole="header" style={{ lineHeight: 27 }}>
        Continue reading
      </AppText>
      {reading === undefined ? (
        <View style={[styles.card, { height: 136 }]}>
          <Skeleton width={78} height={108} radius={10} />
          <View style={{ flex: 1, gap: 10, justifyContent: 'center' }}>
            <Skeleton width="60%" height={14} />
            <Skeleton height={22} />
            <Skeleton width="80%" height={8} />
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Continue reading ${reading.episode.title}, ${reading.minutesLeft} minutes left`}
          onPress={() => router.push(`/episode/${reading.episode.id}`)}
          style={styles.card}>
          <SeasonCover devanagari={reading.episode.seasonDevanagari} roman={reading.episode.seasonRoman} />
          <View style={{ flex: 1, minWidth: 0, justifyContent: 'center', gap: 6 }}>
            <AppText variant="caption" style={{ lineHeight: 17.5 }}>
              Mahabharata · {reading.episode.seasonTitle} · E{reading.episode.number}
            </AppText>
            <AppText variant="cardTitle" style={{ lineHeight: 23 }}>
              {reading.episode.title}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${Math.round(reading.progress * 100)}%` }]} />
              </View>
              <AppText variant="caption" style={{ lineHeight: 17.5 }}>
                {reading.minutesLeft} min left
              </AppText>
            </View>
          </View>
        </Pressable>
      )}
    </SandBand>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 16, alignItems: 'stretch', padding: 14, borderRadius: 20, backgroundColor: colors.white },
  track: { flex: 1, height: 5, borderRadius: 5, backgroundColor: colors.sand },
  fill: { height: 5, borderRadius: 5, backgroundColor: colors.actionRed },
});

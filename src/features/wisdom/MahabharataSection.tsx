import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Icon, SandBand, SeasonCover } from '@/components/ui';
import { useContinueReading, useSeasonEpisodes, useSeasons } from '@/data';
import { colors, fonts } from '@/theme/tokens';

/** Mahabharata block on the sand band: lead season card (resume or start) + "Next seasons" row. */
export function MahabharataSection() {
  const router = useRouter();
  const seasons = useSeasons();
  const resume = useContinueReading();
  const lead = seasons?.find((s) => s.status === 'published');
  const coming = seasons?.filter((s) => s.status === 'coming') ?? [];
  const leadEpisodes = useSeasonEpisodes(lead?.id ?? '');
  const firstEpisodeId = leadEpisodes?.slice().sort((a, b) => a.number - b.number)[0]?.id ?? null;

  const resumeHere = resume && lead && resume.episode.seasonId === lead.id ? resume : null;
  const ctaLabel = resumeHere ? `Continue E${resumeHere.episode.number}` : 'Start E1';
  const target = resumeHere ? resumeHere.episode.id : firstEpisodeId;

  return (
    <SandBand style={styles.band} accessibilityLabel="Mahabharata">
      <View style={{ gap: 2, paddingRight: 20 }}>
        <AppText accessibilityRole="header" style={styles.h2}>
          Mahabharata
        </AppText>
        <AppText style={styles.sub}>Retold by Mahagathe from the BORI critical edition</AppText>
      </View>

      {lead && target ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${lead.title}. Season ${lead.number}, ${lead.episodeCount} episodes. ${ctaLabel}`}
          onPress={() => router.push(`/episode/${target}`)}
          style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}>
          <SeasonCover number={lead.number} roman={lead.roman} devanagari={lead.devanagari} name={lead.name} />
          <View style={styles.cardBody}>
            <View style={{ gap: 4 }}>
              <AppText style={styles.cardMeta}>
                Season {lead.number} · {lead.episodeCount} episodes
              </AppText>
              <AppText style={styles.cardTitle}>{lead.title}</AppText>
              <AppText style={styles.blurb}>{lead.blurb}</AppText>
            </View>
            <View style={styles.cta}>
              <Icon name="play" size={13} color={colors.white} />
              <AppText style={styles.ctaLabel}>{ctaLabel}</AppText>
            </View>
          </View>
        </Pressable>
      ) : null}

      {coming.length > 0 ? (
        <View style={{ gap: 10 }}>
          <AppText style={styles.nextLabel}>Next seasons</AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingRight: 20 }}>
            {coming.map((s) => (
              <SeasonCover
                key={s.id}
                variant="small"
                number={s.number}
                roman={s.roman}
                devanagari={s.devanagari}
                name={s.name}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </SandBand>
  );
}

const styles = StyleSheet.create({
  band: { paddingTop: 28, paddingBottom: 28, paddingLeft: 20, gap: 16 },
  h2: { fontFamily: fonts.serifSemibold, fontSize: 24, lineHeight: 30.5, color: colors.ink },
  sub: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 19.5, color: colors.muted },
  card: {
    flexDirection: 'row',
    gap: 16,
    marginRight: 20,
    padding: 14,
    borderRadius: 22,
    backgroundColor: colors.white,
  },
  cardBody: { flex: 1, minWidth: 0, justifyContent: 'space-between', gap: 10 },
  cardMeta: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 17.5, color: colors.muted },
  cardTitle: { fontFamily: fonts.serifSemibold, fontSize: 21, lineHeight: 25.2, color: colors.ink },
  blurb: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 19.5, color: colors.muted },
  cta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.actionRed,
  },
  ctaLabel: { fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 19.5, color: colors.white },
  nextLabel: { fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 19.5, color: colors.ink },
});

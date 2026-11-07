import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, Icon, ListRow, Screen } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { useContinueReading, useSeasonEpisodes, useSeasons, useTodayVakyam } from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { TodayVakyamCard } from './TodayVakyamCard';

export function WisdomScreen() {
  const router = useRouter();
  const insets = useScreenInsets();
  const today = useTodayVakyam();
  const resume = useContinueReading();
  const seasons = useSeasons();
  const season = seasons?.find((s) => s.status === 'published');
  const episodes = useSeasonEpisodes(season?.id ?? '');
  const episode = resume?.episode ?? episodes?.[0];
  return (
    <Screen edgeToEdgeTop>
      <LinearGradient
        colors={[colors.headerTop, colors.cream]}
        style={{ paddingTop: insets.top + 32, paddingHorizontal: 24, paddingBottom: 24 }}>
        <AppText
          accessibilityRole="header"
          style={{ fontFamily: fonts.serifSemibold, fontSize: 32, lineHeight: 41, marginBottom: 6 }}>
          Wisdom
        </AppText>
        <AppText style={{ fontSize: 15, lineHeight: 23, color: colors.textSecondary }}>
          Today’s teaching, and the great story.
        </AppText>
      </LinearGradient>
      <View style={{ paddingHorizontal: 24, paddingBottom: 24, gap: 16 }}>
        {today === undefined ? (
          <AppText>Loading today’s teaching…</AppText>
        ) : today === null ? (
          <AppText>Today’s teaching will appear here once approved.</AppText>
        ) : (
          <TodayVakyamCard vakyam={today} />
        )}
        {episode ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`${episode.title}. ${resume ? 'Continue reading' : 'Read episode'}`}
            onPress={() => router.push(`/episode/${episode.id}`)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              padding: 16,
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              borderRadius: 22,
            }}>
            <View
              style={{ width: 58, height: 80, borderRadius: 9, backgroundColor: colors.maroon, padding: 3 }}>
              <View
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: colors.coverGoldLineMid,
                  borderRadius: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                }}>
                <AppText
                  style={{
                    fontFamily: fonts.devaSemibold,
                    fontSize: 19,
                    lineHeight: 23,
                    color: colors.coverText,
                  }}>
                  {season?.devanagari ?? 'आदि'}
                </AppText>
                <AppText
                  style={{
                    fontFamily: fonts.sansSemibold,
                    fontSize: 7,
                    lineHeight: 11,
                    letterSpacing: 1.12,
                    color: colors.gold,
                  }}>
                  PARVA {season?.roman ?? 'I'}
                </AppText>
              </View>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <AppText
                style={{ fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 21, color: colors.textSecondary }}>
                Mahabharata · episode {episode.number} of {season?.episodeCount ?? 10}
              </AppText>
              <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 18, lineHeight: 23 }}>
                {episode.title}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23 }}>
                  {resume ? 'Continue reading' : 'Begin reading'}
                </AppText>
                <Icon name="chevronRight" size={15} strokeWidth={2.4} />
              </View>
            </View>
          </Pressable>
        ) : (
          <AppText>
            {episodes === undefined
              ? 'Loading the great story…'
              : 'Episodes will appear here once published.'}
          </AppText>
        )}
        <View>
          <ListRow
            icon="grid"
            title="Past teachings"
            subtitle="By theme: inner life, work, family"
            onPress={() => router.push('/teachings')}
          />
          <ListRow
            icon="lamp"
            title="Our lineage"
            subtitle="The Paramparā"
            last
            onPress={() => router.push('/parampara')}
          />
        </View>
      </View>
    </Screen>
  );
}

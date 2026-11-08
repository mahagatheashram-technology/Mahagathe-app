import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Linking, Platform, View } from 'react-native';
import {
  Icon,
  Leaf,
  OutlineButton,
  ProgressSegments,
  SeriesCover,
  TextLink,
} from '@/components/ui';
import {
  useContinueReading,
  useExternalLinks,
  usePractices,
  useSeasonEpisodes,
  useSeasons,
  useSeries,
  useSession,
  useTodayVakyam,
  useVakyamCatalogue,
  useVakyamThemes,
} from '@/data';
import { fonts, v14Colors as c } from '@/theme/tokens';
import {
  Attribution,
  LibraryHeader,
  LibraryHeading,
  LibraryPage,
  LibraryRow,
  LibraryText,
} from './Library';
import { LineageCard } from './LineageCard';
import { SearchField } from './SearchField';
import { VakyamListCard } from './VakyamListCard';

export function WisdomScreen() {
  const router = useRouter();
  const today = useTodayVakyam();
  const resume = useContinueReading();
  const seasons = useSeasons();
  const season = seasons?.find((s) => s.status === 'published');
  const episodes = useSeasonEpisodes(season?.id ?? '');
  const episode = resume?.episode ?? episodes?.[0];
  const catalogue = useVakyamCatalogue();
  const themes = useVakyamThemes();
  const count = themes?.reduce((sum, t) => sum + t.count, 0);
  const latest = catalogue
    ?.flatMap((m) => m.vakyams)
    .filter((v) => v.id !== today?.id)
    .slice(0, 2);
  const series = useSeries();
  const links = useExternalLinks();
  const session = useSession();
  const practices = usePractices();
  const practice = practices?.find((p) => p.access === 'free');
  const [linkError, setLinkError] = useState(false);
  const sit = () =>
    router.push(
      !session.canUsePersonalFeatures
        ? session.status === 'signedIn'
          ? '/setup'
          : '/welcome'
        : practice
          ? `/player/${practice.id}`
          : '/(tabs)/practice',
    );
  const openSaptagita = async () => {
    if (!links?.saptagita) return;
    try {
      if (Platform.OS === 'web') await Linking.openURL(links.saptagitaWeb);
      else {
        try {
          await Linking.openURL(links.saptagita);
        } catch {
          await Linking.openURL(links.saptagitaWeb);
        }
      }
      setLinkError(false);
    } catch {
      setLinkError(true);
    }
  };
  return (
    <LibraryPage>
      <LibraryHeader back={false} style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
        <LibraryHeading size={33} style={{ marginHorizontal: 4, marginTop: 4, marginBottom: 14 }}>
          Wisdom
        </LibraryHeading>
        <SearchField />
        {today ? (
          <>
            <LibraryText
              style={{
                fontFamily: fonts.displayMedium,
                fontSize: 26,
                lineHeight: 33.8,
                marginHorizontal: 4,
                marginTop: 22,
              }}
            >
              “{today.text}”
            </LibraryText>
            <View style={{ marginHorizontal: 4, marginTop: 12 }}>
              <Attribution />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 18,
                marginHorizontal: 4,
                marginTop: 14,
              }}
            >
              <OutlineButton
                label="Read what it means"
                onPress={() => router.push(`/vakyam/${today.id}`)}
              />
              <TextLink label="Sit with it" onPress={sit} />
            </View>
          </>
        ) : (
          <LibraryText style={{ marginTop: 22 }}>
            {today === undefined
              ? 'Loading today’s word…'
              : 'Today’s word will appear here once approved.'}
          </LibraryText>
        )}
      </LibraryHeader>
      <View style={{ paddingTop: 26, paddingHorizontal: 16 }}>
        <LibraryHeading style={{ marginHorizontal: 8, marginBottom: 12 }}>
          {resume ? 'Continue reading' : 'Begin reading'}
        </LibraryHeading>
        {episode ? (
          <Leaf holes>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <LibraryText
                style={{
                  width: 66,
                  textAlign: 'center',
                  fontFamily: fonts.display,
                  fontSize: 30,
                  lineHeight: 30,
                  color: c.laterite,
                }}
              >
                {season?.devanagari}
              </LibraryText>
              <View style={{ flex: 1 }}>
                <LibraryText style={{ fontSize: 14, lineHeight: 21.7, color: c.darkLeaf }}>
                  The Mahabharata, {season?.title}
                </LibraryText>
                <LibraryHeading size={20} style={{ lineHeight: 25 }}>
                  {episode.title}
                </LibraryHeading>
              </View>
            </View>
            <ProgressSegments
              style={{ marginTop: 14, marginBottom: 12 }}
              done={Math.max(0, episode.number - 1)}
              current={episode.number - 1}
              total={season?.episodeCount ?? episodes?.length ?? 0}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <LibraryText style={{ fontSize: 14, color: c.darkLeaf }}>
                Episode {episode.number} of {season?.episodeCount}
              </LibraryText>
              <TextLink
                label={resume ? 'Continue' : 'Begin'}
                onPress={() => router.push(`/episode/${episode.id}`)}
                style={{ minHeight: 44, marginVertical: -10 }}
              />
            </View>
          </Leaf>
        ) : (
          <LibraryText>
            {episodes === undefined
              ? 'Loading readings…'
              : 'Readings will appear here once published.'}
          </LibraryText>
        )}
      </View>
      <View style={{ paddingTop: 32, paddingHorizontal: 24 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <LibraryHeading>Mahamuni’s words</LibraryHeading>
          <TextLink
            label={`All ${count ?? '…'} Vākyams`}
            onPress={() => router.push('/teachings')}
            style={{ minHeight: 44, marginVertical: -10 }}
          />
        </View>
        <View style={{ marginTop: 8 }}>
          {latest === undefined ? (
            <LibraryText>Loading Vākyams…</LibraryText>
          ) : latest.length === 0 ? (
            <LibraryText>New Vākyams will appear here once reviewed.</LibraryText>
          ) : (
            latest.map((v, i) => (
              <VakyamListCard key={v.id} vakyam={v} first={i === 0} save={false} quoteSize={18.5} />
            ))
          )}
        </View>
      </View>
      <View style={{ paddingTop: 34, paddingHorizontal: 24 }}>
        <LibraryHeading>Series</LibraryHeading>
        <LibraryText
          style={{
            marginTop: 2,
            marginBottom: 16,
            fontSize: 15,
            lineHeight: 23.25,
            color: c.text2,
          }}
        >
          Long readings, taken one short episode at a time.
        </LibraryText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 26 }}>
          {series === undefined ? (
            <LibraryText>Loading series…</LibraryText>
          ) : series.length === 0 ? (
            <LibraryText>Series will appear here once published.</LibraryText>
          ) : (
            series.map((s) => (
              <SeriesCover
                key={s.id}
                {...s}
                titleDevSize={s.id === 'iks' ? 23 : 27}
                active={s.status === 'reading'}
                state={
                  s.status === 'reading'
                    ? episode
                      ? `Reading, episode ${episode.number}`
                      : 'Begin reading'
                    : s.status === 'free-first'
                      ? 'Session 1 free'
                      : s.id === 'ramayana'
                        ? '7 kāṇḍas, from January'
                        : '[Series, as approved]'
                }
                onPress={() => router.push(`/series/${s.id}`)}
                style={{ width: '47.65%' }}
              />
            ))
          )}
        </View>
        <LibraryRow
          label="Saptagita. Also from Mahagathe. Opens the Saptagita app"
          onPress={openSaptagita}
          style={{
            marginTop: 26,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: c.line,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: c.actionRed,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LibraryHeading size={24} style={{ color: c.white }}>
              ७
            </LibraryHeading>
          </View>
          <View style={{ flex: 1 }}>
            <LibraryText style={{ fontSize: 14, lineHeight: 21.7, color: c.text2 }}>
              Also from Mahagathe
            </LibraryText>
            <LibraryHeading size={19} style={{ lineHeight: 22.8 }}>
              Saptagita
            </LibraryHeading>
            <LibraryText style={{ fontSize: 14, lineHeight: 21.7, color: c.text2 }}>
              Seven verses of the Gita a day. Opens the Saptagita app.
            </LibraryText>
          </View>
          <Icon name="chevronRight" size={20} color={c.text2} />
        </LibraryRow>
        {linkError && (
          <LibraryText accessibilityLiveRegion="polite">
            Install Saptagita to open the app, then try again.
          </LibraryText>
        )}
      </View>
      <View style={{ marginTop: 34, marginHorizontal: 16, marginBottom: 28 }}>
        <LineageCard />
      </View>
    </LibraryPage>
  );
}

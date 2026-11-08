import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import {
  BackPill,
  BottomSheet,
  Icon,
  OutlineButton,
  PrimaryButton,
  ProgressSegments,
  ReviewTag,
  SeriesMotif,
  TextLink,
} from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import {
  useContinueReading,
  useReadingPosition,
  useSaveReadingPosition,
  useSeasonEpisodes,
  useSeasons,
  useSeriesAccess,
  useSeriesById,
  useSeriesNotification,
  type EpisodeSummary,
  type Series,
} from '@/data';
import { fonts, v14Colors as c } from '@/theme/tokens';
import { LibraryHeader, LibraryHeading, LibraryPage, LibraryRow, LibraryText } from './Library';

export function SeriesScreen({ seriesId }: { seriesId: string }) {
  const series = useSeriesById(seriesId);
  if (!series)
    return (
      <LibraryPage>
        <LibraryHeader />
        <LibraryText style={{ margin: 24 }}>
          {series === undefined ? 'Loading series…' : 'This series is not available yet.'}
        </LibraryText>
      </LibraryPage>
    );
  return series.id === 'mahabharata' ? (
    <Mahabharata series={series} />
  ) : (
    <OtherSeries series={series} />
  );
}

function OtherSeries({ series }: { series: Series }) {
  const insets = useScreenInsets();
  const router = useRouter();
  const access = useSeriesAccess(series.id);
  const interest = useSeriesNotification(series.id);
  const [sheet, setSheet] = useState<'access' | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const iks = series.id === 'iks';
  const notify = async () => {
    setSaving(true);
    setError(false);
    try {
      await interest.setEnabled(!interest.enabled);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };
  const openPart = (number: number) => {
    const part = series.parts.find((p) => p.number === number);
    if (!part) return;
    if (part.locked && !part.free && !access) {
      setSheet('access');
      return;
    }
    if (part.episodeIds?.[0]) router.push(`/episode/${part.episodeIds[0]}`);
    else setSheet(number);
  };
  return (
    <LibraryPage>
      <View
        style={{
          paddingTop: insets.top + 2,
          paddingHorizontal: 16,
          paddingBottom: 26,
          backgroundColor: series.color,
        }}
      >
        <BackPill dark destination="Wisdom" onPress={() => router.dismissTo('/(tabs)/wisdom')} />
        <View style={{ paddingTop: 18, paddingHorizontal: 8 }}>
          <SeriesMotif motif={series.motif} size={44} />
          <LibraryText
            style={{
              marginTop: 8,
              fontFamily: fonts.display,
              fontSize: iks ? 44 : 50,
              lineHeight: iks ? 50.6 : 55,
              color: c.white,
            }}
          >
            {series.titleDev}
          </LibraryText>
          <LibraryHeading size={30} style={{ color: c.white }}>
            {series.title}
          </LibraryHeading>
          <LibraryText style={{ marginTop: 8, color: c.white, opacity: 0.9, maxWidth: 320 }}>
            {series.description}
          </LibraryText>
        </View>
      </View>
      <View style={{ paddingTop: iks ? 24 : 26, paddingHorizontal: 24 }}>
        <LibraryHeading style={{ marginBottom: 6 }}>
          {iks ? 'Sessions' : series.id === 'ramayana' ? 'The seven kāṇḍas' : 'The series'}
        </LibraryHeading>
        {series.parts.map((part, i) => {
          const locked = !!part.locked && !part.free && !access;
          const content = (
            <>
              <LibraryText
                style={{
                  width: iks ? 26 : 28,
                  fontFamily: fonts.displaySemibold,
                  fontSize: 19,
                  lineHeight: 29.45,
                  color: iks && locked ? c.text2 : series.color,
                }}
              >
                {part.number}
              </LibraryText>
              <LibraryText
                style={{ flex: 1, fontFamily: fonts.display, fontSize: 18, lineHeight: 27.9 }}
              >
                {part.title}
              </LibraryText>
              {iks ? (
                part.free ? (
                  <LibraryText
                    style={{ fontSize: 14, fontFamily: fonts.uiSemibold, color: c.seriesRamayana }}
                  >
                    Free
                  </LibraryText>
                ) : (
                  <Icon name={locked ? 'lock' : 'play'} size={18} color={c.text2} />
                )
              ) : (
                <LibraryText style={{ fontSize: 14, color: c.text2 }}>{part.when}</LibraryText>
              )}
            </>
          );
          const style = {
            flexDirection: 'row' as const,
            gap: 14,
            alignItems: 'center' as const,
            paddingVertical: 13,
            borderTopWidth: i ? 1 : 0,
            borderColor: c.line,
            opacity: iks && locked ? 0.72 : 1,
          };
          return iks ? (
            <LibraryRow
              key={part.number}
              label={`${part.title}, ${part.free ? 'free' : locked ? 'locked, get access' : 'watch session'}`}
              onPress={() => openPart(part.number)}
              style={style}
            >
              {content}
            </LibraryRow>
          ) : (
            <View key={part.number} style={style}>
              {content}
            </View>
          );
        })}
      </View>
      {iks ? (
        <>
          <View style={{ paddingTop: 20, paddingHorizontal: 16 }}>
            <PrimaryButton
              label="Watch session 1, free"
              icon={<Icon name="play" size={18} color={c.white} />}
              onPress={() => openPart(1)}
            />
          </View>
          <View
            style={{
              marginTop: 18,
              marginHorizontal: 16,
              padding: 18,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: c.line,
              backgroundColor: c.white,
            }}
          >
            <LibraryHeading size={19}>Sessions 2 to {series.parts.length}</LibraryHeading>
            <LibraryText
              style={{
                marginTop: 2,
                marginBottom: 12,
                fontSize: 15,
                lineHeight: 23.25,
                color: c.text2,
              }}
            >
              {access
                ? 'The whole series is open on this account.'
                : 'Open the whole series on this account.'}
            </LibraryText>
            <OutlineButton
              label={access ? 'Watch session 2' : 'Get access to the full series'}
              onPress={() => (access ? openPart(2) : setSheet('access'))}
            />
            <ReviewTag
              label="How access is paid for is still to be decided"
              style={{ marginTop: 12 }}
            />
          </View>
          <View style={{ height: 36 }} />
        </>
      ) : (
        <View
          style={{ paddingTop: 22, paddingHorizontal: 16, paddingBottom: 40, marginTop: 'auto' }}
        >
          <PrimaryButton
            label={
              interest.enabled ? 'Notification request saved' : 'Tell me when episode 1 is out'
            }
            accessibilityLabel={
              interest.enabled
                ? 'Notification request saved. Tap to cancel'
                : 'Tell me when episode 1 is out'
            }
            icon={<Icon name={interest.enabled ? 'check' : 'bell'} size={20} color={c.white} />}
            onPress={notify}
            loading={saving}
            disabled={interest.enabled === undefined}
          />
          {interest.enabled && (
            <LibraryText accessibilityLiveRegion="polite" style={{ marginTop: 10, color: c.text2 }}>
              Your interest is saved on this device.
            </LibraryText>
          )}
          {error && (
            <LibraryText
              accessibilityLiveRegion="polite"
              style={{ marginTop: 10, color: c.actionRed }}
            >
              Could not save your request. Please try again.
            </LibraryText>
          )}
        </View>
      )}
      <BottomSheet
        visible={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet === 'access' ? 'Access to the full series' : `Session ${sheet ?? ''}`}
      >
        {sheet === 'access' ? (
          <>
            <LibraryText>[Access to sessions 2 to 5, as approved.]</LibraryText>
            <ReviewTag label="How access is paid for is still to be decided" />
            <LibraryText style={{ color: c.text2 }}>
              The first session is free. Full-series access will be available here once the details
              are confirmed.
            </LibraryText>
          </>
        ) : (
          <>
            <LibraryHeading size={21}>
              {series.parts.find((p) => p.number === sheet)?.title}
            </LibraryHeading>
            <LibraryText>[Session video, as approved]</LibraryText>
            <LibraryText style={{ color: c.text2 }}>
              The approved recording has not been supplied yet.
            </LibraryText>
          </>
        )}
      </BottomSheet>
    </LibraryPage>
  );
}

function EpisodeRow({
  episode,
  current,
  onProgress,
}: {
  episode: EpisodeSummary;
  current: boolean;
  onProgress: (id: string, value: number) => void;
}) {
  const router = useRouter();
  const progress = useReadingPosition(episode.id);
  const read = progress !== undefined && progress >= 0.98;
  useEffect(() => {
    if (progress !== undefined) onProgress(episode.id, progress);
  }, [episode.id, progress, onProgress]);
  return (
    <LibraryRow
      label={`Episode ${episode.number}: ${episode.title}, ${read ? 'read' : current ? 'continue' : `${episode.readMinutes} minute read`}`}
      onPress={() => router.push(`/episode/${episode.id}`)}
      style={{
        flexDirection: 'row',
        gap: 14,
        alignItems: 'center',
        paddingVertical: 13,
        borderTopWidth: 1,
        borderColor: c.line,
        opacity: read ? 0.7 : 1,
      }}
    >
      <LibraryText
        style={{
          width: 28,
          fontFamily: fonts.displaySemibold,
          fontSize: 19,
          lineHeight: 29.45,
          color: current ? c.laterite : c.text2,
        }}
      >
        {episode.number}
      </LibraryText>
      <LibraryText
        style={{
          flex: 1,
          fontFamily: current ? fonts.displaySemibold : fonts.displayMedium,
          fontSize: 18,
          lineHeight: 27.9,
        }}
      >
        {episode.title}
      </LibraryText>
      {read ? (
        <Icon name="check" size={20} color={c.text2} />
      ) : (
        <LibraryText
          style={{
            fontFamily: current ? fonts.uiSemibold : fonts.ui,
            fontSize: 14,
            color: current ? c.laterite : c.text2,
          }}
        >
          {current ? 'Continue' : `${episode.readMinutes} min`}
        </LibraryText>
      )}
    </LibraryRow>
  );
}
function Mahabharata({ series }: { series: Series }) {
  const router = useRouter();
  const seasons = useSeasons();
  const season = seasons?.find((s) => s.status === 'published');
  const episodes = useSeasonEpisodes(season?.id ?? '');
  const resume = useContinueReading();
  const current = resume?.episode.seasonId === season?.id ? resume?.episode : episodes?.[0];
  const savePosition = useSaveReadingPosition();
  const [error, setError] = useState(false);
  const [positions, setPositions] = useState<Record<string, number>>({});
  const onProgress = useCallback(
    (id: string, value: number) =>
      setPositions((previous) =>
        previous[id] === value ? previous : { ...previous, [id]: value },
      ),
    [],
  );
  const done = episodes?.filter((e) => (positions[e.id] ?? 0) >= 0.98).length ?? 0;
  const start = async () => {
    const first = episodes?.[0];
    if (!first) return;
    try {
      await savePosition(first.id, 0);
      router.push(`/episode/${first.id}`);
    } catch {
      setError(true);
    }
  };
  return (
    <LibraryPage>
      <LibraryHeader style={{ paddingBottom: 26 }}>
        <View style={{ paddingTop: 16, paddingHorizontal: 8 }}>
          <LibraryText
            style={{ fontFamily: fonts.display, fontSize: 54, lineHeight: 59.4, color: c.laterite }}
          >
            {series.titleDev}
          </LibraryText>
          <LibraryHeading size={30} style={{ marginTop: 2 }}>
            {series.title}
          </LibraryHeading>
          <LibraryText style={{ marginTop: 8, maxWidth: 320, color: c.darkLeaf }}>
            The great story, retold from the BORI critical edition in eighteen parvas. Each episode
            takes about eight minutes.
          </LibraryText>
        </View>
      </LibraryHeader>
      <View style={{ paddingTop: 24, paddingHorizontal: 24 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <LibraryHeading size={22}>
            {season
              ? `${season.roman}. ${season.title}`
              : seasons === undefined
                ? 'Loading parvas…'
                : 'No published parva yet'}
          </LibraryHeading>
          <LibraryText style={{ fontSize: 14, color: c.text2 }}>
            {done} of {episodes?.length ?? '…'} read
          </LibraryText>
        </View>
        <LibraryText
          style={{
            marginTop: 2,
            marginBottom: 12,
            fontSize: 15,
            lineHeight: 23.25,
            color: c.text2,
          }}
        >
          {season?.blurb}
        </LibraryText>
        <ProgressSegments
          done={done}
          current={current ? current.number - 1 : undefined}
          total={episodes?.length ?? 0}
        />
        <View style={{ marginTop: 14 }}>
          {episodes === undefined ? (
            <LibraryText>Loading episodes…</LibraryText>
          ) : episodes.length === 0 ? (
            <LibraryText>Episodes will appear here once published.</LibraryText>
          ) : (
            episodes.map((e) => (
              <EpisodeRow
                key={e.id}
                episode={e}
                current={e.id === current?.id}
                onProgress={onProgress}
              />
            ))
          )}
        </View>
        {current && (
          <PrimaryButton
            label={`${resume ? 'Continue' : 'Begin'}: ${current.title}`}
            onPress={() => router.push(`/episode/${current.id}`)}
            style={{ marginTop: 16, paddingHorizontal: 8 }}
          />
        )}
        <TextLink
          label="Start again from episode 1"
          onPress={start}
          style={{ marginTop: 14, alignSelf: 'center' }}
        />
        {error && (
          <LibraryText accessibilityLiveRegion="polite">
            Could not restart. Please try again.
          </LibraryText>
        )}
      </View>
      <View style={{ paddingTop: 34, paddingHorizontal: 24, paddingBottom: 36 }}>
        <LibraryHeading size={20} style={{ marginBottom: 4 }}>
          Still to come
        </LibraryHeading>
        {seasons
          ?.filter((s) => s.status === 'coming')
          .map((s) => (
            <View
              key={s.id}
              style={{
                flexDirection: 'row',
                gap: 14,
                paddingVertical: 11,
                borderTopWidth: 1,
                borderColor: c.line,
              }}
            >
              <LibraryText style={{ width: 34, fontFamily: fonts.displaySemibold, color: c.text2 }}>
                {s.roman}
              </LibraryText>
              <LibraryText
                style={{ flex: 1, fontFamily: fonts.display, fontSize: 17, lineHeight: 26.35 }}
              >
                {s.title}
              </LibraryText>
              <LibraryText style={{ fontSize: 14, color: c.text2 }}>
                {series.parts.find((p) => p.seasonId === s.id)?.when ?? '[Date, as announced]'}
              </LibraryText>
            </View>
          ))}
        <LibraryText style={{ marginTop: 10, fontSize: 14, color: c.text2 }}>
          and thirteen more parvas, released in order.
        </LibraryText>
      </View>
    </LibraryPage>
  );
}

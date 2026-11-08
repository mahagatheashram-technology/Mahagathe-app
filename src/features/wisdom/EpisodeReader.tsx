import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  Pressable,
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';

import { EpisodeListSheet } from './EpisodeListSheet';
import { QuestionsSheet } from './QuestionsSheet';
import { TEXT_SIZES, useTextSize } from './textSize';
import { TextSizeSheet } from './TextSizeSheet';
import { BackPill, LeafBand, PrimaryButton, ProgressSegments, TextLink } from '@/components/ui';
import { LibraryHeading, LibraryPage, LibraryText } from './Library';
import { useEpisode, useReadingPosition, useSaveReadingPosition } from '@/data';
import { v14Colors as colors, fonts } from '@/theme/tokens';

const SAVE_EVERY_MS = 800;
/** Treat a saved position this close to the end as "finished": reopen at the top. */
const FINISHED = 0.98;

/** v14 reader. Mounted with key={episodeId} so each episode gets fresh scroll/restore state. */
export function EpisodeReader({ episodeId }: { episodeId: string }) {
  const router = useRouter();
  const insets = useScreenInsets();
  const episode = useEpisode(episodeId);
  const next = useEpisode(episode?.nextEpisodeId ?? undefined);
  const saved = useReadingPosition(episodeId);
  const savePosition = useSaveReadingPosition();
  const sizeKey = useTextSize();
  const size = TEXT_SIZES[sizeKey];

  const [saveError, setSaveError] = useState(false);
  const [sheet, setSheet] = useState<null | 'size' | 'questions' | 'episodes'>(null);

  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const progressRef = useRef(saved ?? 0);
  const restoreTo = useRef<number | undefined>(saved); // position to restore once, after layout AND data are ready
  const restored = useRef(false);
  const dims = useRef({ content: 0, viewport: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    void savePosition(episodeId, progressRef.current)
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
  }, [episodeId, savePosition]);

  // Opening an episode counts as "last read" (W-08); leaving flushes the latest position.
  useEffect(() => {
    void savePosition(episodeId, progressRef.current)
      .then(() => setSaveError(false))
      .catch(() => setSaveError(true));
    return () => {
      if (timer.current) clearTimeout(timer.current);
      void savePosition(episodeId, progressRef.current)
        .then(() => setSaveError(false))
        .catch(() => setSaveError(true));
    };
  }, [episodeId, savePosition]);

  const tryRestore = useCallback(() => {
    const { content, viewport } = dims.current;
    const p = restoreTo.current;
    if (restored.current || p === undefined || content <= 0 || viewport <= 0) return;
    restored.current = true;
    const range = content - viewport;
    if (p > 0.01 && p < FINISHED && range > 0) {
      scrollRef.current?.scrollTo({ y: p * range, animated: false });
    } else if (p >= FINISHED) {
      progressRef.current = 0;
    }
  }, []);

  // The saved position may arrive after the first render (live backend): restore once it does.
  useEffect(() => {
    if (saved === undefined || restored.current) return;
    restoreTo.current = saved;
    progressRef.current = Math.max(progressRef.current, saved);
    tryRestore();
  }, [saved, tryRestore]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const range = contentSize.height - layoutMeasurement.height;
      if (range <= 0 || !restored.current) return;
      const p = Math.min(1, Math.max(0, contentOffset.y / range));
      progressRef.current = p;
      if (!timer.current) timer.current = setTimeout(flush, SAVE_EVERY_MS);
    },
    [flush],
  );

  const goTo = (id: string) => {
    setSheet(null);
    router.replace(`/episode/${id}`);
  };

  if (!episode)
    return (
      <LibraryPage contentStyle={{ paddingTop: insets.top + 2, paddingHorizontal: 16 }}>
        <BackPill destination="Wisdom" onPress={() => router.dismissTo('/(tabs)/wisdom')} />
        <LibraryText style={{ marginTop: 32 }}>
          {episode === undefined ? 'Loading…' : 'This episode is not available yet.'}
        </LibraryText>
      </LibraryPage>
    );

  const goNext = async () => {
    if (!next) return;
    try {
      await savePosition(episodeId, 1);
      goTo(next.id);
    } catch {
      setSaveError(true);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.limewash }}>
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onLayout={(e: LayoutChangeEvent) => {
          dims.current.viewport = e.nativeEvent.layout.height;
          tryRestore();
        }}
        onContentSizeChange={(_w, h) => {
          dims.current.content = h;
          tryRestore();
        }}
      >
        <LeafBand style={{ paddingTop: insets.top + 2, paddingHorizontal: 16, paddingBottom: 20 }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <BackPill
              destination={episode.seasonTitle}
              onPress={() => router.dismissTo('/series/mahabharata')}
              onLongPress={() => setSheet('episodes')}
              accessibilityHint="Hold to choose from all episodes"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Text size"
              onPress={() => setSheet('size')}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <LibraryHeading size={19}>Aa</LibraryHeading>
            </Pressable>
          </View>
          <View style={{ paddingTop: 14, paddingHorizontal: 8 }}>
            <LibraryText style={{ fontSize: 15, lineHeight: 23.25, color: colors.darkLeaf }}>
              Episode {episode.number} of {episode.totalInSeason}, about {episode.readMinutes}{' '}
              minutes
            </LibraryText>
            <LibraryHeading size={33} style={{ marginTop: 4, marginBottom: 12, lineHeight: 37.95 }}>
              {episode.title}
            </LibraryHeading>
            <ProgressSegments
              done={episode.number - 1}
              current={episode.number - 1}
              total={episode.totalInSeason}
            />
          </View>
        </LeafBand>
        {saveError && (
          <LibraryText
            accessibilityLiveRegion="polite"
            style={{ marginHorizontal: 26, marginTop: 12, color: colors.actionRed }}
          >
            Reading position could not be saved. We’ll try again as you read.
          </LibraryText>
        )}
        <View style={{ paddingTop: 26, paddingHorizontal: 26 }}>
          {episode.paragraphs.map((para, i) => (
            <LibraryText
              key={i}
              style={{
                marginBottom: i === episode.paragraphs.length - 1 ? 0 : 18,
                fontFamily: para.startsWith('[') ? fonts.ui : fonts.display,
                fontSize: para.startsWith('[') ? 16 : size.fontSize,
                lineHeight: para.startsWith('[') ? 24.8 : size.lineHeight,
                color: para.startsWith('[') ? colors.text2 : colors.ink,
              }}
            >
              {para}
            </LibraryText>
          ))}
        </View>
        <LibraryText
          style={{
            marginTop: 22,
            marginHorizontal: 26,
            fontSize: 14,
            lineHeight: 21.7,
            color: colors.text2,
          }}
        >
          From the BORI critical edition, {episode.boriRange}
        </LibraryText>
        <View
          style={{
            marginTop: 24,
            marginHorizontal: 16,
            padding: 20,
            borderRadius: 16,
            backgroundColor: colors.lateriteSoft,
          }}
          accessibilityLabel="Reflection"
        >
          <LibraryText
            style={{
              fontFamily: fonts.uiSemibold,
              fontSize: 15,
              lineHeight: 23.25,
              color: colors.laterite,
            }}
          >
            To reflect on
          </LibraryText>
          <LibraryText
            style={{ marginTop: 6, fontFamily: fonts.display, fontSize: 20, lineHeight: 29 }}
          >
            {episode.reflection}
          </LibraryText>
          {
            <TextLink
              label="Two more questions"
              onPress={() => setSheet('questions')}
              style={{ marginTop: 10 }}
            />
          }
        </View>
        <View style={{ paddingTop: 26, paddingHorizontal: 16, paddingBottom: 40 + insets.bottom }}>
          {next ? (
            <PrimaryButton label={`Next: ${next.title}`} onPress={goNext} />
          ) : (
            <PrimaryButton
              label="Back to the Mahabharata"
              onPress={() => router.dismissTo('/series/mahabharata')}
              onLongPress={() => setSheet('episodes')}
              accessibilityHint="Hold to choose from all episodes"
            />
          )}
        </View>
      </ScrollView>
      <TextSizeSheet visible={sheet === 'size'} onClose={() => setSheet(null)} />
      <QuestionsSheet
        visible={sheet === 'questions'}
        onClose={() => setSheet(null)}
        questions={episode.questions}
      />
      <EpisodeListSheet
        visible={sheet === 'episodes'}
        onClose={() => setSheet(null)}
        seasonId={episode.seasonId}
        seasonTitle={episode.seasonTitle}
        currentId={episode.id}
        onPick={goTo}
      />
    </View>
  );
}

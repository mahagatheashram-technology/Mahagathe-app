import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
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
import { AppText, Button, DetailHeader, Icon, Screen } from '@/components/ui';
import { useEpisode, useReadingPosition, useSaveReadingPosition } from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { v12 } from '@/theme/v12';

const SAVE_EVERY_MS = 800;
/** Treat a saved position this close to the end as "finished": reopen at the top. */
const FINISHED = 0.98;

/** v12 reader. Mounted with key={episodeId} so each episode gets fresh scroll/restore state. */
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

  if (!episode) {
    return (
      <Screen contentStyle={{ paddingHorizontal: 20 }}>
        <DetailHeader backLabel="Wisdom" backHref="/(tabs)/wisdom" />
        <View style={{ paddingTop: 48, alignItems: 'center', gap: 10 }}>
          <AppText style={styles.emptyTitle}>
            {episode === undefined ? 'Loading…' : 'This episode is not available'}
          </AppText>
          {episode === null ? (
            <AppText variant="meta" style={{ textAlign: 'center' }}>
              It may not be published yet. You can go back to Wisdom and pick another.
            </AppText>
          ) : null}
        </View>
      </Screen>
    );
  }

  const nQ = episode.questions.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      {saveError ? (
        <AppText accessibilityLiveRegion="polite">
          Reading position could not be saved. We’ll try again as you read.
        </AppText>
      ) : null}
      <View style={[styles.header, { paddingTop: insets.top + 4 }]}>
        <DetailHeader
          backLabel="Wisdom"
          backHref="/(tabs)/wisdom"
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Text size"
              hitSlop={2}
              onPress={() => setSheet('size')}
              style={styles.aa}>
              <AppText style={{ fontFamily: fonts.serif, fontSize: 16, lineHeight: 22 }}>Aa</AppText>
              <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21 }}>Text</AppText>
            </Pressable>
          }
        />
      </View>

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
        }}>
        <View style={[styles.article, { paddingBottom: 32 + insets.bottom }]}>
          <AppText accessibilityRole="header" style={styles.title}>
            {episode.title}
          </AppText>
          <View
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 21, color: v12.muted }}>
              Episode {episode.number} of {episode.totalInSeason} · {episode.readMinutes} min
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="All episodes"
              onPress={() => setSheet('episodes')}
              style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14 }}>All episodes</AppText>
              <Icon name="chevronRight" size={14} strokeWidth={2.4} />
            </Pressable>
          </View>

          {episode.paragraphs.map((para, i) => (
            <AppText
              key={i}
              style={{
                fontFamily: fonts.serif,
                fontSize: size.fontSize,
                lineHeight: size.lineHeight,
                color: colors.ink,
              }}>
              {para}
            </AppText>
          ))}

          <View style={styles.reflect} accessibilityLabel="Reflection">
            <AppText
              style={{
                fontFamily: fonts.sansSemibold,
                fontSize: 12,
                lineHeight: 18,
                letterSpacing: 1.68,
                textTransform: 'uppercase',
                color: v12.label,
              }}>
              Reflect
            </AppText>
            <AppText style={styles.reflectText}>{episode.reflection}</AppText>
            {nQ > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Two more questions"
                onPress={() => setSheet('questions')}
                style={{ minHeight: 44, flexDirection: 'row', gap: 4, alignItems: 'center', marginTop: 2 }}>
                <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15 }}>Two more questions</AppText>
                <Icon name="chevronRight" size={15} strokeWidth={2.4} />
              </Pressable>
            ) : null}
          </View>
          <AppText style={{ fontSize: 13, lineHeight: 20, color: v12.muted }}>
            From the BORI critical edition · {episode.boriRange}
          </AppText>
          {next ? (
            <View style={{ paddingTop: 6, paddingBottom: 36 }}>
              <Button label={`Next: ${next.title}`} onPress={() => goTo(next.id)} />
            </View>
          ) : null}
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

const styles = StyleSheet.create({
  header: { paddingHorizontal: 24 },
  aa: {
    height: 40,
    minWidth: 44,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: v12.outline,
    borderRadius: 999,
    backgroundColor: colors.white,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  article: { paddingTop: 20, paddingHorizontal: 24, gap: 18 },
  title: { fontFamily: fonts.serifSemibold, fontSize: 32, lineHeight: 38.4, color: colors.ink },
  reflect: { gap: 8, padding: 20, borderRadius: 20, backgroundColor: v12.sand },
  reflectText: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 28.5, color: colors.ink },
  emptyTitle: { fontFamily: fonts.serifSemibold, fontSize: 20, lineHeight: 26, textAlign: 'center' },
});

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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EpisodeListSheet } from './EpisodeListSheet';
import { QuestionsSheet } from './QuestionsSheet';
import { TEXT_SIZES, useTextSize } from './textSize';
import { TextSizeSheet } from './TextSizeSheet';
import { AppText, Button, Chip, DetailHeader, Icon, Screen } from '@/components/ui';
import { useEpisode, useReadingPosition, useSaveReadingPosition } from '@/data';
import { colors, fonts } from '@/theme/tokens';

const COUNT_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const SAVE_EVERY_MS = 800;
/** Treat a saved position this close to the end as "finished": reopen at the top. */
const FINISHED = 0.98;

/** EpisodeV3 reader. Mounted with key={episodeId} so each episode gets fresh scroll/restore state. */
export function EpisodeReader({ episodeId }: { episodeId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const episode = useEpisode(episodeId);
  const next = useEpisode(episode?.nextEpisodeId ?? undefined);
  const saved = useReadingPosition(episodeId);
  const savePosition = useSaveReadingPosition();
  const sizeKey = useTextSize();
  const size = TEXT_SIZES[sizeKey];

  const [progress, setProgress] = useState(saved ?? 0);
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
    savePosition(episodeId, progressRef.current);
  }, [episodeId, savePosition]);

  // Opening an episode counts as "last read" (W-08); leaving flushes the latest position.
  useEffect(() => {
    savePosition(episodeId, progressRef.current);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      savePosition(episodeId, progressRef.current);
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
      setProgress(0);
    }
  }, []);

  // The saved position may arrive after the first render (live backend): restore once it does.
  useEffect(() => {
    if (saved === undefined || restored.current) return;
    restoreTo.current = saved;
    progressRef.current = Math.max(progressRef.current, saved);
    setProgress(saved);
    tryRestore();
  }, [saved, tryRestore]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
      const range = contentSize.height - layoutMeasurement.height;
      if (range <= 0 || !restored.current) return;
      const p = Math.min(1, Math.max(0, contentOffset.y / range));
      progressRef.current = p;
      setProgress((prev) => (Math.abs(prev - p) >= 0.004 ? p : prev));
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
        <DetailHeader label="Mahabharata" />
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

  const pct = Math.round(progress * 100);
  const nQ = episode.questions.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <DetailHeader
          label={`${episode.seasonTitle} · Episode ${episode.number} of ${episode.totalInSeason}`}
          trailing={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Text size"
              onPress={() => setSheet('size')}
              style={styles.aa}>
              <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 18, lineHeight: 23 }}>Aa</AppText>
            </Pressable>
          }
        />
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityLabel={`Read ${pct} percent`}
          accessibilityValue={{ min: 0, max: 100, now: pct }}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
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
          <View style={{ gap: 10 }}>
            <AppText accessibilityRole="header" style={styles.title}>
              {episode.title}
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Chip label={`BORI · ${episode.boriRange}`} icon="book" style={{ height: 32 }} />
              <View style={styles.readChip}>
                <AppText style={styles.readChipLabel}>{episode.readMinutes} min read</AppText>
              </View>
            </View>
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
            <AppText variant="overline" color={colors.actionRed}>
              Reflect
            </AppText>
            <AppText style={styles.reflectText}>{episode.reflection}</AppText>
          </View>

          {nQ > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${COUNT_WORDS[nQ] ?? nQ} questions. A gentle check-in, no scores`}
              onPress={() => setSheet('questions')}
              style={({ pressed }) => [styles.qaRow, pressed && { opacity: 0.85 }]}>
              <View style={styles.qaIcon}>
                <Icon name="help" size={18} color={colors.actionRed} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.qaTitle}>{COUNT_WORDS[nQ] ?? nQ} questions</AppText>
                <AppText style={styles.qaSub}>A gentle check-in, no scores</AppText>
              </View>
              <Icon name="chevronRight" size={18} color={colors.muted} strokeWidth={2.2} />
            </Pressable>
          ) : null}

          <AppText style={styles.provenance}>
            Written in Mahagathe&apos;s own words from the BORI critical edition, and checked against it by a second
            reviewer.
          </AppText>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              label="All episodes"
              variant="outline"
              size="md"
              style={{ flex: 1, height: 52 }}
              onPress={() => setSheet('episodes')}
            />
            {next ? (
              <Button
                label={`Episode ${next.number}`}
                size="md"
                style={{ flex: 1, height: 52 }}
                trailingIcon={<Icon name="chevronRight" size={16} color={colors.white} strokeWidth={2.2} />}
                onPress={() => goTo(next.id)}
              />
            ) : null}
          </View>
        </View>
      </ScrollView>

      <TextSizeSheet visible={sheet === 'size'} onClose={() => setSheet(null)} />
      <QuestionsSheet visible={sheet === 'questions'} onClose={() => setSheet(null)} questions={episode.questions} />
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand,
  },
  aa: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  track: { height: 4, borderRadius: 4, backgroundColor: colors.sand },
  fill: { height: 4, borderRadius: 4, backgroundColor: colors.actionRed },
  article: { paddingTop: 24, paddingHorizontal: 24, gap: 18 },
  title: { fontFamily: fonts.serifSemibold, fontSize: 30, lineHeight: 36, color: colors.ink },
  readChip: {
    height: 32, // mock: 30 + 1px border (content-box); the BORI chip stretches to match
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  readChipLabel: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18, color: colors.muted },
  reflect: { gap: 10, paddingVertical: 18, paddingHorizontal: 20, borderRadius: 18, backgroundColor: colors.sand },
  reflectText: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 24, color: colors.ink },
  qaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qaIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaTitle: { fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 22, color: colors.ink },
  qaSub: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18, color: colors.muted },
  provenance: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 19, color: colors.muted },
  emptyTitle: { fontFamily: fonts.serifSemibold, fontSize: 20, lineHeight: 26, textAlign: 'center' },
});

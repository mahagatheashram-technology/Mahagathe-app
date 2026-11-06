import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, Icon } from '@/components/ui';
import {
  useCompleteMandalaDay,
  useGroupCount,
  useMandala,
  usePractice,
  useSession,
  type Mandala,
} from '@/data';
import { colors, fonts, gradients, radii } from '@/theme/tokens';
import { formatCount, formatDuration } from './format';
import { Scrubber } from './Scrubber';
import { usePracticePlayer } from './usePracticePlayer';

/** PlayerV3 — dark maroon full-screen modal. Audio never starts on its own (S-07). */
export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { status } = useSession();
  const practice = usePractice(id);
  const mandala = useMandala();

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const forMandala = !!(mandala && practice && mandala.practiceId === practice.id);

  const label =
    practice && forMandala && mandala ? `Mandala · Day ${mandala.currentDay}` : practice ? 'Practice' : '';

  return (
    <LinearGradient
      colors={gradients.player}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.root, { paddingTop: insets.top + 4, paddingBottom: Math.max(insets.bottom, 24) + 16 }]}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close player"
          onPress={close}
          style={styles.closeBtn}>
          <Icon name="chevronDown" size={24} color={colors.white} />
        </Pressable>
        <AppText variant="eyebrow" color={colors.playerMuted}>
          {label}
        </AppText>
        <View style={{ width: 34 }} />
      </View>

      {practice === undefined ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.white} accessibilityLabel="Loading" />
        </View>
      ) : practice === null ? (
        <View style={styles.center}>
          <AppText style={styles.centerText}>We could not find this practice.</AppText>
          <Button label="Back to Sādhanā" variant="onFeature" onPress={close} />
        </View>
      ) : status !== 'signedIn' ? (
        <Explainer
          practice={practice}
          subtitle={practice.subtitle}
          heading="Sign in to practise"
          body="Your sittings, Mandala and reminders are kept for you once you sign in. Browsing stays open to everyone."
          action={{ label: 'Sign in', onPress: () => router.replace('/welcome') }}
        />
      ) : practice.locked ? (
        <Explainer
          practice={practice}
          subtitle={`${practice.subtitle}`}
          heading="For enrolled sādhakas"
          body="This practice is taught in person. Your teacher opens it in the app after you enrol."
          action={{ label: 'See how to enrol', onPress: () => router.dismissTo('/sangha') }}
        />
      ) : practice.durationSec <= 0 ? (
        <Explainer
          practice={practice}
          subtitle={practice.subtitle}
          heading="Audio not available yet"
          body="[Approved guide and audio to be added by your teachers]"
        />
      ) : (
        <Session
          title={practice.title}
          subtitle={practice.subtitle}
          preparation={practice.preparation}
          durationSec={practice.durationSec}
          audioUrl={practice.audioUrl}
          mandala={forMandala ? mandala : null}
          noMandala={mandala === null}
          onOpenMandala={() => router.push('/mandala')}
        />
      )}
    </LinearGradient>
  );
}

function Hero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.hero}>
      <View style={styles.ringOuter}>
        <View style={styles.ringInner}>
          <Icon name="drop" size={34} strokeWidth={1.6} color={colors.playerMuted} />
        </View>
      </View>
      <View style={{ gap: 6, alignItems: 'center' }}>
        <AppText
          accessibilityRole="header"
          style={{ fontFamily: fonts.serifSemibold, fontSize: 30, lineHeight: 38, textAlign: 'center' }}
          color={colors.white}>
          {title}
        </AppText>
        <AppText variant="meta" style={{ fontSize: 14, lineHeight: 21, textAlign: 'center' }} color={colors.playerMuted}>
          {subtitle}
        </AppText>
      </View>
    </View>
  );
}

/** Hero + a calm card, used when there are no controls (guest, locked, no audio yet). */
function Explainer({
  practice,
  subtitle,
  heading,
  body,
  action,
}: {
  practice: { title: string };
  subtitle: string;
  heading: string;
  body: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={{ flex: 1, gap: 24 }}>
      <ScrollView contentContainerStyle={{ gap: 24 }} showsVerticalScrollIndicator={false}>
        <Hero title={practice.title} subtitle={subtitle} />
        <View style={styles.card}>
          <AppText style={styles.cardHeading}>{heading}</AppText>
          <AppText style={styles.cardBody}>{body}</AppText>
        </View>
      </ScrollView>
      {action ? <Button label={action.label} variant="onFeature" onPress={action.onPress} /> : null}
    </View>
  );
}

function Session({
  title,
  subtitle,
  preparation,
  durationSec,
  audioUrl,
  mandala,
  noMandala,
  onOpenMandala,
}: {
  title: string;
  subtitle: string;
  preparation: string[];
  durationSec: number;
  audioUrl?: string;
  mandala: Mandala | null;
  noMandala: boolean;
  onOpenMandala: () => void;
}) {
  const player = usePracticePlayer({ durationSec, audioUrl });
  const completeDay = useCompleteMandalaDay();
  const group = useGroupCount();
  const [marking, setMarking] = useState(false);

  const mark = async () => {
    setMarking(true);
    try {
      await completeDay();
    } finally {
      setMarking(false);
    }
  };

  const total = player.durationSec;
  return (
    <View style={{ flex: 1, gap: 24 }}>
      <ScrollView contentContainerStyle={{ gap: 24 }} showsVerticalScrollIndicator={false}>
        <Hero title={title} subtitle={`${subtitle} · ${formatDuration(total)}`} />

        {player.finished ? (
          <View style={styles.card} accessibilityLiveRegion="polite">
            <View style={styles.doneRow}>
              <View style={styles.doneDot}>
                <Icon name="check" size={16} strokeWidth={2.4} color={colors.playerMuted} />
              </View>
              <AppText style={styles.cardHeading}>Sitting complete</AppText>
            </View>
            {mandala ? (
              <>
                <AppText style={styles.cardBody}>
                  {mandala.todayComplete
                    ? `Day ${mandala.currentDay} is marked. Well done.`
                    : `Mark today's sitting to add Day ${mandala.currentDay} to your Mandala.`}
                </AppText>
                {mandala.todayComplete && group ? (
                  <AppText style={[styles.cardBody, { color: colors.playerMuted }]}>
                    {formatCount(group.todayCount)} sādhakas have sat today.
                  </AppText>
                ) : null}
                <Button
                  label={mandala.todayComplete ? "Today's sitting is marked" : "Mark today's sitting"}
                  variant="onFeature"
                  icon={mandala.todayComplete ? <Icon name="check" size={18} strokeWidth={2.4} color={colors.actionRed} /> : undefined}
                  disabled={mandala.todayComplete}
                  loading={marking}
                  onPress={mark}
                />
              </>
            ) : noMandala ? (
              <>
                <AppText style={styles.cardBody}>Well done. Begin a 40-day Mandala to keep count of your sittings.</AppText>
                <Button label="Begin a Mandala" variant="onFeature" onPress={onOpenMandala} />
              </>
            ) : (
              <AppText style={styles.cardBody}>Well done. Take a moment before you return to your day.</AppText>
            )}
          </View>
        ) : (
          <View style={styles.card} accessibilityLabel="Before you begin">
            <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21 }} color={colors.white}>
              Before you begin
            </AppText>
            {preparation.map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
                <AppText
                  style={{ fontFamily: fonts.serifSemibold, fontSize: 14, lineHeight: 21, width: 14, flexShrink: 0 }}
                  color={colors.playerMuted}>
                  {i + 1}
                </AppText>
                <AppText style={[styles.cardBody, { flex: 1 }]}>{step}</AppText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Scrubber positionSec={player.positionSec} durationSec={total} onSeek={player.seekTo} />

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back 15 seconds"
          onPress={() => player.skip(-15)}
          style={styles.skip}>
          <Icon name="replay15" size={28} strokeWidth={1.8} color={colors.white} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={player.playing ? 'Pause' : player.finished ? 'Play again' : 'Play'}
          onPress={player.toggle}
          style={styles.playBtn}>
          <Icon name={player.playing ? 'pause' : 'play'} size={34} color={colors.actionRed} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Forward 15 seconds"
          onPress={() => player.skip(15)}
          style={styles.skip}>
          <Icon name="forward15" size={28} strokeWidth={1.8} color={colors.white} />
        </Pressable>
      </View>

      <AppText variant="meta" style={{ textAlign: 'center' }} color={colors.playerMuted}>
        {player.playing
          ? 'Rest your eyes. You can pause at any time.'
          : 'Tap play when you are ready. Audio never starts on its own.'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, gap: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeBtn: { width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  centerText: { fontSize: 15, color: colors.playerBody, textAlign: 'center' },
  hero: { alignItems: 'center', gap: 18, paddingTop: 4 },
  ringOuter: {
    width: 112,
    height: 112,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.playerRingOuter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.playerRingInner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { gap: 14, paddingVertical: 18, paddingHorizontal: 20, borderRadius: radii.xxl, backgroundColor: colors.playerCard },
  cardHeading: { fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21, color: colors.white },
  cardBody: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.playerBody },
  doneRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  doneDot: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.playerRingInner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 36 },
  skip: { width: 52, height: 52, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  playBtn: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

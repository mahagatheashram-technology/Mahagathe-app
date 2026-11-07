import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';

import { AppText, Button, Icon, MandalaOrnament } from '@/components/ui';
import {
  isLiveBackend,
  usePracticeAudio,
  useCompleteMandalaDay,
  useGroupCount,
  useMandala,
  usePractice,
  useSession,
  type Mandala,
} from '@/data';
import { colors, fonts, gradients, radii } from '@/theme/tokens';
import { formatCount } from './format';
import { Scrubber } from './Scrubber';
import { usePracticePlayer } from './usePracticePlayer';

/** v12 full-screen sitting player. Audio never starts on its own (S-07). */
export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useScreenInsets();
  const { status } = useSession();
  const practice = usePractice(id);
  const mandala = useMandala();

  const close = () =>
    router.canGoBack() ? router.back() : router.replace('/practice');
  const forMandala = !!(
    mandala &&
    practice &&
    mandala.practiceId === practice.id
  );

  return (
    <LinearGradient
      colors={gradients.player}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        styles.root,
        {
          paddingTop: insets.top + 4,
          paddingBottom: Math.max(insets.bottom, 24) + 16,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close player"
          onPress={close}
          style={styles.closeBtn}
        >
          <Icon name="chevronDown" size={24} color={colors.white} />
          <AppText
            style={{ fontFamily: fonts.sansMedium, fontSize: 15 }}
            color={colors.white}
          >
            Close
          </AppText>
        </Pressable>
      </View>

      {practice === undefined ? (
        <View style={styles.center}>
          <ActivityIndicator
            color={colors.white}
            accessibilityLabel="Loading"
          />
        </View>
      ) : practice === null ? (
        <View style={styles.center}>
          <AppText style={styles.centerText}>
            We could not find this practice.
          </AppText>
          <Button
            label="Back to Practice"
            variant="onFeature"
            onPress={close}
          />
        </View>
      ) : status !== 'signedIn' ? (
        <Explainer
          practice={practice}
          subtitle={practice.subtitle}
          heading="Sign in to practise"
          body="Your sittings, Mandala and reminders are kept for you once you sign in. Browsing stays open to everyone."
          action={{
            label: 'Sign in',
            onPress: () => router.replace('/welcome'),
          }}
        />
      ) : practice.locked ? (
        <Explainer
          practice={practice}
          subtitle={`${practice.subtitle}`}
          heading="For enrolled sādhakas"
          body="This practice is taught in person. Your teacher opens it in the app after you enrol."
          action={{
            label: 'See how to enrol',
            onPress: () => router.dismissTo('/sangha'),
          }}
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
          key={practice.id}
          title={practice.title}
          durationSec={practice.durationSec}
          practiceId={practice.id}
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
      <View
        style={{
          width: 170,
          height: 170,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={StyleSheet.absoluteFill}>
          <MandalaOrnament
            size={170}
            color={colors.playerOrnament}
            opacity={0.75}
          />
        </View>
        <Icon
          name="drop"
          size={44}
          strokeWidth={1.2}
          color={colors.playerBody}
        />
      </View>
      <View style={{ gap: 6, alignItems: 'center' }}>
        <AppText
          accessibilityRole="header"
          style={{
            fontFamily: fonts.serifSemibold,
            fontSize: 30,
            lineHeight: 38,
            textAlign: 'center',
          }}
          color={colors.white}
        >
          {title}
        </AppText>
        <AppText
          variant="meta"
          style={{ fontSize: 15, lineHeight: 22.5, textAlign: 'center' }}
          color={colors.playerMuted}
        >
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
      <ScrollView
        contentContainerStyle={{ gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Hero title={practice.title} subtitle={subtitle} />
        <View style={styles.card}>
          <AppText style={styles.cardHeading}>{heading}</AppText>
          <AppText style={styles.cardBody}>{body}</AppText>
        </View>
      </ScrollView>
      {action ? (
        <Button
          label={action.label}
          variant="onFeature"
          onPress={action.onPress}
        />
      ) : null}
    </View>
  );
}

function Session({
  title,
  durationSec,
  practiceId,
  mandala,
  noMandala,
  onOpenMandala,
}: {
  title: string;
  durationSec: number;
  practiceId: string;
  mandala: Mandala | null;
  noMandala: boolean;
  onOpenMandala: () => void;
}) {
  const requestAudio = usePracticeAudio();
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const player = usePracticePlayer({
    durationSec,
    audioUrl,
    allowTimer: !isLiveBackend,
  });
  const play = async () => {
    if (isLiveBackend && !audioUrl) {
      if (loadingAudio) return;
      setLoadingAudio(true);
      setAudioError(null);
      try {
        const url = await requestAudio(practiceId);
        if (url) setAudioUrl(url);
        else setAudioError('Approved audio will be available here soon.');
      } catch {
        setAudioError('Audio could not be loaded. Please try again.');
      } finally {
        setLoadingAudio(false);
      }
      return;
    }
    player.toggle();
  };
  const completeDay = useCompleteMandalaDay();
  const group = useGroupCount();
  const [marking, setMarking] = useState(false);

  const mark = async () => {
    setMarking(true);
    try {
      await completeDay();
    } catch {
      setAudioError('We could not mark your sitting. Please try again.');
    } finally {
      setMarking(false);
    }
  };

  const total = player.durationSec;
  return (
    <View style={{ flex: 1, gap: 24 }}>
      <ScrollView
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Hero
          title={title}
          subtitle={`Guided · about ${Math.round(total / 60)} minutes`}
        />

        {player.finished ? (
          <View style={styles.card} accessibilityLiveRegion="polite">
            <View style={styles.doneRow}>
              <View style={styles.doneDot}>
                <Icon
                  name="check"
                  size={16}
                  strokeWidth={2.4}
                  color={colors.playerMuted}
                />
              </View>
              <AppText style={styles.cardHeading}>Sitting complete</AppText>
            </View>
            {mandala ? (
              <>
                <AppText style={styles.cardBody}>
                  {mandala.todayComplete || mandala.sittingsDone === 40
                    ? `${mandala.sittingsDone} sittings are marked in your Mandala.`
                    : `Mark today’s sitting to add sitting ${mandala.sittingsDone + 1} to your Mandala.`}
                </AppText>
                {mandala.todayComplete && group ? (
                  <AppText
                    style={[styles.cardBody, { color: colors.playerMuted }]}
                  >
                    {formatCount(group.todayCount)} sādhakas have sat today.
                  </AppText>
                ) : null}
                <Button
                  label={
                    mandala.sittingsDone === 40
                      ? 'Mandala complete'
                      : mandala.todayComplete
                        ? "Today's sitting is marked"
                        : "Mark today's sitting"
                  }
                  variant="onFeature"
                  icon={
                    mandala.todayComplete ? (
                      <Icon
                        name="check"
                        size={18}
                        strokeWidth={2.4}
                        color={colors.actionRed}
                      />
                    ) : undefined
                  }
                  disabled={
                    mandala.todayComplete || mandala.sittingsDone === 40
                  }
                  loading={marking}
                  onPress={mark}
                />
              </>
            ) : noMandala ? (
              <>
                <AppText style={styles.cardBody}>
                  Well done. Begin a 40-sitting Mandala to keep count of your
                  sittings.
                </AppText>
                <Button
                  label="Begin a Mandala"
                  variant="onFeature"
                  onPress={onOpenMandala}
                />
              </>
            ) : (
              <AppText style={styles.cardBody}>
                Well done. Take a moment before you return to your day.
              </AppText>
            )}
          </View>
        ) : (
          <AppText
            style={{
              textAlign: 'center',
              fontSize: 15,
              lineHeight: 24,
              color: colors.playerBody,
              maxWidth: 300,
              alignSelf: 'center',
            }}
          >
            Sit upright and turn off notifications. Rest your eyes and follow
            the voice.
          </AppText>
        )}
      </ScrollView>

      <View style={{ flexGrow: 1, maxHeight: 60 }} />
      {audioError ? (
        <AppText accessibilityLiveRegion="polite" color={colors.playerBody}>
          {audioError}
        </AppText>
      ) : null}
      <Scrubber
        disabled={isLiveBackend && !audioUrl}
        positionSec={player.positionSec}
        durationSec={total}
        onSeek={player.seekTo}
      />

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            loadingAudio
              ? 'Loading audio'
              : isLiveBackend && !audioUrl
                ? 'Load practice audio'
                : player.playing
                  ? 'Pause'
                  : player.finished
                    ? 'Play again'
                    : 'Play'
          }
          onPress={play}
          disabled={loadingAudio}
          accessibilityState={{ busy: loadingAudio }}
          style={styles.playBtn}
        >
          <Icon
            name={player.playing ? 'pause' : 'play'}
            size={34}
            color={colors.actionRed}
          />
        </Pressable>
      </View>

      <AppText
        variant="meta"
        style={{
          textAlign: 'center',
          marginTop: -12,
          fontSize: 15,
          lineHeight: 22.5,
        }}
        color={colors.playerBody}
      >
        {player.playing
          ? 'Rest your eyes. You can pause at any time.'
          : 'Tap play when you are ready'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, gap: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    minWidth: 80,
    height: 44,
    marginLeft: -6,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  centerText: { fontSize: 15, color: colors.playerBody, textAlign: 'center' },
  hero: { alignItems: 'center', gap: 20, paddingTop: 8 },
  card: {
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: radii.xxl,
    backgroundColor: colors.playerCard,
  },
  cardHeading: {
    fontFamily: fonts.sansSemibold,
    fontSize: 14,
    lineHeight: 21,
    color: colors.white,
  },
  cardBody: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 21,
    color: colors.playerBody,
  },
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
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  playBtn: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

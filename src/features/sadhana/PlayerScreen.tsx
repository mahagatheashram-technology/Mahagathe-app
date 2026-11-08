import { useIsFocused, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { AppText, Icon, OutlineButton, PrimaryButton } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import {
  isLiveBackend, usePracticeAudio, useCompleteMandalaDay, useGroupCount,
  useMandala, usePractice, useSession, useTodayPractice, type Mandala,
} from '@/data';
import { fonts, v14Colors as colors } from '@/theme/tokens';
import { formatCount } from './format';
import { Scrubber } from './Scrubber';
import { usePracticePlayer } from './usePracticePlayer';

/** v14 hall player. Both the real audio and mock timer wait for an explicit Play. */
export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const focused = useIsFocused();
  const insets = useScreenInsets();
  const { status, canUsePersonalFeatures } = useSession();
  const practice = usePractice(id);
  const todayPractice = useTodayPractice();
  const mandala = useMandala();
  const close = () => router.canGoBack() ? router.back() : router.replace('/practice');
  const forMandala = !!(mandala && practice && mandala.practiceId === practice.id);
  // The unrecorded class gets a clearly labelled mock timer using the existing demo duration.
  // No duration or media claim is added to the catalogue or live experience.
  const duration = practice?.durationSec || (!isLiveBackend ? todayPractice?.durationSec ?? 0 : 0);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 2 }]}>
      {focused && <StatusBar style="light" />}
      <View style={{ paddingHorizontal: 16 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close player" onPress={close} style={styles.closeBtn}>
          <Icon name="down" size={20} color={colors.onDark2} strokeWidth={2.2} />
          <AppText style={styles.closeText}>Close</AppText>
        </Pressable>
      </View>
      {status === 'loading' || practice === undefined || (canUsePersonalFeatures && mandala === undefined) ? (
        <View style={styles.center}><ActivityIndicator color={colors.lamp} accessibilityLabel="Loading your sitting" /></View>
      ) : practice === null ? (
        <Explainer heading="Practice not found" body="We could not find this practice." action={{ label: 'Back to Practice', onPress: close }} />
      ) : !canUsePersonalFeatures ? (
        <Explainer heading="Sign in to practise" body="Your sittings, Mandala and reminders are kept for you once you sign in." action={{ label: 'Sign in', onPress: () => router.replace(status === 'signedIn' ? '/setup' : '/welcome') }} />
      ) : practice.locked ? (
        <Explainer heading="Dhyanbhaari" body="Learned in person. Unlocks here after you attend the class." action={{ label: 'See classes', onPress: () => router.dismissTo('/events') }} />
      ) : duration <= 0 ? (
        <Explainer heading={practice.title} body="[Approved guide and audio to be added by your teachers]" />
      ) : (
        <Session
          key={practice.id}
          title={practice.id === 'intro-samatha' ? 'Introductory Samatha' : practice.title}
          durationSec={duration}
          practiceId={practice.id}
          mandala={forMandala ? mandala : null}
          noMandala={mandala === null}
          mockDuration={practice.durationSec <= 0}
          onOpenMandala={() => router.push('/mandala')}
          bottomInset={insets.bottom}
        />
      )}
    </View>
  );
}

function SittingLamp() {
  return <Svg width={150} height={190} viewBox="0 0 150 190" accessible={false}>
    <Defs><RadialGradient id="sittingGlow" cx="50%" cy="38%" r="50%"><Stop offset="0" stopColor={colors.lamp} stopOpacity={.45} /><Stop offset="1" stopColor={colors.lamp} stopOpacity={0} /></RadialGradient></Defs>
    <Circle cx={75} cy={70} r={70} fill="url(#sittingGlow)" />
    <Path d="M75 28c12 16 19 27 19 39a19 19 0 0 1-38 0c0-12 7-23 19-39z" fill={colors.lamp} />
    <Path d="M75 50c5 7 8 12 8 17a8 8 0 0 1-16 0c0-5 3-10 8-17z" fill={colors.lampFlame} />
    <Path d="M28 112h94c0 22-21 38-47 38s-47-16-47-38z" fill="none" stroke={colors.lamp} strokeWidth={2} />
    <Path d="M60 150l-8 18h46l-8-18" fill="none" stroke={colors.lamp} strokeWidth={2} />
  </Svg>;
}

function Explainer({ heading, body, action }: { heading: string; body: string; action?: { label: string; onPress: () => void } }) {
  return <ScrollView contentContainerStyle={[styles.center, { padding: 28, gap: 24 }]}>
    <SittingLamp />
    <AppText accessibilityRole="header" style={styles.title}>{heading}</AppText>
    <AppText style={styles.instruction}>{body}</AppText>
    {action && <OutlineButton color={colors.lamp} label={action.label} onPress={action.onPress} style={{ alignSelf: 'center' }} />}
  </ScrollView>;
}

function Session({ title, durationSec, practiceId, mandala, noMandala, mockDuration, onOpenMandala, bottomInset }: {
  title: string; durationSec: number; practiceId: string; mandala: Mandala | null;
  noMandala: boolean; mockDuration: boolean; onOpenMandala: () => void; bottomInset: number;
}) {
  const requestAudio = usePracticeAudio();
  const [audioUrl, setAudioUrl] = useState<string | undefined>();
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const player = usePracticePlayer({ durationSec, audioUrl, allowTimer: !isLiveBackend });
  const completeDay = useCompleteMandalaDay();
  const group = useGroupCount();
  const [marking, setMarking] = useState(false);
  // Keep the ordinal stable when marking changes the reactive Mandala count.
  const [sitting] = useState(() => Math.min(40, (mandala?.sittingsDone ?? 0) + (mandala?.todayComplete ? 0 : 1)) || 1);
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
  const mark = async () => {
    if (marking) return;
    setMarking(true);
    setAudioError(null);
    try { await completeDay(); }
    catch { setAudioError('We could not mark your sitting. Please try again.'); }
    finally { setMarking(false); }
  };

  return <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
    <View style={styles.hero}>
      <SittingLamp />
      <AppText style={styles.sitting}>Sitting {sitting} of 40</AppText>
      <AppText accessibilityRole="header" style={styles.title}>{title}</AppText>
      <AppText style={styles.instruction}>{mockDuration ? '[Approved guide and audio to come. Mock sitting timer.]' : 'Sit upright, let the eyes close, and follow Mahamuni’s voice.'}</AppText>
    </View>
    {player.finished && <View style={styles.completion} accessibilityLiveRegion="polite">
      <AppText style={styles.completionTitle}>Sitting complete</AppText>
      {mandala ? <>
        <AppText style={styles.completionBody}>{mandala.todayComplete || mandala.sittingsDone === 40 ? `${mandala.sittingsDone} sittings are marked in your Mandala.` : `Mark today’s sitting to add sitting ${mandala.sittingsDone + 1} to your Mandala.`}</AppText>
        {mandala.todayComplete && group && <AppText style={styles.completionBody}>{formatCount(group.todayCount)} sādhakas have sat today.</AppText>}
        <PrimaryButton label={mandala.sittingsDone === 40 ? 'Mandala complete' : mandala.todayComplete ? 'Today’s sitting is marked' : 'Mark today’s sitting'} disabled={mandala.todayComplete || mandala.sittingsDone === 40} loading={marking} onPress={mark} />
        {mandala.sittingsDone === 40 && <OutlineButton label="Begin another Mandala" color={colors.lamp} onPress={onOpenMandala} />}
      </> : noMandala ? <>
        <AppText style={styles.completionBody}>Begin a 40-sitting Mandala to keep count of your sittings.</AppText>
        <PrimaryButton label="Begin a Mandala" onPress={onOpenMandala} />
      </> : <AppText style={styles.completionBody}>Take a moment before you return to your day.</AppText>}
    </View>}
    <View style={[styles.bottom, { paddingBottom: Math.max(bottomInset, 54) }]}>
      {audioError && <AppText accessibilityLiveRegion="polite" style={[styles.completionBody, { marginBottom: 18 }]}>{audioError}</AppText>}
      <Scrubber disabled={isLiveBackend && !audioUrl} positionSec={player.positionSec} durationSec={player.durationSec} onSeek={player.seekTo} />
      <View style={styles.controls}>
        <Pressable accessibilityRole="button" accessibilityLabel={loadingAudio ? 'Loading audio' : isLiveBackend && !audioUrl ? 'Load practice audio' : player.playing ? 'Pause' : player.finished ? 'Play again' : 'Play'} accessibilityState={{ busy: loadingAudio, disabled: loadingAudio }} onPress={play} disabled={loadingAudio} style={styles.playBtn}>
          {loadingAudio ? <ActivityIndicator color={colors.indigo} /> : <Icon name={player.playing ? 'pause' : 'play'} size={32} color={colors.indigo} />}
        </Pressable>
      </View>
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.indigo },
  closeBtn: { minWidth: 80, height: 44, flexDirection: 'row', gap: 6, alignItems: 'center', alignSelf: 'flex-start' },
  closeText: { fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: colors.onDark2 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { alignItems: 'center', paddingTop: 30, paddingHorizontal: 28 },
  sitting: { marginTop: 24, fontSize: 15, lineHeight: 23.25, color: colors.lamp, textAlign: 'center' },
  title: { marginTop: 2, fontFamily: fonts.displaySemibold, fontSize: 33, lineHeight: 37.95, color: colors.white, textAlign: 'center' },
  instruction: { marginTop: 14, fontSize: 17, lineHeight: 26.35, color: colors.onDark2, maxWidth: 290, textAlign: 'center' },
  bottom: { marginTop: 'auto', paddingTop: 40, paddingHorizontal: 28 },
  controls: { marginTop: 18, alignItems: 'center' },
  playBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.lamp, alignItems: 'center', justifyContent: 'center' },
  completion: { marginTop: 24, marginHorizontal: 28, padding: 20, borderRadius: 20, backgroundColor: colors.indigo2, gap: 14 },
  completionTitle: { fontFamily: fonts.uiSemibold, fontSize: 17, lineHeight: 26.35, color: colors.white },
  completionBody: { fontSize: 15, lineHeight: 23.25, color: colors.onDark2 },
});

import { useIsFocused, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { AppText, Icon, LampRing, OutlineButton, PrimaryButton, ReviewTag, Screen } from '@/components/ui';
import {
  useMandala, useNotificationPrefs, usePracticeUnlocks, usePractices, useProfile,
  useSession, useSetNotificationPref, useTodayPractice, useUpdateProfile,
} from '@/data';
import { fonts, v14Colors as colors } from '@/theme/tokens';
import { formatReminder } from './format';
import { TimePickerSheet } from './TimePickerSheet';
import { useAuthGate } from './useAuthGate';

function remainingCopy(count: number) {
  const remaining = Math.max(0, 40 - count);
  if (remaining === 0) return 'All forty lamps are lit.';
  const tens: Record<number, string> = { 10: 'Ten', 20: 'Twenty', 30: 'Thirty', 40: 'Forty' };
  return `${tens[remaining] ?? remaining} to go, at your own pace.`;
}

export function PracticeScreen() {
  const router = useRouter();
  const focused = useIsFocused();
  const { gate, signedIn } = useAuthGate();
  const { status } = useSession();
  const mandala = useMandala();
  const practice = useTodayPractice();
  const practices = usePractices();
  const unlocks = usePracticeUnlocks();
  const profile = useProfile();
  const prefs = useNotificationPrefs();
  const setPref = useSetNotificationPref();
  const updateProfile = useUpdateProfile();
  const [timeOpen, setTimeOpen] = useState(false);
  const [savingReminder, setSavingReminder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const count = signedIn ? mandala?.sittingsDone ?? 0 : 0;
  const loading = status === 'loading' || (signedIn && mandala === undefined);
  const dhyanbhaari = practices?.find(item => item.id === 'dhyanbhaari');
  const unlocked = !!unlocks?.dhyanbhaari && !!dhyanbhaari && !dhyanbhaari.locked;
  const openMandala = gate(() => router.push('/mandala'));
  const begin = gate(() => {
    if (!mandala || count === 40) router.push('/mandala');
    else router.push(`/player/${mandala.practiceId}`);
  });
  const toggleReminder = gate(() => {
    if (!prefs || savingReminder) return;
    setSavingReminder(true);
    setError(null);
    void setPref('practiceReminder', !prefs.practiceReminder)
      .catch(() => setError('We could not save your reminder. Please try again.'))
      .finally(() => setSavingReminder(false));
  });

  return (
    <Screen background={colors.indigo} contentStyle={{ paddingTop: 6 }}>
      {focused && <StatusBar style="light" />}
      <AppText accessibilityRole="header" style={styles.title}>Practice</AppText>
      <View style={styles.mandala}>
        {loading ? <ActivityIndicator style={{ height: 236 }} color={colors.lamp} accessibilityLabel="Loading your Mandala" /> : (
          <Pressable accessibilityRole="link" accessibilityLabel="View your Mandala" onPress={openMandala}>
            <LampRing done={count} />
          </Pressable>
        )}
        <AppText style={styles.mandalaCopy}>Each sitting lights one lamp of your Mandala. {remainingCopy(count)}</AppText>
        <ReviewTag dark label="Mandala rule needs teachers’ review (D-23)" style={{ marginTop: 10, alignSelf: 'center' }} />
        <PrimaryButton
          label={count === 40 ? 'Begin another Mandala' : signedIn && mandala?.todayComplete ? 'Today’s sitting is marked' : `Begin sitting ${count + 1}`}
          icon={<Icon name={mandala?.todayComplete && signedIn ? 'check' : 'play'} size={18} color={colors.white} />}
          onPress={begin}
          disabled={loading || (signedIn && ((!!mandala?.todayComplete && count < 40) || !practice))}
          style={{ width: '100%', marginTop: 20 }}
        />
      </View>
      <View style={styles.path}>
        <AppText accessibilityRole="header" style={styles.sectionTitle}>The path of practice</AppText>
        <AppText style={styles.pathIntro}>Begin with Samatha. Dhyanbhaari is given in a class, then practised here.</AppText>
        {practices === undefined || unlocks === undefined ? <ActivityIndicator color={colors.lamp} accessibilityLabel="Loading the path of practice" /> : practices.length === 0 ? <AppText style={styles.body}>Sittings will appear here when ready.</AppText> : <>
          <Pressable accessibilityRole="button" accessibilityLabel="Play Samatha meditation" onPress={gate(() => practice && router.push(`/player/${practice.id}`))} style={styles.step}>
            <View style={styles.connector} />
            <View style={styles.openNode}><AppText style={styles.openNumber}>1</AppText></View>
            <View style={styles.stepCopy}>
              <AppText style={styles.stepTitle}>Samatha meditation</AppText>
              <AppText style={styles.stepBody}>Calm-abiding meditation. Open to everyone.</AppText>
            </View>
            <AppText style={styles.practising}>Practising</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={unlocked ? 'Play Dhyanbhaari' : 'Dhyanbhaari locked. See classes'} onPress={gate(() => router.push(unlocked ? '/player/dhyanbhaari' : '/events'))} style={styles.step}>
            <View style={[styles.closedNode, unlocked && styles.openNode]}><AppText style={[styles.closedNumber, unlocked && styles.openNumber]}>2</AppText></View>
            <View style={styles.stepCopy}>
              <AppText style={styles.stepTitle}>Dhyanbhaari</AppText>
              <AppText style={styles.stepBody}>{unlocked ? 'Learned in person. Ready to practise here.' : 'Learned in person. Unlocks here after you attend the class.'}</AppText>
            </View>
            <View style={{ paddingTop: 6 }}><Icon name={unlocked ? 'play' : 'lock'} size={18} color={unlocked ? colors.lamp : colors.onDark2} /></View>
          </Pressable>
        </>}
        <View style={styles.classCard}>
          <AppText style={styles.classTitle}>Next Dhyanbhaari class</AppText>
          <AppText style={styles.classBody}>[Date and place, as announced]</AppText>
          <OutlineButton label="See classes" color={colors.lamp} onPress={gate(() => router.push('/events'))} />
        </View>
        <ReviewTag dark label="Path labels and order need sign-off" style={{ marginTop: 14, marginLeft: 50 }} />
      </View>
      <View style={styles.reminder}>
        <Icon name="bell" size={22} color={colors.onDark2} />
        <Pressable accessibilityRole="button" accessibilityLabel={`Change daily reminder time, ${formatReminder(profile?.reminderTime ?? '06:00')}`} onPress={gate(() => setTimeOpen(true))} style={{ flex: 1, minHeight: 44 }}>
          <AppText style={styles.classTitle}>Daily reminder</AppText>
          <AppText style={[styles.stepBody, { lineHeight: 24.8 }]}>{prefs === undefined ? 'Loading…' : prefs.practiceReminder ? formatReminder(profile?.reminderTime ?? '06:00') : 'Off'}</AppText>
        </Pressable>
        <Pressable accessibilityRole="switch" accessibilityLabel="Daily reminder" accessibilityState={{ checked: !!prefs?.practiceReminder, disabled: savingReminder || prefs === undefined }} aria-checked={!!prefs?.practiceReminder} disabled={savingReminder || prefs === undefined} onPress={toggleReminder} style={styles.switchTarget}>
          <View style={[styles.switchTrack, { backgroundColor: prefs?.practiceReminder ? colors.lamp : colors.indigo2 }]}><View style={[styles.switchThumb, { alignSelf: prefs?.practiceReminder ? 'flex-end' : 'flex-start' }]} /></View>
        </Pressable>
      </View>
      {error && <AppText accessibilityLiveRegion="polite" style={[styles.body, { paddingHorizontal: 24, paddingBottom: 24 }]}>{error}</AppText>}
      <TimePickerSheet visible={timeOpen} value={profile?.reminderTime ?? '06:00'} onClose={() => setTimeOpen(false)} onSave={time => updateProfile({ reminderTime: time })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fonts.displaySemibold, fontSize: 33, lineHeight: 51.15, color: colors.white, marginHorizontal: 24 },
  mandala: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 18 },
  mandalaCopy: { marginTop: 16, maxWidth: 290, fontSize: 16, lineHeight: 24.8, color: colors.onDark2, textAlign: 'center' },
  path: { paddingTop: 36, paddingHorizontal: 24, paddingBottom: 6 },
  sectionTitle: { fontFamily: fonts.displaySemibold, fontSize: 21, lineHeight: 32.55, color: colors.white },
  pathIntro: { marginTop: 4, marginBottom: 20, fontSize: 15, lineHeight: 23.25, color: colors.onDark2 },
  body: { fontSize: 16, lineHeight: 24.8, color: colors.onDark2 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, paddingBottom: 22, minHeight: 56 },
  connector: { position: 'absolute', left: 16.5, top: 38, bottom: -6, width: 1.5, backgroundColor: colors.onDark2, opacity: .3 },
  openNode: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.lamp, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  openNumber: { fontFamily: fonts.displayBold, fontSize: 16, lineHeight: 24.8, color: colors.indigo },
  closedNode: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: colors.hallNodeLine, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  closedNumber: { fontFamily: fonts.displaySemibold, fontSize: 16, lineHeight: 24.8, color: colors.onDark2 },
  stepCopy: { flex: 1, paddingTop: 3 },
  stepTitle: { fontFamily: fonts.uiSemibold, fontSize: 17, lineHeight: 26.35, color: colors.white },
  stepBody: { fontSize: 14, lineHeight: 21.7, color: colors.onDark2 },
  practising: { paddingTop: 6, fontFamily: fonts.uiSemibold, fontSize: 14, lineHeight: 21.7, color: colors.lamp },
  classCard: { marginTop: -4, marginLeft: 50, padding: 16, borderRadius: 14, backgroundColor: colors.indigo2 },
  classTitle: { fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: colors.white },
  classBody: { marginTop: 2, marginBottom: 12, fontSize: 14, lineHeight: 21.7, color: colors.onDark2 },
  reminder: { marginTop: 26, marginHorizontal: 24, marginBottom: 28, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.hallReminderLine, flexDirection: 'row', alignItems: 'center', gap: 14 },
  switchTarget: { minWidth: 50, minHeight: 44, justifyContent: 'center' },
  switchTrack: { width: 50, height: 30, borderRadius: 15, padding: 3 },
  switchThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.indigo },
});

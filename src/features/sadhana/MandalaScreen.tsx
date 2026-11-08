import { useIsFocused, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText, BackPill, Icon, LampRing, PrimaryButton, ReviewTag, Screen } from '@/components/ui';
import { useCurrentTime, useMandala, useSession, useStartMandala, useTodayPractice } from '@/data';
import { fonts, v14Colors as colors } from '@/theme/tokens';
import { formatStartDate } from './format';
import { useAuthGate } from './useAuthGate';

function lastSittingLabel(value: string, now: number) {
  const indiaDay = (date: number) => Math.floor((date + 330 * 60000) / 86400000);
  const parsed = value.length === 10 ? Date.parse(`${value}T00:00:00+05:30`) : Date.parse(value);
  const ago = indiaDay(now) - indiaDay(parsed);
  return ago === 0 ? 'today' : ago === 1 ? 'yesterday' : formatStartDate(value.slice(0, 10));
}

const rules = [
  ['One sitting counts each day.', 'Sit more if you like; the lamp lights once.'],
  ['There is no deadline.', 'A missed day changes nothing. Come back when you can.'],
  ['At forty, the Mandala is complete.', 'Then you can begin another.'],
];

export default function MandalaScreen() {
  const router = useRouter();
  const focused = useIsFocused();
  const { gate, signedIn } = useAuthGate();
  const { status } = useSession();
  const mandala = useMandala();
  const practice = useTodayPractice();
  const now = useCurrentTime();
  const start = useStartMandala();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loaded = status !== 'loading' && (!signedIn || mandala !== undefined);
  const count = signedIn ? mandala?.sittingsDone ?? 0 : 0;
  const begin = async () => {
    if (!practice || starting) return;
    setStarting(true);
    setError(null);
    try {
      const practiceId = mandala && count < 40 ? mandala.practiceId : practice.id;
      // The three rules are visible before this explicit acceptance/start action (S-08).
      if (!mandala || count === 40) await start(practiceId);
      router.push(`/player/${practiceId}`);
    } catch {
      setError('We could not begin your Mandala. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <Screen background={colors.indigo} contentStyle={{ paddingTop: 2 }}>
      {focused && <StatusBar style="light" />}
      <View style={{ paddingHorizontal: 16 }}><BackPill dark destination="Practice" onPress={() => router.dismissTo('/practice')} /></View>
      <View style={styles.hero}>
        <AppText accessibilityRole="header" style={styles.title}>Your Mandala</AppText>
        <AppText style={styles.dates}>{signedIn && mandala ? `Begun ${formatStartDate(mandala.startDate)}. ${mandala.lastSittingAt ? `Last sitting ${lastSittingLabel(mandala.lastSittingAt, now)}.` : 'Your first sitting awaits.'}` : 'Forty sittings, at your own pace.'}</AppText>
        {loaded ? <LampRing done={count} size={290} /> : <ActivityIndicator style={{ height: 290 }} color={colors.lamp} accessibilityLabel="Loading your Mandala" />}
      </View>
      <View style={styles.rules}>
        <ReviewTag dark label="These three rules need teachers’ review (D-23)" />
        <View style={{ marginTop: 6 }}>
          {rules.map(([title, body], index) => <View key={title} style={[styles.rule, index > 0 && styles.divider]}>
            <View style={{ marginTop: 2 }}><Icon name="lampi" size={20} color={colors.lamp} /></View>
            <View style={{ flex: 1 }}><AppText style={styles.ruleTitle}>{title}</AppText><AppText style={styles.ruleBody}>{body}</AppText></View>
          </View>)}
        </View>
      </View>
      <View style={styles.action}>
        {error && <AppText accessibilityLiveRegion="polite" style={[styles.ruleBody, { marginBottom: 12 }]}>{error}</AppText>}
        <PrimaryButton
          label={count === 40 ? 'Begin another Mandala' : signedIn && mandala?.todayComplete ? 'Today’s sitting is marked' : `Begin sitting ${count + 1}`}
          accessibilityLabel={!signedIn ? 'Sign in to begin your Mandala' : !mandala || count === 40 ? 'I have read the rules. Begin sitting 1' : undefined}
          icon={<Icon name={mandala?.todayComplete && signedIn && count < 40 ? 'check' : 'play'} size={18} color={colors.white} />}
          loading={starting}
          disabled={!loaded || (signedIn && (!practice || (!!mandala?.todayComplete && count < 40)))}
          onPress={gate(() => { void begin(); })}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 10, paddingHorizontal: 24 },
  title: { fontFamily: fonts.displaySemibold, fontSize: 30, lineHeight: 46.5, color: colors.white, textAlign: 'center' },
  dates: { marginTop: 2, marginBottom: 18, fontSize: 15, lineHeight: 23.25, color: colors.onDark2, textAlign: 'center' },
  rules: { paddingTop: 26, paddingHorizontal: 24 },
  rule: { flexDirection: 'row', gap: 14, paddingVertical: 12 },
  divider: { borderTopWidth: 1, borderTopColor: colors.hallRule },
  ruleTitle: { fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: colors.white },
  ruleBody: { fontSize: 15, lineHeight: 24.8, color: colors.onDark2 },
  action: { marginTop: 'auto', paddingTop: 18, paddingHorizontal: 24, paddingBottom: 40 },
});

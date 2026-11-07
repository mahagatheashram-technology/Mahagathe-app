import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';

import { AppText, Button, Icon, RedFeature, SandBand, Screen } from '@/components/ui';
import {
  useGroupCount,
  useMandala,
  useSession,
  useStartMandala,
  useTodayPractice,
} from '@/data';
import { colors, fonts, radii } from '@/theme/tokens';
import { formatCount, formatStartDate } from './format';
import { MandalaGrid, MandalaLegend } from './MandalaGrid';
import { RulesSheet } from './RulesSheet';

const DAYS = 40;

/** MandalaV3 — 40-day grid, stats, group count, rules, "Begin today's sitting". */
export default function MandalaScreen() {
  const router = useRouter();
  const insets = useScreenInsets();
  const { status } = useSession();
  const mandala = useMandala();
  const group = useGroupCount();
  const practice = useTodayPractice();
  const startMandala = useStartMandala();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [starting, setStarting] = useState(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/sadhana'));

  const header = (children: React.ReactNode, showRules = true) => (
    <RedFeature style={{ ...styles.header, paddingTop: insets.top }} accessibilityLabel="Your Mandala">
      <View style={styles.rowBetween}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={back} style={styles.backBtn}>
          <Icon name="back" size={22} color={colors.white} />
        </Pressable>
        {showRules ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mandala rules"
            onPress={() => setRulesOpen(true)}
            style={{ minHeight: 44, justifyContent: 'center' }}>
            <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 19.5 }} color={colors.white}>
              Mandala rules
            </AppText>
          </Pressable>
        ) : null}
      </View>
      {children}
    </RedFeature>
  );

  if (mandala === undefined) {
    return (
      <Screen edgeToEdgeTop contentStyle={{ justifyContent: 'center' }}>
        <ActivityIndicator color={colors.actionRed} accessibilityLabel="Loading" />
      </Screen>
    );
  }

  // Guests: practice needs sign-in.
  if (status !== 'signedIn') {
    return (
      <Screen edgeToEdgeTop>
        {header(
          <View style={{ gap: 4 }}>
            <AppText variant="eyebrow" color={colors.onFeatureMuted} style={{ lineHeight: 17.5 }}>
              40-Day Mandala
            </AppText>
            <AppText style={styles.bigTitle} color={colors.white}>
              Sit for 40 days
            </AppText>
            <AppText variant="meta" color={colors.onFeatureMuted} style={{ lineHeight: 19.5 }}>
              Sign in to begin and keep your Mandala.
            </AppText>
          </View>,
        )}
        <View style={styles.footer}>
          <Button label="Sign in" onPress={() => router.push('/welcome')} />
        </View>
        <RulesSheet visible={rulesOpen} onClose={() => setRulesOpen(false)} />
      </Screen>
    );
  }

  // No active Mandala: start state (S-08, read the rules first).
  if (mandala === null) {
    const begin = async () => {
      setStarting(true);
      try {
        await startMandala(practice?.id ?? 'intro-samatha');
        setRulesOpen(false);
      } catch {
        Alert.alert('Mandala not started', 'We could not begin your Mandala. Please try again.');
      } finally {
        setStarting(false);
      }
    };
    return (
      <Screen edgeToEdgeTop>
        {header(
          <View style={{ gap: 4 }}>
            <AppText variant="eyebrow" color={colors.onFeatureMuted} style={{ lineHeight: 17.5 }}>
              40-Day Mandala
            </AppText>
            <AppText style={styles.bigTitle} color={colors.white}>
              Begin your Mandala
            </AppText>
            <AppText variant="meta" color={colors.onFeatureMuted} style={{ lineHeight: 19.5 }}>
              Forty days, one sitting a day{practice ? ` · ${practice.title}` : ''}
            </AppText>
          </View>,
        )}
        <View style={{ padding: 24, paddingHorizontal: 20 }}>
          <MandalaGrid days={Array.from({ length: DAYS }, () => 'future' as const)} currentDay={0} />
        </View>
        <View style={[styles.footer, { flexGrow: 1 }]}>
          <AppText variant="meta" style={{ fontSize: 13, lineHeight: 20.8 }}>
            Read the rules first. A day counts once, on the date the server records.
          </AppText>
          <View style={{ flexGrow: 1 }} />
          <Button
            label="Read the rules and begin"
            icon={<Icon name="play" size={18} color={colors.white} />}
            onPress={() => setRulesOpen(true)}
          />
        </View>
        <RulesSheet visible={rulesOpen} onClose={() => setRulesOpen(false)} onBegin={begin} beginning={starting} />
      </Screen>
    );
  }

  const toGo = DAYS - mandala.currentDay;
  const stats = [
    { value: mandala.daysSat, label: 'days sat' },
    { value: mandala.streak, label: 'in a row' },
    { value: toGo, label: 'to go' },
  ];

  return (
    <Screen edgeToEdgeTop>
      {header(
        <>
          <View style={{ gap: 4 }}>
            <AppText variant="eyebrow" color={colors.onFeatureMuted} style={{ lineHeight: 17.5 }}>
              40-Day Mandala
            </AppText>
            <AppText style={styles.bigTitle} color={colors.white} accessibilityRole="header">
              Day {mandala.currentDay} of {DAYS}
            </AppText>
            <AppText variant="meta" color={colors.onFeatureMuted} style={{ lineHeight: 19.5 }}>
              Started {formatStartDate(mandala.startDate)} · {mandala.practiceTitle}
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {stats.map((s) => (
              <View key={s.label} style={styles.stat} accessible accessibilityLabel={`${s.value} ${s.label}`}>
                <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 24, lineHeight: 30.5 }} color={colors.white}>
                  {s.value}
                </AppText>
                <AppText variant="caption" color={colors.onFeatureMuted} style={{ lineHeight: 17.5 }}>
                  {s.label}
                </AppText>
              </View>
            ))}
          </View>
        </>,
      )}

      <View style={{ paddingVertical: 24, paddingHorizontal: 20, gap: 14 }}>
        <MandalaGrid days={mandala.days} currentDay={mandala.currentDay} />
        <MandalaLegend />
      </View>

      <SandBand style={{ paddingVertical: 22, paddingHorizontal: 20, gap: 6 }} accessibilityLabel="Sitting together">
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 19.5 }}>Sitting together</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
          <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 34, lineHeight: 43.5 }} color={colors.actionRed}>
            {group ? formatCount(group.todayCount) : '–'}
          </AppText>
          <AppText variant="meta" color={colors.ink} style={{ fontSize: 14, lineHeight: 21 }}>
            sādhakas have sat today
          </AppText>
        </View>
        <AppText variant="meta" style={{ lineHeight: 19.5 }}>
          {group ? formatCount(group.cycleSittings) : '–'} sittings in this Mandala cycle. No names, no ranks.
        </AppText>
      </SandBand>

      <View style={[styles.footer, { flexGrow: 1 }]}>
        <AppText variant="meta" style={{ fontSize: 13, lineHeight: 20.8 }}>
          A day counts once, on the date the server records. A missed day stays open in your grid; your teachers set what
          it means for the Mandala.
        </AppText>
        <View style={{ flexGrow: 1 }} />
        {mandala.todayComplete ? (
          <View style={styles.done} accessible accessibilityLabel="Today's sitting is marked">
            <Icon name="check" size={18} strokeWidth={2.4} color={colors.actionRed} />
            <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 16, lineHeight: 24 }}>
              Today&apos;s sitting is marked
            </AppText>
          </View>
        ) : (
          <Button
            label="Begin today's sitting"
            icon={<Icon name="play" size={18} color={colors.white} />}
            style={{ gap: 10 }}
            onPress={() => router.push({ pathname: '/player/[id]', params: { id: mandala.practiceId } })}
          />
        )}
      </View>

      <RulesSheet visible={rulesOpen} onClose={() => setRulesOpen(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 26, gap: 16 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  bigTitle: { fontFamily: fonts.serifSemibold, fontSize: 34, lineHeight: 43.5 },
  stat: { flex: 1, padding: 12, borderRadius: radii.lg, backgroundColor: colors.onFeatureTile },
  footer: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
  done: {
    height: 54,
    borderRadius: radii.pill,
    backgroundColor: colors.sand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});

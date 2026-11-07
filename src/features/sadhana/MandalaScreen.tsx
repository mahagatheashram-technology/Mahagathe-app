import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AppText, Button, Icon, MandalaRing, Screen, DetailHeader, ListRow } from '@/components/ui';
import {
  useCurrentTime,
  useMandala,
  useSession,
  useStartMandala,
  useTodayPractice,
} from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { formatStartDate } from './format';
import { RulesSheet } from './RulesSheet';
import { useAuthGate } from './useAuthGate';

function lastSittingLabel(value: string, now: number) {
  const indiaDay = (date: number) =>
    Math.floor((date + 330 * 60000) / 86400000);
  const parsed =
    value.length === 10
      ? Date.parse(`${value}T00:00:00+05:30`)
      : Date.parse(value);
  const ago = indiaDay(now) - indiaDay(parsed);
  return ago === 0
    ? 'today'
    : ago === 1
      ? 'yesterday'
      : formatStartDate(value.slice(0, 10));
}

export default function MandalaScreen() {
  const router = useRouter();
  const { gate, signedIn } = useAuthGate();
  const { status } = useSession();
  const mandala = useMandala();
  const practice = useTodayPractice();
  const now = useCurrentTime();
  const start = useStartMandala();
  const [rulesOpen, setRulesOpen] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loaded = status !== 'loading' && (!signedIn || mandala !== undefined);
  const count = signedIn ? (mandala?.sittingsDone ?? 0) : 0;
  const begin = async () => {
    if (!practice) return;
    setStarting(true);
    setError(null);
    try {
      await start(practice.id);
      setRulesOpen(false);
      router.push(`/player/${practice.id}`);
    } catch {
      setError('We could not begin your Mandala. Please try again.');
    } finally {
      setStarting(false);
    }
  };
  return (
    <Screen
      contentStyle={{ paddingTop: 4, paddingHorizontal: 24, paddingBottom: 40 }}
    >
      <DetailHeader backLabel="Practice" backHref="/practice" />
      <View
        style={{ flexGrow: 1, paddingTop: 20, alignItems: 'center', gap: 22 }}
      >
        <AppText
          accessibilityRole="header"
          style={{
            fontFamily: fonts.serifSemibold,
            fontSize: 28,
            lineHeight: 36.4,
          }}
        >
          Your Mandala
        </AppText>
        {!loaded ? (
          <ActivityIndicator
            accessibilityLabel="Loading your Mandala"
            color={colors.actionRed}
          />
        ) : (
          <>
            <MandalaRing size={250} sittingsDone={count} showCount />
            <AppText
              style={{
                maxWidth: 300,
                fontSize: 15,
                lineHeight: 24,
                textAlign: 'center',
                color: colors.textSecondary,
              }}
            >
              Each dot is one sitting. Complete all 40 at your own pace.
              {signedIn && mandala
                ? `\nBegun ${formatStartDate(mandala.startDate)}${mandala.lastSittingAt ? ` · last sitting ${lastSittingLabel(mandala.lastSittingAt, now)}` : ''}`
                : ''}
            </AppText>
            <View style={{ flexGrow: 1 }} />
            {error ? (
              <AppText accessibilityLiveRegion="polite">{error}</AppText>
            ) : null}
            <View style={{ width: '100%' }}>
              <Button
                label={
                  !signedIn
                    ? 'Sign in to begin'
                    : count === 40
                      ? 'Mandala complete'
                      : mandala?.todayComplete
                        ? 'Today’s sitting is marked'
                        : `Begin sitting ${count + 1}`
                }
                disabled={
                  signedIn &&
                  (count === 40 || !!mandala?.todayComplete || !practice)
                }
                icon={
                  <Icon
                    name={
                      count === 40 || mandala?.todayComplete ? 'check' : 'play'
                    }
                    size={18}
                    color={colors.white}
                  />
                }
                onPress={gate(() =>
                  mandala
                    ? router.push(`/player/${mandala.practiceId}`)
                    : setRulesOpen(true),
                )}
              />
            </View>
            <View style={{ width: '100%' }}>
              <ListRow
                icon="info"
                title="How the Mandala works"
                subtitle="What counts, and what happens next"
                onPress={() => setRulesOpen(true)}
                last
              />
            </View>
          </>
        )}
      </View>
      <RulesSheet
        visible={rulesOpen}
        onClose={() => setRulesOpen(false)}
        onBegin={signedIn && !mandala ? begin : undefined}
        beginning={starting}
      />
    </Screen>
  );
}

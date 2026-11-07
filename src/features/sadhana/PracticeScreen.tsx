import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { AppText, Button, Icon, ListRow, MandalaRing, Screen } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import {
  useMandala,
  useNotificationPrefs,
  useProfile,
  useSession,
  useTodayPractice,
} from '@/data';
import { cardStyle, colors, fonts } from '@/theme/tokens';
import { EnrolSheet } from './EnrolSheet';
import { formatReminder } from './format';
import { useAuthGate } from './useAuthGate';

export function PracticeScreen() {
  const router = useRouter();
  const { gate, signedIn } = useAuthGate();
  const { status } = useSession();
  const insets = useScreenInsets();
  const mandala = useMandala();
  const practice = useTodayPractice();
  const profile = useProfile();
  const prefs = useNotificationPrefs();
  const [enrolOpen, setEnrolOpen] = useState(false);
  return (
    <Screen edgeToEdgeTop>
      <LinearGradient
        colors={[colors.headerTop, colors.cream]}
        style={{
          paddingTop: insets.top + 32,
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
      >
        <AppText
          accessibilityRole="header"
          style={{
            fontFamily: fonts.serifSemibold,
            fontSize: 32,
            lineHeight: 41.6,
            marginBottom: 6,
          }}
        >
          Practice
        </AppText>
        <AppText
          style={{
            fontSize: 15,
            lineHeight: 22.5,
            color: colors.textSecondary,
          }}
        >
          Your Mandala and your sittings.
        </AppText>
      </LinearGradient>
      <View style={{ paddingHorizontal: 24, gap: 18, paddingBottom: 24 }}>
        {status === 'loading' || (signedIn && mandala === undefined) ? (
          <ActivityIndicator
            accessibilityLabel="Loading your Mandala"
            color={colors.actionRed}
          />
        ) : !signedIn ? (
          <View style={[cardStyle, { padding: 20, gap: 14 }]}>
            <AppText variant="cardTitle">Your practice</AppText>
            <AppText>Sign in to keep your Mandala and reminders.</AppText>
            <Button label="Sign in" onPress={gate(() => undefined)} />
          </View>
        ) : (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="View your Mandala"
            onPress={() => router.push('/mandala')}
            style={[
              cardStyle,
              {
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 18,
              },
            ]}
          >
            <MandalaRing size={104} sittingsDone={mandala?.sittingsDone ?? 0} />
            <View style={{ flex: 1, gap: 4 }}>
              <AppText
                style={{
                  fontFamily: fonts.serifSemibold,
                  fontSize: 20,
                  lineHeight: 26,
                }}
              >
                Your Mandala
              </AppText>
              <AppText
                style={{
                  fontSize: 15,
                  lineHeight: 22.5,
                  color: colors.textSecondary,
                }}
              >
                {mandala?.sittingsDone ?? 0} of 40 sittings
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23 }}>View</AppText>
                <Icon name="chevronRight" size={15} strokeWidth={2.4} color={colors.ink} />
              </View>
            </View>
          </Pressable>
        )}
        <View>
          <AppText
            style={{
              fontFamily: fonts.sansSemibold,
              fontSize: 12,
              lineHeight: 24,
              letterSpacing: 1.44,
              color: colors.label,
              textTransform: 'uppercase',
            }}
          >
            Sittings
          </AppText>
          {practice === undefined ? (
            <ActivityIndicator
              accessibilityLabel="Loading sittings"
              color={colors.actionRed}
            />
          ) : practice ? (
            <ListRow
              icon="drop"
              title={practice.title}
              subtitle={`Calm-abiding meditation · ${Math.round(practice.durationSec / 60)} min`}
              onPress={gate(() => router.push(`/player/${practice.id}`))}
            />
          ) : (
            <AppText>New sittings will appear here when ready.</AppText>
          )}
          <ListRow
            icon="lamp"
            title="Deepen your practice"
            subtitle="Learn in person, then practise here"
            onPress={gate(() => setEnrolOpen(true))}
          />
          <ListRow
            icon="bell"
            title="Daily reminder"
            subtitle={`${prefs?.practiceReminder ? formatReminder(profile?.reminderTime) : 'Off'} · change in Profile`}
            onPress={gate(() => router.push('/profile'))}
            last
          />
        </View>
      </View>
      <EnrolSheet visible={enrolOpen} onClose={() => setEnrolOpen(false)} />
    </Screen>
  );
}

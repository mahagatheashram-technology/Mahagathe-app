import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, Icon, LampRing, PrimaryButton } from '@/components/ui';
import type { Mandala, Practice } from '@/data';
import { useAuthGate } from '@/features/sadhana/useAuthGate';
import { colors, fonts, v14Radii } from '@/theme/tokens';
import { Skeleton } from './Skeleton';

/** V13Home: the indigo sitting card. Guests see it too; starting a sitting asks them to sign in. */
export function SittingCard({ practice, mandala }: { practice: Practice | null | undefined; mandala: Mandala | null | undefined }) {
  const router = useRouter();
  const { gate, signedIn } = useAuthGate();
  const done = signedIn && mandala ? mandala.sittingsDone : 0;
  const minutes = practice ? Math.max(1, Math.round(practice.durationSec / 60)) : 0;
  const ring = (
    <LampRing
      done={done}
      size={92}
      sub="lit"
      accessible={!(signedIn && mandala)}
      accessibilityLabel={`${done} of 40 sittings`}
    />
  );
  return (
    <View
      style={{
        backgroundColor: colors.indigo,
        borderRadius: v14Radii.card,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
      }}>
      {signedIn && mandala ? (
        <Pressable accessibilityRole="link" accessibilityLabel={`${done} of 40 sittings, open the Mandala`} onPress={() => router.push('/mandala')}>
          {ring}
        </Pressable>
      ) : (
        ring
      )}
      <View style={{ flex: 1 }}>
        {practice === undefined ? (
          <Skeleton height={92} onRed />
        ) : practice === null ? (
          <AppText style={{ fontFamily: fonts.ui, fontSize: 15, lineHeight: 23, color: colors.onDark2 }}>
            Today’s sitting will appear here when it is ready.
          </AppText>
        ) : (
          <>
            <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 21, lineHeight: 25.2, color: colors.white }}>
              {done >= 40 ? 'All 40 lit' : `Sitting ${done + 1} of 40`}
            </AppText>
            <AppText style={{ marginTop: 2, marginBottom: 10, fontFamily: fonts.ui, fontSize: 14, lineHeight: 21.7, color: colors.onDark2 }}>
              {practice.title}, {minutes} min
            </AppText>
            <PrimaryButton
              label="Begin sitting"
              icon={<Icon name="play" size={16} color={colors.white} />}
              onPress={gate(() => router.push(`/player/${practice.id}`))}
              style={{ minHeight: 46, height: 46 }}
            />
          </>
        )}
      </View>
    </View>
  );
}

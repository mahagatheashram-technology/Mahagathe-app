import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { AppText, Button, Icon } from '@/components/ui';
import type { Mandala, Practice } from '@/data';
import { useAuthGate } from '@/features/sadhana/useAuthGate';
import { cardStyle, colors, fonts } from '@/theme/tokens';
import { Skeleton } from './Skeleton';

function ProgressRing({ count }: { count: number }) {
  const circumference = 40 * Math.PI;
  return (
    <View
      style={{ width: 44, height: 44 }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={44} height={44}>
        <Circle
          cx={22}
          cy={22}
          r={20}
          fill="none"
          stroke={colors.divider}
          strokeWidth={4}
        />
        {count > 0 ? (
          <Circle
            cx={22}
            cy={22}
            r={20}
            fill="none"
            stroke={colors.actionRed}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={`${(count / 40) * circumference} ${circumference}`}
            transform="rotate(-90 22 22)"
          />
        ) : null}
      </Svg>
      <View
        style={[
          StyleSheet.absoluteFill,
          { alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <AppText
          style={{
            fontFamily: fonts.serifSemibold,
            fontSize: 14,
            lineHeight: 18,
          }}
        >
          {count}
        </AppText>
      </View>
    </View>
  );
}

export function PracticeCard({
  practice,
  mandala,
}: {
  practice: Practice | null | undefined;
  mandala: Mandala | null | undefined;
}) {
  const router = useRouter();
  const { gate, signedIn } = useAuthGate();
  const minutes = practice
    ? Math.max(1, Math.round(practice.durationSec / 60))
    : 0;
  return (
    <View
      style={[
        cardStyle,
        { paddingVertical: 20, paddingHorizontal: 22, gap: 16 },
      ]}
    >
      {practice === undefined ? (
        <Skeleton height={60} />
      ) : practice === null ? (
        <AppText>Today’s sitting will appear here when it is ready.</AppText>
      ) : (
        <>
          <View style={{ gap: 4 }}>
            <AppText
              style={{
                fontFamily: fonts.sansMedium,
                fontSize: 14,
                lineHeight: 21,
                color: colors.textSecondary,
              }}
            >
              Today’s sitting · about {minutes} minutes
            </AppText>
            <AppText
              style={{
                fontFamily: fonts.serifSemibold,
                fontSize: 22,
                lineHeight: 28.6,
              }}
            >
              {practice.title}
            </AppText>
          </View>
          <Button
            label="Begin today’s sitting"
            icon={<Icon name="play" size={18} color={colors.white} />}
            onPress={gate(() => router.push(`/player/${practice.id}`))}
          />
        </>
      )}
      {mandala === undefined ? (
        <Skeleton height={59} />
      ) : signedIn && mandala ? (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`${mandala.sittingsDone} of 40 sittings, Mandala`}
          onPress={() => router.push('/mandala')}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderTopWidth: 1,
            borderTopColor: colors.divider,
            paddingTop: 14,
            minHeight: 59,
          }}
        >
          <ProgressRing count={mandala.sittingsDone} />
          <AppText
            style={{
              flex: 1,
              fontFamily: fonts.sansMedium,
              fontSize: 15,
              lineHeight: 22.5,
            }}
          >
            {mandala.sittingsDone} of 40 sittings
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <AppText
              style={{
                fontFamily: fonts.sansSemibold,
                fontSize: 15,
                lineHeight: 23,
              }}
            >
              Mandala
            </AppText>
            <Icon name="chevronRight" size={15} strokeWidth={2.4} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

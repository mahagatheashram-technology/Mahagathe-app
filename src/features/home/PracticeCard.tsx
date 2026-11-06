import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { AppText, Card, Icon } from '@/components/ui';
import type { GroupCount, Mandala, Practice } from '@/data';
import { colors, fonts, shadows } from '@/theme/tokens';
import { Skeleton } from './Skeleton';

const R = 19;
const CIRC = 2 * Math.PI * R; // 119.38

/** 46px Mandala ring: brand red arc for days sat out of 40 (the red-brand moment on Home). */
function MandalaRing({ daysSat, day }: { daysSat: number; day: number }) {
  const arc = (Math.min(Math.max(daysSat, 0), 40) / 40) * CIRC;
  return (
    <View style={{ width: 46, height: 46 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={46} height={46} viewBox="0 0 46 46">
        <Circle cx={23} cy={23} r={R} fill="none" stroke={colors.border} strokeWidth={5} />
        {arc > 0 ? (
          <Circle
            cx={23}
            cy={23}
            r={R}
            fill="none"
            stroke={colors.brandRed}
            strokeWidth={5}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${CIRC}`}
            transform="rotate(-90 23 23)"
          />
        ) : null}
      </Svg>
      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 15, lineHeight: 19 }}>{day}</AppText>
      </View>
    </View>
  );
}

/** Raised white card overlapping the red block: today's practice + Mandala row (H-02, H-03). */
export function PracticeCard({
  practice,
  mandala,
  group,
}: {
  practice: Practice | null | undefined;
  mandala: Mandala | null | undefined;
  group: GroupCount | undefined;
}) {
  const router = useRouter();
  const minutes = practice && practice.durationSec > 0 ? Math.max(1, Math.round(practice.durationSec / 60)) : null;

  return (
    <View style={{ paddingHorizontal: 20, marginTop: -48 }} accessibilityLabel="Today's practice">
      <Card raised radius={24} style={{ padding: 22, gap: 16 }}>
        {practice === undefined ? (
          <View style={{ gap: 10 }}>
            <Skeleton width={140} height={14} />
            <Skeleton width={200} height={26} />
            <Skeleton width={120} height={14} />
          </View>
        ) : practice === null ? (
          <View style={{ gap: 4 }}>
            <AppText variant="eyebrow" style={{ letterSpacing: 1.44, lineHeight: 18 }}>
              Your practice today
            </AppText>
            <AppText variant="meta">Your practice will appear here once it is ready.</AppText>
          </View>
        ) : (
          <View style={styles.practiceRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="eyebrow" style={{ letterSpacing: 1.44, lineHeight: 18 }}>
                Your practice today
              </AppText>
              <AppText style={styles.practiceTitle}>{practice.title}</AppText>
              <AppText variant="meta" style={{ lineHeight: 19.5 }}>
                {practice.subtitle}
                {minutes ? ` · ${minutes} min` : ''}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open today's practice"
              onPress={() => router.push(`/player/${practice.id}`)}
              style={({ pressed }) => [styles.play, shadows.playButton, pressed && { opacity: 0.9 }]}>
              <Icon name="play" size={28} color={colors.white} />
            </Pressable>
          </View>
        )}

        {mandala === undefined ? (
          <Skeleton height={76} radius={16} />
        ) : mandala === null ? null : (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`40-Day Mandala, day ${mandala.currentDay}. ${mandala.daysSat} days sat`}
            onPress={() => router.push('/mandala')}
            style={styles.mandalaRow}>
            <MandalaRing daysSat={mandala.daysSat} day={mandala.currentDay} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="label" style={{ lineHeight: 21 }}>
                40-Day Mandala · Day {mandala.currentDay}
              </AppText>
              <AppText variant="caption" style={{ lineHeight: 18 }}>
                {mandala.daysSat} days sat
                {group ? ` · ${group.todayCount} sitting with you today` : ''}
              </AppText>
            </View>
            <Icon name="chevronRight" size={18} color={colors.muted} strokeWidth={2.2} />
          </Pressable>
        )}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  practiceRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  practiceTitle: { fontFamily: fonts.serifSemibold, fontSize: 23, lineHeight: 29.44, color: colors.ink },
  play: {
    width: 68,
    height: 68,
    borderRadius: 999,
    backgroundColor: colors.actionRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.tile,
  },
});

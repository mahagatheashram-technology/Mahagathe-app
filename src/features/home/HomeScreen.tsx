import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, Icon, Screen, ListRow } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import {
  useContinueReading,
  useCurrentTime,
  useMandala,
  useProfile,
  useTodayPractice,
  useTodayVakyam,
} from '@/data';
import { useAuthGate } from '@/features/sadhana/useAuthGate';
import { colors, fonts } from '@/theme/tokens';
import { formatLongDate, greetingFor } from './format';
import { PracticeCard } from './PracticeCard';
import { Skeleton } from './Skeleton';

export default function HomeScreen() {
  const router = useRouter();
  const { gate } = useAuthGate();
  const insets = useScreenInsets();
  const profile = useProfile();
  const practice = useTodayPractice();
  const mandala = useMandala();
  const vakyam = useTodayVakyam();
  const reading = useContinueReading();
  const now = new Date(useCurrentTime());
  const name = profile?.displayName.trim();
  return (
    <Screen edgeToEdgeTop>
      <LinearGradient
        colors={[colors.headerTop, colors.cream]}
        style={{
          paddingTop: insets.top + 4,
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 44,
          }}
        >
          <AppText
            style={{
              fontFamily: fonts.sansMedium,
              fontSize: 14,
              lineHeight: 21,
              color: colors.textSecondary,
            }}
          >
            {formatLongDate(now)}
          </AppText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile and settings"
            onPress={gate(() => router.push('/profile'))}
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              backgroundColor: colors.white,
              borderWidth: 1,
              borderColor: colors.divider,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <>
              {name ? (
                <AppText
                  style={{ fontFamily: fonts.serifSemibold, fontSize: 18 }}
                >
                  {name.charAt(0).toUpperCase()}
                </AppText>
              ) : (
                <Icon name="profile" size={20} />
              )}
            </>
          </Pressable>
        </View>
        <AppText
          accessibilityRole="header"
          style={{
            marginTop: 16,
            fontFamily: fonts.serifMedium,
            fontSize: 27,
            lineHeight: 32.4,
          }}
        >
          {greetingFor(now)}
          {name ? `, ${name}` : ''}
        </AppText>
      </LinearGradient>
      <View style={{ paddingHorizontal: 24, gap: 16, paddingBottom: 24 }}>
        <PracticeCard practice={practice} mandala={mandala} />
        {vakyam === undefined ? (
          <Skeleton height={140} />
        ) : vakyam === null ? (
          <AppText color={colors.textSecondary}>
            Today’s teaching will appear here when it is ready.
          </AppText>
        ) : (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Today's teaching, read its meaning"
            onPress={() => router.push(`/vakyam/${vakyam.id}`)}
            style={{
              gap: 8,
              paddingTop: 10,
              paddingHorizontal: 2,
              paddingBottom: 4,
            }}
          >
            <AppText
              style={{
                fontFamily: fonts.sansSemibold,
                fontSize: 12,
                lineHeight: 18,
                letterSpacing: 1.44,
                color: colors.label,
                textTransform: 'uppercase',
              }}
            >
              Today’s teaching
            </AppText>
            <AppText
              style={{
                fontFamily: fonts.serif,
                fontSize: 22,
                lineHeight: 31.9,
              }}
            >
              “{vakyam.text}”
            </AppText>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
            >
              <AppText
                style={{
                  fontFamily: fonts.sansSemibold,
                  fontSize: 15,
                  lineHeight: 23,
                }}
              >
                Read its meaning
              </AppText>
              <Icon name="chevronRight" size={15} strokeWidth={2.4} />
            </View>
          </Pressable>
        )}
        {reading === undefined ? (
          <Skeleton height={84} />
        ) : reading ? (
          <View style={{ borderTopWidth: 1, borderTopColor: colors.divider }}>
            <ListRow
              icon="wisdom"
              title="Continue reading"
              subtitle={reading.episode.title}
              last
              onPress={() => router.push(`/episode/${reading.episode.id}`)}
            />
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

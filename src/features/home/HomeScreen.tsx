import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, Icon, Screen } from '@/components/ui';
import { useCurrentTime, useMandala, useProfile, useTodayPractice } from '@/data';
import { useAuthGate } from '@/features/sadhana/useAuthGate';
import { colors, fonts } from '@/theme/tokens';
import { greetingFor } from './format';
import { MahamuniWord } from './MahamuniWord';
import { SittingCard } from './SittingCard';
import { YakshaLeaf } from './YakshaLeaf';

/** v14 Home: greeting, sitting card, the Yakṣa’s question leaf, Mahamuni’s word. No events here. */
export default function HomeScreen() {
  const router = useRouter();
  const { gate } = useAuthGate();
  const profile = useProfile();
  const practice = useTodayPractice();
  const mandala = useMandala();
  const now = new Date(useCurrentTime());
  const name = profile?.displayName.trim();
  return (
    <Screen background={colors.limewash} contentStyle={{ paddingTop: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4, paddingHorizontal: 20 }}>
        <AppText
          accessibilityRole="header"
          style={{ flex: 1, fontFamily: fonts.displaySemibold, fontSize: 30, lineHeight: 34.5, color: colors.v14Ink }}>
          {greetingFor(now)}
          {name ? `, ${name}` : ''}
        </AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile and settings"
          onPress={gate(() => router.push('/profile'))}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.lateriteSoft, alignItems: 'center', justifyContent: 'center' }}>
          {name ? (
            <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 19, lineHeight: 24, color: colors.laterite }}>
              {name.charAt(0).toUpperCase()}
            </AppText>
          ) : (
            <Icon name="profile" size={20} color={colors.laterite} />
          )}
        </Pressable>
      </View>
      <View style={{ paddingTop: 18, paddingHorizontal: 16 }}>
        <SittingCard practice={practice} mandala={mandala} />
      </View>
      <View style={{ paddingTop: 24, paddingHorizontal: 16 }}>
        <YakshaLeaf />
      </View>
      <MahamuniWord />
    </Screen>
  );
}

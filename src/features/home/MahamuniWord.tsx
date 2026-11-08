import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, Portrait } from '@/components/ui';
import { useTodayVakyam } from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { Skeleton } from './Skeleton';

/** V13Home: today’s Vākyam, with Mahamuni’s round face crop (N-5) and “What it means”. */
export function MahamuniWord() {
  const router = useRouter();
  const vakyam = useTodayVakyam();
  return (
    <View style={{ paddingTop: 28, paddingHorizontal: 24, paddingBottom: 24 }}>
      {vakyam === undefined ? (
        <Skeleton height={110} />
      ) : vakyam === null ? (
        <AppText style={{ fontFamily: fonts.ui, fontSize: 15, lineHeight: 23.25, color: colors.text2 }}>
          Mahamuni’s word for today will appear here when it is ready.
        </AppText>
      ) : (
        <>
          <AppText style={{ fontFamily: fonts.displayMedium, fontSize: 25, lineHeight: 32.5, color: colors.v14Ink }}>“{vakyam.text}”</AppText>
          <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Portrait size={32} />
              <AppText style={{ flexShrink: 1, fontFamily: fonts.ui, fontSize: 15, lineHeight: 23.25, color: colors.text2 }}>
                Mahamuni’s word for today
              </AppText>
            </View>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel="What it means"
              onPress={() => router.push(`/vakyam/${vakyam.id}`)}
              style={{ minHeight: 44, justifyContent: 'center' }}>
              <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color: colors.v14Ink, textDecorationLine: 'underline' }}>
                What it means
              </AppText>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

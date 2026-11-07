import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { AppText, Icon } from '@/components/ui';
import type { Vakyam } from '@/data';
import { colors, fonts } from '@/theme/tokens';

export function TodayVakyamCard({ vakyam }: { vakyam: Vakyam }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Today's teaching: ${vakyam.text}. Read`}
      onPress={() => router.push(`/vakyam/${vakyam.id}`)}
      style={({ pressed }) => ({
        gap: 8,
        paddingVertical: 20,
        paddingHorizontal: 22,
        borderRadius: 22,
        backgroundColor: colors.iconSand,
        opacity: pressed ? 0.85 : 1,
      })}>
      <AppText
        style={{
          fontFamily: fonts.sansSemibold,
          fontSize: 12,
          lineHeight: 18,
          letterSpacing: 1.68,
          textTransform: 'uppercase',
          color: colors.label,
        }}>
        Today’s teaching
      </AppText>
      <AppText style={{ fontFamily: fonts.serif, fontSize: 21, lineHeight: 30.45 }}>“{vakyam.text}”</AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23 }}>Read</AppText>
        <Icon name="chevronRight" size={15} strokeWidth={2.4} />
      </View>
    </Pressable>
  );
}

import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, Button, Icon } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';

/** "Give dāna" card (→ /donate) and the About Mahagathe row (opens the About sheet). */
export function GiveSection({ onAbout }: { onAbout: () => void }) {
  const router = useRouter();
  return (
    <View accessibilityLabel="Give" style={{ paddingVertical: 26, paddingHorizontal: 20, gap: 16 }}>
      <View
        style={{
          gap: 14,
          padding: 20,
          borderRadius: 22,
          backgroundColor: colors.white,
          borderWidth: 1.5,
          borderColor: colors.actionRed,
        }}>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: colors.tile,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name="heart" size={22} color={colors.actionRed} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 20, lineHeight: 25.5 }}>Give dāna</AppText>
            <AppText variant="meta">Support the seva above, by UPI</AppText>
          </View>
        </View>
        <Button label="Give by UPI" size="md" style={{ height: 50 }} onPress={() => router.push('/donate')} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="About Mahagathe, contact on WhatsApp"
        onPress={onAbout}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 44 }}>
        <Icon name="info" size={20} color={colors.muted} />
        <AppText style={{ flex: 1, fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 21 }}>
          About Mahagathe · Contact on WhatsApp
        </AppText>
        <Icon name="chevronRight" size={18} color={colors.muted} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

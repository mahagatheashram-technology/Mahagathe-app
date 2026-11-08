import { Alert, Pressable } from 'react-native';
import { AppText, Icon } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';

/** The quieter Welcome selector retains the existing language availability notice. */
export function LanguagePill({ dark = false }: { dark?: boolean }) {
  const color = dark ? colors.onDark2 : colors.textSecondary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Language: English. Change language"
      onPress={() => Alert.alert('Languages', 'Hindi and Telugu are coming soon. English is available now.')}
      style={({ pressed }) => ({
        height: 44,
        paddingHorizontal: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        opacity: pressed ? 0.7 : 1,
      })}>
      <Icon name="globe" size={dark ? 18 : 16} color={color} strokeWidth={1.8} />
      <AppText style={{ fontFamily: dark ? fonts.ui : fonts.sansMedium, fontSize: dark ? 15 : 14, lineHeight: 23, color }}>
        English
      </AppText>
      <Icon name="chevronDown" size={dark ? 16 : 14} color={color} strokeWidth={2.2} />
    </Pressable>
  );
}

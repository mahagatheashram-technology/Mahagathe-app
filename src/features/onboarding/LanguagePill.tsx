import { Alert, Pressable } from 'react-native';
import { AppText, Icon } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';

/** The quieter Welcome selector retains the existing language availability notice. */
export function LanguagePill() {
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
      <Icon name="globe" size={16} color={colors.textSecondary} strokeWidth={1.8} />
      <AppText style={{ fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 21, color: colors.textSecondary }}>
        English
      </AppText>
      <Icon name="chevronDown" size={14} color={colors.textSecondary} strokeWidth={2.2} />
    </Pressable>
  );
}

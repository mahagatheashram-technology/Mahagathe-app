import { Alert, Pressable, Text } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';
import { LANGUAGES } from './languageStore';

/** "English · తెలుగు · हिंदी" pill. Tap cycles the language; the current one is set in the heavier weight. */
export function LanguagePill() {
  const language = 'en';
  const currentName = LANGUAGES.find((l) => l.value === language)?.name ?? 'English';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Change language, current ${currentName}. Hindi and Telugu coming soon`}
      onPress={() => Alert.alert('Languages', 'Hindi and Telugu are coming soon. English is available now.')}
      style={({ pressed }) => ({
        minHeight: 44,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.onFeaturePillBorder,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}>
      <AppText style={{ fontSize: 13, lineHeight: 20, color: colors.white, fontFamily: fonts.sansMedium }}>
        {LANGUAGES.map((l, i) => (
          <Text key={l.value}>
            {i > 0 ? ' · ' : ''}
            <Text style={{ fontFamily: l.value === language ? fonts.sansSemibold : fonts.sansMedium }}>{l.label}</Text>
          </Text>
        ))}
      </AppText>
    </Pressable>
  );
}

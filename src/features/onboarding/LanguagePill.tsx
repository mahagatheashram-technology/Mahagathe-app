import { Pressable, Text } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';
import { LANGUAGES, useLanguagePref } from './languageStore';

/** "English · తెలుగు · हिंदी" pill. Tap cycles the language; the current one is set in the heavier weight. */
export function LanguagePill() {
  const { language, cycle } = useLanguagePref();
  const currentName = LANGUAGES.find((l) => l.value === language)?.name ?? 'English';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Change language, current ${currentName}`}
      onPress={cycle}
      style={({ pressed }) => ({
        height: 40,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.45)',
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

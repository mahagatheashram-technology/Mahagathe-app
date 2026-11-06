import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, Chip, Icon } from '@/components/ui';
import { THEME_LABELS, type Vakyam } from '@/data';
import { colors, fonts } from '@/theme/tokens';

/** Calm list card for a Vākyam: Lora quote, Verbatim/Paraphrase chip (W-03), theme label. */
export function VakyamListCard({ vakyam, showTheme }: { vakyam: Vakyam; showTheme?: boolean }) {
  const router = useRouter();
  const kind = vakyam.verbatim ? 'Verbatim teaching' : 'Paraphrase';
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${vakyam.text}. ${kind}${showTheme ? `, ${THEME_LABELS[vakyam.theme]}` : ''}`}
      onPress={() => router.push(`/vakyam/${vakyam.id}`)}
      style={({ pressed }) => pressed && { opacity: 0.85 }}>
      <Card radius={18} style={styles.card}>
        <AppText style={styles.quote}>“{vakyam.text}”</AppText>
        <View style={styles.row}>
          <View style={styles.chips}>
            <Chip
              label={kind}
              icon={vakyam.verbatim ? 'shieldCheck' : undefined}
              variant={vakyam.verbatim ? 'sand' : 'dashed'}
            />
            {showTheme ? (
              <AppText style={styles.theme}>{THEME_LABELS[vakyam.theme]}</AppText>
            ) : null}
          </View>
          <Icon name="chevronRight" size={18} color={colors.muted} strokeWidth={2.2} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, gap: 14 },
  quote: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 29, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  theme: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18, color: colors.muted },
});

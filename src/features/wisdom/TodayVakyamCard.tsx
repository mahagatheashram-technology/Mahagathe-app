import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Icon, RedFeature } from '@/components/ui';
import { THEME_LABELS, type Vakyam } from '@/data';
import { colors, fonts } from '@/theme/tokens';

/** The single red feature block of the Wisdom screen. */
export function TodayVakyamCard({ vakyam }: { vakyam: Vakyam }) {
  const router = useRouter();
  const kind = vakyam.verbatim ? 'Verbatim' : 'Paraphrase';
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Today's Guru Vākyam: ${vakyam.text}. ${kind}, ${THEME_LABELS[vakyam.theme]}. Read`}
      onPress={() => router.push(`/vakyam/${vakyam.id}`)}
      style={({ pressed }) => pressed && { opacity: 0.92 }}>
      <RedFeature style={styles.card}>
        <AppText style={styles.eyebrow}>Today&apos;s Guru Vākyam</AppText>
        <AppText style={styles.quote}>“{vakyam.text}”</AppText>
        <View style={styles.row}>
          <AppText style={styles.meta}>
            {kind} · {THEME_LABELS[vakyam.theme]}
          </AppText>
          <View style={styles.read}>
            <AppText style={styles.readLabel}>Read</AppText>
            <Icon name="chevronRight" size={15} color={colors.actionRed} strokeWidth={2.2} />
          </View>
        </View>
      </RedFeature>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, padding: 22, borderRadius: 24 },
  eyebrow: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 1.68,
    textTransform: 'uppercase',
    color: colors.onFeatureMuted,
  },
  quote: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 33.12, color: colors.white },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  meta: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18, color: colors.onFeatureMuted },
  read: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.white,
  },
  readLabel: { fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 19, color: colors.actionRed },
});

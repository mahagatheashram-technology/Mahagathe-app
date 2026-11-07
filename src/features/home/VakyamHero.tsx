import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, ApprovedPhotoPlaceholder, Icon, RedFeature } from '@/components/ui';
import { Emblem } from '@/components/ui/Emblem';
import { useStatusBarInset } from '@/components/ui/useStatusBarInset';
import { THEME_LABELS, useProfile, type Vakyam } from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { formatLongDate, greetingFor } from './format';
import { Skeleton } from './Skeleton';

/** The one red feature block on Home: header, greeting, today's Guru Vākyam (H-01, H-05). */
export function VakyamHero({ vakyam, now }: { vakyam: Vakyam | null | undefined; now: Date }) {
  const router = useRouter();
  const top = useStatusBarInset();
  const profile = useProfile();
  const name = profile?.displayName?.trim();
  const greeting = name ? `${greetingFor(now)}, ${name}` : greetingFor(now);

  return (
    <RedFeature style={{ paddingTop: top, paddingHorizontal: 20, paddingBottom: 70, gap: 20 }} accessibilityLabel="Today's Guru Vākyam">
      <View style={styles.headerRow}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Emblem width={20} />
          </View>
          <AppText style={styles.brandName}>Mahagathe</AppText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push('/profile')}
          style={({ pressed }) => [styles.bell, pressed && { opacity: 0.8 }]}>
          <Icon name="bell" size={20} color={colors.white} />
        </Pressable>
      </View>

      <View style={{ gap: 2 }}>
        <AppText style={styles.date}>{formatLongDate(now)}</AppText>
        <AppText accessibilityRole="header" style={styles.greeting}>
          {greeting}
        </AppText>
      </View>

      {vakyam === undefined ? (
        <View style={styles.vakyam}>
          <Skeleton height={48} width={240} radius={24} onRed />
          <Skeleton height={36} onRed />
          <Skeleton height={36} width="70%" onRed />
        </View>
      ) : vakyam === null ? (
        <View style={styles.vakyam}>
          <AppText style={{ fontFamily: fonts.serif, fontSize: 20, lineHeight: 28, color: colors.white }}>
            Today’s Guru Vākyam will appear here soon.
          </AppText>
        </View>
      ) : (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Today's Guru Vākyam: ${vakyam.text}. Read meaning`}
          onPress={() => router.push(`/vakyam/${vakyam.id}`)}
          style={styles.vakyam}>
          <View style={styles.attribution}>
            <ApprovedPhotoPlaceholder onRed />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText style={styles.eyebrow}>{"Today's Guru Vākyam"}</AppText>
              {vakyam.attribution ? <AppText style={styles.guru}>{vakyam.attribution}</AppText> : null}
            </View>
          </View>
          <AppText style={styles.quote}>“{vakyam.text}”</AppText>
          <View style={styles.footer}>
            <View style={styles.verbatim}>
              <Icon name={vakyam.verbatim ? 'shieldCheck' : 'info'} size={14} color={colors.onFeatureMuted} />
              <AppText style={styles.verbatimText}>
                {vakyam.verbatim ? 'Verbatim' : 'Paraphrase'} · {THEME_LABELS[vakyam.theme]}
              </AppText>
            </View>
            <View style={styles.readBtn}>
              <AppText style={styles.readText}>Read meaning</AppText>
              <Icon name="chevronRight" size={15} color={colors.actionRed} strokeWidth={2.2} />
            </View>
          </View>
        </Pressable>
      )}
    </RedFeature>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: { fontFamily: fonts.serifSemibold, fontSize: 22, lineHeight: 28, color: colors.white },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.onFeatureOutline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 19.5, color: colors.onFeatureMuted },
  greeting: { fontFamily: fonts.serifMedium, fontSize: 28, lineHeight: 35.5, color: colors.white },
  vakyam: { gap: 16, paddingTop: 18, borderTopWidth: 1, borderTopColor: colors.onFeatureDivider },
  attribution: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  eyebrow: {
    fontFamily: fonts.sansSemibold,
    fontSize: 12,
    lineHeight: 17.5,
    letterSpacing: 1.68,
    textTransform: 'uppercase',
    color: colors.onFeatureMuted,
  },
  guru: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 19.5, color: colors.white },
  quote: { fontFamily: fonts.serif, fontSize: 27, lineHeight: 36.72, color: colors.white },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  verbatim: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  verbatimText: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18, color: colors.onFeatureMuted },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.white,
  },
  readText: { fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 19.5, color: colors.actionRed },
});

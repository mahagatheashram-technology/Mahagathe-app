import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText, ApprovedPhotoPlaceholder, Button, Card, Chip, DetailHeader, Icon, Screen } from '@/components/ui';
import { useStatusBarInset, useScreenInsets } from '@/components/ui/useStatusBarInset';
import { THEME_LABELS, useSavedVakyam, useVakyam, useSession } from '@/data';
import { formatLongDate, parseCalendarDate } from '@/features/home/format';
import { ReportSheet } from '@/features/home/ReportSheet';
import { Skeleton } from '@/features/home/Skeleton';
import { colors, fonts } from '@/theme/tokens';

export default function VakyamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const vakyam = useVakyam(id);
  const { isSaved, toggle } = useSavedVakyam(id ?? '');
  const { status, canUsePersonalFeatures } = useSession();
  const [saveError, setSaveError] = useState(false);
  const [reporting, setReporting] = useState(false);
  const top = useStatusBarInset();
  const insets = useScreenInsets();

  const content = {
    gap: 22,
    paddingHorizontal: 24,
    paddingTop: top, // mock: 52 = status bar
    paddingBottom: Math.max(28, insets.bottom),
  } as const;

  if (vakyam === undefined) {
    return (
      <Screen edgeToEdgeTop contentStyle={content}>
        <DetailHeader />
        {saveError ? <AppText accessibilityLiveRegion="polite" color={colors.actionRed}>We could not save this Vākyam. Please try again.</AppText> : null}
      <View style={{ gap: 18, paddingTop: 8 }}>
          <Skeleton width={240} height={48} radius={24} />
          <Skeleton height={42} />
          <Skeleton height={42} width="80%" />
        </View>
      </Screen>
    );
  }

  if (vakyam === null) {
    return (
      <Screen edgeToEdgeTop contentStyle={content}>
        <DetailHeader />
        <View style={{ gap: 8, paddingTop: 8 }}>
          <AppText variant="section">We could not find this Vākyam</AppText>
          <AppText variant="bodyLarge" color={colors.muted}>
            It may have been withdrawn after review. Please go back and choose another.
          </AppText>
        </View>
        <View style={{ flexGrow: 1 }} />
        <Button label="Back to Home" onPress={() => router.replace('/(tabs)')} />
      </Screen>
    );
  }

  const share = async () => {
    try {
      await Share.share({
        message: `“${vakyam.text}”${vakyam.attribution ? `\n— ${vakyam.attribution}` : ''}\n\nShared from the Mahagathe app`,
      });
    } catch {
      // Share sheet dismissed or unavailable (web): nothing to do.
    }
  };

  return (
    <Screen edgeToEdgeTop contentStyle={content}>
      <DetailHeader
        label={formatLongDate(parseCalendarDate(vakyam.date))}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isSaved ? 'Remove from saved' : 'Save'}
            accessibilityState={{ selected: isSaved }}
            onPress={async () => {
              if (!canUsePersonalFeatures) { router.push(status === 'signedIn' ? '/setup' : '/welcome'); return; }
              setSaveError(false);
              try { await toggle(); } catch { setSaveError(true); }
            }}
            style={styles.bookmark}>
            <Svg width={20} height={20} viewBox="0 0 24 24">
              <Path
                d="M6 3h12v18l-6-4-6 4z"
                fill={isSaved ? colors.actionRed : 'none'}
                stroke={isSaved ? colors.actionRed : colors.ink}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        }
      />

      {saveError ? <AppText accessibilityLiveRegion="polite" color={colors.actionRed}>We could not save this Vākyam. Please try again.</AppText> : null}
      <View style={{ gap: 18, paddingTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <ApprovedPhotoPlaceholder />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="eyebrow" style={{ letterSpacing: 1.68, lineHeight: 17.5 }}>
              Guru Vākyam · {THEME_LABELS[vakyam.theme]}
            </AppText>
            {vakyam.attribution ? (
              <AppText variant="label" style={{ fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 19.5 }}>
                {vakyam.attribution}
              </AppText>
            ) : null}
          </View>
        </View>
        <AppText accessibilityRole="header" style={styles.quote}>
          “{vakyam.text}”
        </AppText>
        {vakyam.verbatim ? (
          <Chip label="Verbatim teaching" icon="shieldCheck" />
        ) : (
          <Chip label="Paraphrase" variant="dashed" />
        )}
      </View>

      <View style={styles.simple}>
        <AppText variant="overline" style={{ lineHeight: 19.5 }}>
          In simple words
        </AppText>
        <AppText variant="bodyLarge" style={{ lineHeight: 27.2 }}>
          {vakyam.meaning}
        </AppText>
      </View>

      <Card
        accessibilityLabel="Source"
        radius={16}
        style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 14, paddingHorizontal: 16 }}>
        <View style={{ marginTop: 2 }}>
          <Icon name="wisdom" size={20} color={colors.actionRed} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="label" style={{ lineHeight: 21 }}>
            Source: {vakyam.source.title}
          </AppText>
          <AppText variant="caption" style={{ lineHeight: 18 }}>
            {vakyam.source.detail}
          </AppText>
        </View>
      </Card>

      <View style={{ flexGrow: 1 }} />

      <Button
        label="Share as image"
        fontSize={15}
        icon={<Icon name="share" size={18} color={colors.white} strokeWidth={2.2} />}
        onPress={share}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Report a wrong source or text"
        onPress={() => canUsePersonalFeatures ? setReporting(true) : router.push(status === 'signedIn' ? '/setup' : '/welcome')}
        style={styles.report}>
        <Icon name="flag" size={15} color={colors.muted} />
        <AppText variant="meta" style={{ lineHeight: 20 }}>
          Report a wrong source or text
        </AppText>
      </Pressable>

      <ReportSheet contentId={vakyam.id} visible={reporting} onClose={() => setReporting(false)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bookmark: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  quote: { fontFamily: fonts.serifMedium, fontSize: 32, lineHeight: 42.24, color: colors.ink },
  simple: { gap: 8, paddingTop: 18, borderTopWidth: 1, borderTopColor: colors.border },
  report: {
    alignSelf: 'center',
    height: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

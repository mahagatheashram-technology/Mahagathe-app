import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText, BottomSheet, Button, DetailHeader, Icon, Screen } from '@/components/ui';
import { THEME_LABELS, usePractices, useSavedVakyam, useSession, useVakyam } from '@/data';
import { ReportSheet } from '@/features/home/ReportSheet';
import { colors, fonts } from '@/theme/tokens';
import { v12 } from '@/theme/v12';

export function VakyamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const vakyam = useVakyam(id);
  const { isSaved, toggle } = useSavedVakyam(id ?? '');
  const { status, canUsePersonalFeatures } = useSession();
  const practices = usePractices();
  const practice = practices?.find((p) => p.access === 'free');
  const [saveError, setSaveError] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const gate = () => router.push(status === 'signedIn' ? '/setup' : '/welcome');
  const save = async () => {
    if (!canUsePersonalFeatures) {
      gate();
      return;
    }
    setSaveError(false);
    try {
      await toggle();
    } catch {
      setSaveError(true);
    }
  };
  const share = async () => {
    if (!vakyam) return;
    try {
      await Share.share({
        message: `“${vakyam.text}”${vakyam.attribution ? `\n— ${vakyam.attribution}` : ''}\n\nShared from the Mahagathe app`,
      });
    } catch {
      /* Share dismissed or unavailable. */
    }
  };
  return (
    <Screen contentStyle={{ paddingTop: 4, paddingHorizontal: 24, paddingBottom: 40 }}>
      <DetailHeader
        backLabel="Home"
        backHref="/(tabs)"
        trailing={
          vakyam ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isSaved ? 'Remove from saved' : 'Save'}
              accessibilityState={{ selected: isSaved }}
              onPress={save}
              style={{
                minHeight: 44,
                paddingHorizontal: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}>
              <Svg width={18} height={18} viewBox="0 0 24 24">
                <Path
                  d="M6 3h12v18l-6-4-6 4z"
                  fill={isSaved ? colors.actionRed : 'none'}
                  stroke={isSaved ? colors.actionRed : colors.ink}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23 }}>
                {isSaved ? 'Saved' : 'Save'}
              </AppText>
            </Pressable>
          ) : undefined
        }
      />
      {!vakyam ? (
        <AppText style={{ marginTop: 36 }}>
          {vakyam === undefined
            ? 'Loading today’s teaching…'
            : 'This teaching is not available. Please choose another from Wisdom.'}
        </AppText>
      ) : (
        <View style={{ paddingTop: 36, gap: 24 }}>
          {saveError ? (
            <AppText accessibilityLiveRegion="polite" color={colors.actionRed}>
              We could not save this teaching. Please try again.
            </AppText>
          ) : null}
          <AppText
            style={{
              fontFamily: fonts.sansSemibold,
              fontSize: 12,
              lineHeight: 18,
              letterSpacing: 1.44,
              textTransform: 'uppercase',
              color: v12.label,
            }}>
            Today’s teaching · {THEME_LABELS[vakyam.theme]}
          </AppText>
          <AppText
            accessibilityRole="header"
            style={{ fontFamily: fonts.serifMedium, fontSize: 29, lineHeight: 40.02 }}>
            “{vakyam.text}”
          </AppText>
          <AppText style={{ fontSize: 14, lineHeight: 21, color: v12.muted }}>
            {vakyam.verbatim ? 'Gurudev’s own words' : 'Paraphrase'}
          </AppText>
          <View style={{ paddingTop: 22, borderTopWidth: 1, borderTopColor: v12.divider, gap: 8 }}>
            <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23 }}>
              In simple words
            </AppText>
            <AppText style={{ fontSize: 17, lineHeight: 28.9 }}>{vakyam.meaning}</AppText>
          </View>
          <View style={{ paddingTop: 8, gap: 6 }}>
            <Button
              label="Sit with it · 7 minutes"
              icon={<Icon name="play" size={18} color={colors.white} />}
              disabled={canUsePersonalFeatures && !practice}
              onPress={() =>
                canUsePersonalFeatures && practice ? router.push(`/player/${practice.id}`) : gate()
              }
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 28 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share teaching"
                onPress={share}
                style={{ minHeight: 44, justifyContent: 'center' }}>
                <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, color: v12.muted }}>
                  Share
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Source"
                onPress={() => setSourceOpen(true)}
                style={{ minHeight: 44, justifyContent: 'center' }}>
                <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, color: v12.muted }}>
                  Source
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      )}
      {vakyam ? (
        <>
          <BottomSheet visible={sourceOpen} onClose={() => setSourceOpen(false)} title="Source">
            <AppText variant="section">{vakyam.source.title}</AppText>
            <AppText style={{ marginTop: 12 }}>{vakyam.source.detail}</AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Report a wrong source or text"
              style={{ minHeight: 44, justifyContent: 'center', marginTop: 16 }}
              onPress={() => {
                setSourceOpen(false);
                if (canUsePersonalFeatures) setReporting(true);
                else gate();
              }}>
              <AppText color={v12.muted}>Report a wrong source or text</AppText>
            </Pressable>
          </BottomSheet>
          <ReportSheet contentId={vakyam.id} visible={reporting} onClose={() => setReporting(false)} />
        </>
      ) : null}
    </Screen>
  );
}

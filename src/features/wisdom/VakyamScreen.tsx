import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Share, View } from 'react-native';
import { BackPill, BottomSheet, Icon, LeafBand, PrimaryButton, TextLink } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { THEME_LABELS, usePractices, useSession, useVakyam, useVakyamsByTheme } from '@/data';
import { ReportSheet } from '@/features/home/ReportSheet';
import { fonts, v14Colors as c } from '@/theme/tokens';
import {
  Attribution,
  LibraryHeading,
  LibraryPage,
  LibraryRow,
  LibraryText,
  wordDate,
} from './Library';
import { SaveVakyam } from './SaveVakyam';
import { VakyamListCard } from './VakyamListCard';

export function VakyamScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useScreenInsets();
  const vakyam = useVakyam(id);
  const related = useVakyamsByTheme(vakyam?.theme ?? 'inner-life');
  const session = useSession();
  const practices = usePractices();
  const practice = practices?.find((p) => p.access === 'free');
  const [reporting, setReporting] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const gate = () => router.push(session.status === 'signedIn' ? '/setup' : '/welcome');
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
    <LibraryPage>
      <LeafBand style={{ paddingTop: insets.top + 2, paddingHorizontal: 16, paddingBottom: 30 }}>
        <View
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <BackPill destination="Wisdom" onPress={() => router.dismissTo('/(tabs)/wisdom')} />
          {vakyam && <SaveVakyam id={vakyam.id} />}
        </View>
        {vakyam ? (
          <View style={{ paddingTop: 26, paddingHorizontal: 10 }}>
            <LibraryText style={{ fontSize: 15, lineHeight: 23.25, color: c.darkLeaf }}>
              {THEME_LABELS[vakyam.theme]}, {wordDate(vakyam.date)}
            </LibraryText>
            <LibraryHeading
              size={36}
              style={{ fontFamily: fonts.displayMedium, lineHeight: 45, marginTop: 10 }}
            >
              “{vakyam.text}”
            </LibraryHeading>
            <View style={{ marginTop: 16 }}>
              <Attribution color={c.ink}>
                {vakyam.verbatim ? 'Mahamuni’s own words' : 'Paraphrase of Mahamuni’s teaching'}
              </Attribution>
            </View>
          </View>
        ) : (
          <LibraryText style={{ padding: 26 }}>
            {vakyam === undefined ? 'Loading Vākyam…' : 'This Vākyam is not available yet.'}
          </LibraryText>
        )}
      </LeafBand>
      {vakyam && (
        <>
          <View style={{ paddingTop: 26, paddingHorizontal: 26 }}>
            <LibraryHeading>In simple words</LibraryHeading>
            <LibraryText style={{ marginTop: 8, fontSize: 17, lineHeight: 27.2 }}>
              {vakyam.meaning}
            </LibraryText>
          </View>
          <View style={{ paddingTop: 22, paddingHorizontal: 26, flexDirection: 'row', gap: 22 }}>
            <TextLink
              label="Share"
              icon={<Icon name="share" size={20} color={c.ink} />}
              onPress={share}
              style={{ flexShrink: 0 }}
            />
            <TextLink
              label="Source and report"
              color={c.text2}
              onPress={() => setSourceOpen(true)}
            />
          </View>
          <View style={{ paddingTop: 30, paddingHorizontal: 26 }}>
            <LibraryHeading size={19}>
              More on {THEME_LABELS[vakyam.theme].toLowerCase()}
            </LibraryHeading>
            {vakyam.related?.length ? (
              vakyam.related.map((preview, i) => (
                <LibraryRow
                  key={preview.id ?? i}
                  label={
                    preview.id
                      ? `Read Vākyam: ${preview.text}`
                      : `Browse more on ${THEME_LABELS[vakyam.theme].toLowerCase()}`
                  }
                  onPress={() =>
                    router.push(
                      preview.id ? `/vakyam/${preview.id}` : `/wisdom-theme/${vakyam.theme}`,
                    )
                  }
                  style={{ paddingVertical: 12, borderTopWidth: 1, borderColor: c.line }}
                >
                  <LibraryText
                    style={{ fontFamily: fonts.display, fontSize: 18, lineHeight: 25.2 }}
                  >
                    “{preview.text}”
                  </LibraryText>
                  <LibraryText
                    style={{ marginTop: 2, fontSize: 14, lineHeight: 21.7, color: c.text2 }}
                  >
                    {wordDate(preview.date)}
                  </LibraryText>
                </LibraryRow>
              ))
            ) : related === undefined ? (
              <LibraryText>Loading related Vākyams…</LibraryText>
            ) : (
              related
                .filter((v) => v.id !== vakyam.id)
                .slice(0, 2)
                .map((v) => <VakyamListCard key={v.id} vakyam={v} save={false} showTheme={false} />)
            )}
          </View>
          <View
            style={{ paddingTop: 26, paddingHorizontal: 16, paddingBottom: 40, marginTop: 'auto' }}
          >
            <PrimaryButton
              label="Sit with it, 7 minutes"
              onPress={() =>
                session.canUsePersonalFeatures
                  ? practice
                    ? router.push(`/player/${practice.id}`)
                    : router.push('/(tabs)/practice')
                  : gate()
              }
            />
          </View>
          <BottomSheet
            visible={sourceOpen}
            onClose={() => setSourceOpen(false)}
            title="Source and report"
          >
            <LibraryHeading>{vakyam.source.title}</LibraryHeading>
            <LibraryText>{vakyam.source.detail}</LibraryText>
            <TextLink
              label="Report a wrong source or text"
              onPress={() => {
                setSourceOpen(false);
                if (session.canUsePersonalFeatures) setReporting(true);
                else gate();
              }}
            />
          </BottomSheet>
          <ReportSheet
            contentId={vakyam.id}
            visible={reporting}
            onClose={() => setReporting(false)}
          />
        </>
      )}
    </LibraryPage>
  );
}

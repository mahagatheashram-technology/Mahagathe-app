import { useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { BackPill, BottomSheet, PortraitHeader, ReviewTag, TextLink } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { useParampara } from '@/data';
import { fonts, v14Colors as c } from '@/theme/tokens';
import { LibraryHeading, LibraryPage, LibraryText } from '@/features/wisdom/Library';

export function ParamparaScreen() {
  const content = useParampara();
  const router = useRouter();
  const insets = useScreenInsets();
  const [all, setAll] = useState(false);
  const lineage = content?.lineage.slice().reverse();
  return (
    <LibraryPage contentStyle={{ paddingBottom: 36 }}>
      <PortraitHeader
        titleSlot={
          <>
            <LibraryText style={{ color: c.photoText, fontSize: 15, lineHeight: 23.25 }}>
              Seventieth Mahādhibhū of the Rudra Sampradāya
            </LibraryText>
            <LibraryHeading size={34} style={{ marginTop: 2, color: c.white, lineHeight: 37.4 }}>
              Most Venerable Mahamuni
            </LibraryHeading>
          </>
        }
      >
        <View style={{ position: 'absolute', top: insets.top + 2, left: 16 }}>
          <BackPill dark destination="Wisdom" onPress={() => router.dismissTo('/(tabs)/wisdom')} />
        </View>
      </PortraitHeader>
      {content ? (
        <>
          <LibraryText
            style={{ paddingTop: 22, paddingHorizontal: 24, fontSize: 17, lineHeight: 27.2 }}
          >
            {content.guru.bio}
          </LibraryText>
          <View style={{ paddingTop: 26, paddingHorizontal: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'space-between',
              }}
            >
              <LibraryHeading>The Paramparā</LibraryHeading>
              <TextLink label="All seventy" onPress={() => setAll(true)} />
            </View>
            <View style={{ marginTop: 6 }}>
              {lineage?.map((person, i) => (
                <View
                  key={person.label}
                  style={{
                    flexDirection: 'row',
                    gap: 14,
                    alignItems: 'center',
                    paddingVertical: 13,
                    borderTopWidth: i ? 1 : 0,
                    borderColor: c.line,
                  }}
                >
                  <LibraryText
                    style={{
                      width: 34,
                      fontFamily: fonts.displaySemibold,
                      fontSize: 19,
                      color: c.laterite,
                    }}
                  >
                    {person.label.match(/^\d+/)?.[0] ?? '1'}
                  </LibraryText>
                  <View style={{ flex: 1 }}>
                    <LibraryText
                      style={{
                        fontFamily: person.present ? fonts.displaySemibold : fonts.display,
                        fontSize: 18,
                        lineHeight: 27.9,
                      }}
                    >
                      {person.present
                        ? 'Mahamuni'
                        : person.label.startsWith('Founding')
                          ? '[The founding ācārya]'
                          : person.name}
                    </LibraryText>
                    <LibraryText style={{ fontSize: 14, lineHeight: 21.7, color: c.text2 }}>
                      {person.present ? 'The present Mahādhibhū' : '[Years]'}
                    </LibraryText>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : (
        <LibraryText style={{ margin: 24 }}>
          {content === undefined
            ? 'Loading Paramparā…'
            : 'The Paramparā will appear here once approved.'}
        </LibraryText>
      )}
      <BottomSheet
        visible={all}
        onClose={() => setAll(false)}
        title="All seventy heads of the Paramparā"
      >
        <ReviewTag label="Paramparā names awaiting approval" />
        <LibraryText>
          The full list will appear here once approved by the content authority.
        </LibraryText>
        {lineage?.map((p) => (
          <View key={p.label}>
            <LibraryHeading size={18}>{p.label}</LibraryHeading>
            <LibraryText>{p.name}</LibraryText>
          </View>
        ))}
      </BottomSheet>
    </LibraryPage>
  );
}

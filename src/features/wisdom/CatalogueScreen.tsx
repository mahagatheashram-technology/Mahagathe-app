import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { THEME_LABELS, useVakyamCatalogue, useVakyamThemes, type VakyamTheme } from '@/data';
import { fonts, v14Colors as c } from '@/theme/tokens';
import { LibraryHeader, LibraryHeading, LibraryPage, LibraryText } from './Library';
import { SearchField } from './SearchField';
import { VakyamListCard } from './VakyamListCard';

export function CatalogueScreen({ initialTheme }: { initialTheme?: VakyamTheme }) {
  const [theme, setTheme] = useState<VakyamTheme | undefined>(initialTheme);
  const catalogue = useVakyamCatalogue(theme);
  const themes = useVakyamThemes();
  const count = themes?.reduce((n, t) => n + t.count, 0);
  return (
    <LibraryPage contentStyle={{ paddingBottom: 36 }}>
      <LibraryHeader style={{ paddingBottom: 18 }}>
        <LibraryHeading size={30} style={{ marginTop: 14, marginHorizontal: 8, marginBottom: 2 }}>
          Mahamuni’s words
        </LibraryHeading>
        <LibraryText
          style={{
            marginHorizontal: 8,
            marginBottom: 14,
            color: c.darkLeaf,
            fontSize: 15,
            lineHeight: 23.25,
          }}
        >
          {count ?? '…'} Vākyams, newest first. Each one reviewed by the content authority.
        </LibraryText>
        <View style={{ marginHorizontal: 4 }}>
          <SearchField />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 14, marginHorizontal: 4 }}
          contentContainerStyle={{ gap: 8 }}
          accessibilityRole="radiogroup"
          accessibilityLabel="Theme"
        >
          {([undefined, ...Object.keys(THEME_LABELS)] as (VakyamTheme | undefined)[]).map((t) => (
            <Pressable
              key={t ?? 'all'}
              accessibilityRole="radio"
              accessibilityLabel={t ? THEME_LABELS[t] : 'All themes'}
              accessibilityState={{ checked: theme === t }}
              aria-checked={theme === t}
              onPress={() => setTheme(t)}
              style={{
                minHeight: 44,
                paddingHorizontal: 14,
                borderRadius: 22,
                justifyContent: 'center',
                backgroundColor: theme === t ? c.ink : 'transparent',
                borderWidth: theme === t ? 0 : 1.5,
                borderColor: c.leafEdge,
              }}
            >
              <LibraryText
                style={{
                  fontFamily: fonts.uiSemibold,
                  fontSize: 15,
                  color: theme === t ? c.white : c.ink,
                }}
              >
                {t ? THEME_LABELS[t] : 'All'}
              </LibraryText>
            </Pressable>
          ))}
        </ScrollView>
      </LibraryHeader>
      {catalogue === undefined ? (
        <LibraryText style={{ margin: 24 }}>Loading Vākyams…</LibraryText>
      ) : catalogue.length === 0 ? (
        <LibraryText style={{ margin: 24 }}>No Vākyams in this theme yet.</LibraryText>
      ) : (
        catalogue.map((month, i) => (
          <View key={month.month} style={{ paddingHorizontal: 24, paddingTop: i === 0 ? 22 : 18 }}>
            <LibraryHeading size={18} style={{ marginBottom: 4, color: c.text2 }}>
              {month.label}
            </LibraryHeading>
            {month.vakyams.map((v, j) => (
              <VakyamListCard key={v.id} vakyam={v} first={j === 0} />
            ))}
          </View>
        ))
      )}
    </LibraryPage>
  );
}

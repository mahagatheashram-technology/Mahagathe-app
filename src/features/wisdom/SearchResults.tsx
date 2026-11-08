import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Leaf } from '@/components/ui';
import { useSeasons, useWisdomSearch } from '@/data';
import { fonts, v14Colors as c } from '@/theme/tokens';
import { LibraryHeading, LibraryRow, LibraryText } from './Library';
import { VakyamListCard } from './VakyamListCard';

export function SearchResults({ query }: { query: string }) {
  const router = useRouter();
  const results = useWisdomSearch(query);
  const seasons = useSeasons();
  if (!query.trim())
    return (
      <LibraryText style={{ margin: 24 }}>Search for a word, a theme, or a question.</LibraryText>
    );
  if (results === undefined)
    return (
      <LibraryText style={{ margin: 24 }} accessibilityLiveRegion="polite">
        Searching…
      </LibraryText>
    );
  if (!results.vakyams.length && !results.episodes.length)
    return (
      <View style={{ padding: 24, gap: 8 }} accessibilityLiveRegion="polite">
        <LibraryHeading>Nothing found for “{query.trim()}”</LibraryHeading>
        <LibraryText style={{ color: c.text2 }}>
          Try another word. Spelling without accents works too, like “vakyam” or “adi”.
        </LibraryText>
      </View>
    );
  return (
    <View accessibilityLiveRegion="polite">
      {results.vakyams.length > 0 && (
        <View style={{ paddingTop: 22, paddingHorizontal: 24 }}>
          <LibraryHeading style={{ marginBottom: 4 }}>Closest in meaning</LibraryHeading>
          {results.vakyams.map((v, i) => (
            <VakyamListCard key={v.id} vakyam={v} first={i === 0} />
          ))}
        </View>
      )}
      {results.episodes.length > 0 && (
        <View style={{ paddingTop: 22, paddingHorizontal: 16, gap: 12 }}>
          <LibraryHeading style={{ marginHorizontal: 8 }}>From the series</LibraryHeading>
          {results.episodes.map((e) => (
            <LibraryRow
              key={e.id}
              label={`${e.seasonTitle}, episode ${e.number}: ${e.title}`}
              onPress={() => router.push(`/episode/${e.id}`)}
            >
              <Leaf holes>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <LibraryText
                    style={{
                      width: 66,
                      textAlign: 'center',
                      fontFamily: fonts.display,
                      fontSize: 30,
                      lineHeight: 30,
                      color: c.laterite,
                    }}
                  >
                    {seasons?.find((s) => s.id === e.seasonId)?.devanagari}
                  </LibraryText>
                  <View style={{ flex: 1 }}>
                    <LibraryText style={{ fontSize: 14, lineHeight: 21.7, color: c.darkLeaf }}>
                      The Mahabharata, episode {e.number}
                    </LibraryText>
                    <LibraryHeading size={19} style={{ lineHeight: 23.75 }}>
                      {e.title}
                    </LibraryHeading>
                  </View>
                </View>
              </Leaf>
            </LibraryRow>
          ))}
        </View>
      )}
    </View>
  );
}

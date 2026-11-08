import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { TextLink } from '@/components/ui';
import { useSeasons, useVakyamThemes } from '@/data';
import { v14Colors as c } from '@/theme/tokens';
import { LibraryHeader, LibraryPage, LibraryText } from './Library';
import { SearchField } from './SearchField';
import { SearchResults } from './SearchResults';

export function SearchScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(q ?? '');
  const router = useRouter();
  const themes = useVakyamThemes();
  const seasons = useSeasons();
  const episodeCount = seasons
    ?.filter((s) => s.status === 'published')
    .reduce((n, s) => n + s.episodeCount, 0);
  const count = themes?.reduce((n, t) => n + t.count, 0);
  return (
    <LibraryPage scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <LibraryHeader>
        <View style={{ marginTop: 14, marginHorizontal: 4 }}>
          <SearchField value={query} onChangeText={setQuery} />
        </View>
        <LibraryText
          style={{
            marginTop: 10,
            marginHorizontal: 8,
            fontSize: 14,
            lineHeight: 21.7,
            color: c.darkLeaf,
          }}
        >
          Searching by meaning across {count ?? '…'} Vākyams and {episodeCount ?? '…'} episodes
        </LibraryText>
      </LibraryHeader>
      <SearchResults query={query} />
      <View
        style={{
          marginTop: 28,
          marginHorizontal: 24,
          paddingTop: 16,
          borderTopWidth: 1,
          borderColor: c.line,
        }}
      >
        <LibraryText style={{ fontSize: 15, lineHeight: 23.25, color: c.text2 }}>
          Only Mahamuni’s approved Vākyams and the published series appear here. Nothing is written
          by AI.
        </LibraryText>
        <TextLink
          label="Browse by theme instead"
          onPress={() => router.push('/teachings')}
          style={{ marginTop: 10, marginBottom: 36 }}
        />
      </View>
    </LibraryPage>
  );
}

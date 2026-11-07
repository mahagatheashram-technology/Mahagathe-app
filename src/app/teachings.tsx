import { useState } from 'react';
import { View } from 'react-native';
import { AppText, DetailHeader, Screen } from '@/components/ui';
import { useVakyamThemes } from '@/data';
import { SearchField } from '@/features/wisdom/SearchField';
import { SearchResults } from '@/features/wisdom/SearchResults';
import { ThemeTiles } from '@/features/wisdom/ThemeTiles';
import { WatchListen } from '@/features/wisdom/WatchListen';

/** Search and theme discovery live one level below the quiet Wisdom landing screen. */
export default function TeachingsScreen() {
  const [query, setQuery] = useState('');
  const themes = useVakyamThemes();
  return (
    <Screen
      contentStyle={{ paddingTop: 4, paddingHorizontal: 24, paddingBottom: 32, gap: 22 }}
      scrollProps={{ keyboardShouldPersistTaps: 'handled' }}>
      <DetailHeader backLabel="Wisdom" backHref="/(tabs)/wisdom" />
      <AppText variant="title">Past teachings</AppText>
      <SearchField value={query} onChangeText={setQuery} />
      {query.trim() ? (
        <SearchResults query={query} />
      ) : (
        <>
          <ThemeTiles themes={themes} />
          <View style={{ gap: 14, marginTop: 12 }}>
            <AppText variant="section">Watch &amp; listen</AppText>
            <WatchListen />
          </View>
        </>
      )}
    </Screen>
  );
}

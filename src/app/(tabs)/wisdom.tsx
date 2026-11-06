import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MahabharataSection } from '@/features/wisdom/MahabharataSection';
import { SearchField } from '@/features/wisdom/SearchField';
import { SearchResults } from '@/features/wisdom/SearchResults';
import { ThemeTiles } from '@/features/wisdom/ThemeTiles';
import { TodayVakyamCard } from '@/features/wisdom/TodayVakyamCard';
import { WatchListen } from '@/features/wisdom/WatchListen';
import { AppText, Screen } from '@/components/ui';
import { useTodayVakyam, useVakyamThemes } from '@/data';
import { fonts } from '@/theme/tokens';

/** WisdomV3. Readable by guests (P-01). */
export default function WisdomScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const today = useTodayVakyam();
  const themes = useVakyamThemes();
  const searching = query.trim().length > 0;

  return (
    <Screen edgeToEdgeTop scrollProps={{ keyboardShouldPersistTaps: 'handled', keyboardDismissMode: 'on-drag' }}>
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}>
        <AppText
          accessibilityRole="header"
          style={{ fontFamily: fonts.serifSemibold, fontSize: 32, lineHeight: 41 }}>
          Wisdom
        </AppText>
        <SearchField value={query} onChangeText={setQuery} />
      </View>

      {searching ? (
        <SearchResults query={query} />
      ) : (
        <>
          <View
            accessibilityLabel="Guru Vākyams"
            style={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 28, gap: 14 }}>
            {today ? <TodayVakyamCard vakyam={today} /> : null}
            <AppText
              accessibilityRole="header"
              style={{ marginTop: 10, fontFamily: fonts.serifSemibold, fontSize: 21, lineHeight: 27 }}>
              Guru Vākyams by theme
            </AppText>
            <ThemeTiles themes={themes} />
          </View>

          <MahabharataSection />

          <View style={{ paddingVertical: 28, paddingHorizontal: 20, gap: 14 }}>
            <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 21, lineHeight: 27 }}>
              Watch &amp; listen
            </AppText>
            <WatchListen />
          </View>
        </>
      )}
    </Screen>
  );
}

import { useLocalSearchParams } from 'expo-router';
import { THEME_LABELS, type VakyamTheme } from '@/data';
import { CatalogueScreen } from '@/features/wisdom/CatalogueScreen';

/** Preserves old saved links while using the v14 catalogue. */
export default function WisdomThemeScreen() {
  const { theme } = useLocalSearchParams<{ theme: string }>();
  const known = theme && theme in THEME_LABELS ? (theme as VakyamTheme) : undefined;
  return <CatalogueScreen key={known} initialTheme={known} />;
}

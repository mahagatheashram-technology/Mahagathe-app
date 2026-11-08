import { useLocalSearchParams } from 'expo-router';
import { SeriesScreen } from '@/features/wisdom/SeriesScreen';
export default function SeriesRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <SeriesScreen key={id} seriesId={id} />;
}

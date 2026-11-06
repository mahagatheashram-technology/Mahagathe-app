import { useLocalSearchParams } from 'expo-router';

import { EpisodeReader } from '@/features/wisdom/EpisodeReader';

export default function EpisodeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EpisodeReader key={id} episodeId={id ?? ''} />;
}

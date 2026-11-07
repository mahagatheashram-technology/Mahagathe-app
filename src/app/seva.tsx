import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { AppText, DetailHeader, ListRow, Screen } from '@/components/ui';
import { usePathways, useVibhagas } from '@/data';

export default function SevaScreen() {
  const router = useRouter();
  const vibhagas = useVibhagas();
  const pathways = usePathways();
  return (
    <Screen contentStyle={{ paddingTop: 4, paddingHorizontal: 24, paddingBottom: 32, gap: 22 }}>
      <DetailHeader backLabel="Sangha" backHref="/(tabs)/sangha" />
      <AppText variant="title">Offer seva</AppText>
      <View>
        {vibhagas === undefined ? (
          <AppText>Loading seva…</AppText>
        ) : !vibhagas.length ? (
          <AppText>Seva opportunities will appear here soon.</AppText>
        ) : (
          vibhagas.map((v, i) => (
            <ListRow
              key={v.id}
              icon="heart"
              title={v.name}
              subtitle={v.tagline}
              last={i === vibhagas.length - 1}
              onPress={() => router.push(`/vibhaga/${v.id}`)}
            />
          ))
        )}
      </View>
      <AppText variant="section">Pathways</AppText>
      <View>
        {pathways === undefined ? (
          <AppText>Loading pathways…</AppText>
        ) : pathways.length === 0 ? (
          <AppText>Pathways will appear here soon.</AppText>
        ) : (
          pathways.map((p, i) => (
            <ListRow
              key={p.id}
              icon="lamp"
              title={p.name}
              last={i === pathways.length - 1}
              onPress={() => router.push(`/pathway/${p.id}`)}
            />
          ))
        )}
      </View>
    </Screen>
  );
}

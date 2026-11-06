import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, Card, DetailHeader, Icon, Screen } from '@/components/ui';
import { usePathway } from '@/data';
import { openWhatsApp } from '@/features/sangha/AboutSheet';
import { colors, fonts } from '@/theme/tokens';

/** Pathway page (G-05): the vibhaga hub template, simplified. Program content is pending approval. */
export default function PathwayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pathway = usePathway(id);

  return (
    <Screen contentStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 22 }}>
      <DetailHeader />
      {!pathway ? (
        <Card style={{ padding: 20, gap: 4 }}>
          <AppText variant="label">This page is not available</AppText>
          <AppText variant="meta">Go back to Sangha to see the pathways.</AppText>
        </Card>
      ) : (
        <>
          <View style={{ gap: 4 }}>
            <AppText variant="eyebrow">Pathway</AppText>
            <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 32, lineHeight: 41 }}>
              {pathway.name}
            </AppText>
          </View>

          <View style={{ gap: 12 }}>
            <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 22, lineHeight: 28 }}>
              About this pathway
            </AppText>
            <Card radius={18} style={{ padding: 16 }}>
              <AppText style={{ lineHeight: 23 }}>{pathway.about}</AppText>
            </Card>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, padding: 16, borderRadius: 16, backgroundColor: colors.sand }}>
            <View style={{ marginTop: 2 }}>
              <Icon name="info" size={20} color={colors.actionRed} />
            </View>
            <AppText style={{ flex: 1, fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 20.8 }}>
              Dates, eligibility and how to join will be listed here once approved. Until then, ask us on WhatsApp.
            </AppText>
          </View>

          <View style={{ gap: 12 }}>
            <Button label="Ask on WhatsApp" onPress={openWhatsApp} />
            <Button label="See events" variant="outline" onPress={() => router.push('/events')} />
          </View>
        </>
      )}
    </Screen>
  );
}

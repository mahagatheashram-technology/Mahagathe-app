import { useState } from 'react';
import { View } from 'react-native';

import { AppText, Screen } from '@/components/ui';
import { AboutSheet } from '@/features/sangha/AboutSheet';
import { EventsSection } from '@/features/sangha/EventsSection';
import { GiveSection } from '@/features/sangha/GiveSection';
import { ParamparaCard } from '@/features/sangha/ParamparaCard';
import { SevaSection } from '@/features/sangha/SevaSection';
import { fonts } from '@/theme/tokens';

/** SanghaV3: Paramparā feature · Events · Our seva + Pathways · Give dāna + About. */
export default function SanghaScreen() {
  const [aboutOpen, setAboutOpen] = useState(false);
  return (
    <Screen>
      <View style={{ paddingTop: 4, paddingHorizontal: 20, paddingBottom: 24, gap: 18 }}>
        <AppText accessibilityRole="header" style={{ fontFamily: fonts.serifSemibold, fontSize: 32, lineHeight: 41 }}>
          Sangha
        </AppText>
        <ParamparaCard />
      </View>
      <EventsSection />
      <SevaSection />
      <GiveSection onAbout={() => setAboutOpen(true)} />
      <AboutSheet visible={aboutOpen} onClose={() => setAboutOpen(false)} />
    </Screen>
  );
}

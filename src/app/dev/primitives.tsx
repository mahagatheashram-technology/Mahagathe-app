/** Unlinked v14 review gallery. Screens consume only the public data contract. */
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppText, LampRing, Leaf, LeafBand, BackPill, PrimaryButton, OutlineButton, TextLink, ProgressSegments, ReviewTag, Portrait, PortraitHeader, SeriesCover, GunaRope, GunaBar, PhotoPlaceholder, TabBar, Icon } from '@/components/ui';
import { isLiveBackend, usePracticeUnlocks, useSetMockPracticeUnlock, useSession } from '@/data';
import { colors } from '@/theme/tokens';
import type { BottomTabBarProps } from 'expo-router/js-tabs';

const percents = { sattva: 34, rajas: 42, tamas: 24 };
export default function PrimitivesGallery() {
  const [count, setCount] = useState(10);
  const [tabIndex, setTabIndex] = useState(0);
  const unlocks = usePracticeUnlocks(); const toggle = useSetMockPracticeUnlock(); const session = useSession();
  const nav = { state: { index: tabIndex, routes: ['index','practice','wisdom','sangha'].map(name => ({ key: name, name })) }, navigateToTab: (key: string) => setTabIndex(['index','practice','wisdom','sangha'].indexOf(key)), insets: { top: 0, right: 0, bottom: 0, left: 0 } } as BottomTabBarProps;
  return <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: colors.limewash }} contentContainerStyle={{ paddingTop: 54, paddingBottom: 32 }}>
    <View style={{ paddingHorizontal: 24, marginBottom: 20 }}><AppText variant="v14Title">v14 primitives</AppText><AppText variant="v14Body">Shared foundations. Tap the actions to try them.</AppText></View>
    <View style={{ backgroundColor: colors.indigo, padding: 24, gap: 16, alignItems: 'center' }}><LampRing done={count} size={236} /><ReviewTag label="Mandala rule needs teachers’ review (D-23)" dark /><PrimaryButton label="Light the next lamp" onPress={() => setCount(c => Math.min(40, c + 1))} style={{ alignSelf: 'stretch' }} icon={<Icon name="play" size={18} color={colors.white} />} /><BackPill destination="Practice" dark onPress={() => setCount(10)} /></View>
    <View style={{ padding: 16, gap: 16 }}><Leaf holes><AppText variant="v14Section">A palm leaf</AppText><AppText variant="v14Body">Ruled every seven points, with string holes.</AppText><ProgressSegments done={2} total={10} current={2} style={{ marginVertical: 12 }} /><ReviewTag label="Content awaiting review" /></Leaf><View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}><Portrait size={58} /><AppText variant="v14Body">Mahamuni’s word for today</AppText></View><OutlineButton label="Read what it means" onPress={() => setCount(0)} /><TextLink label="Sit with it" onPress={() => setCount(10)} /><BackPill destination="Wisdom" onPress={() => setCount(10)} /></View>
    <LeafBand><AppText variant="v14Section">Gunometer</AppText><GunaRope percents={percents} width={342} /><GunaBar percents={percents} /></LeafBand>
    <View style={{ padding: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>{(['wheel','bow','ash','yantra'] as const).map((motif, i) => <SeriesCover key={motif} titleDev={['महाभारत','रामायण','पाशुपत','भारतीय ज्ञान'][i]} title={['The Mahabharata','The Rāmāyaṇa','Pāśupata Śaivism','Indian knowledge systems'][i]} color={[colors.seriesMahabharata,colors.seriesRamayana,colors.seriesPashupata,colors.seriesIks][i]} motif={motif} state={i === 0 ? 'Reading, episode 3' : i === 3 ? 'Session 1 free' : '[Series, as approved]'} active={i === 0} style={{ width: '47%' }} onPress={() => setTabIndex(2)} />)}</View>
    <PhotoPlaceholder label="[Ashram photo to come]" style={{ margin: 16 }} />
    <PortraitHeader width={390} title={<AppText variant="v14Title" color={colors.white}>Most Venerable Mahamuni</AppText>}><BackPill destination="Wisdom" dark style={{ marginLeft: 16, marginTop: 54 }} /></PortraitHeader>
    <View style={{ padding: 24, gap: 12 }}><AppText variant="v14Section">Mock access switch</AppText><AppText variant="v14Body">Dhyanbhaari: {unlocks?.dhyanbhaari ? 'unlocked' : 'locked'}</AppText><OutlineButton label="Toggle Dhyanbhaari (mock only)" disabled={isLiveBackend || !session.canUsePersonalFeatures} onPress={() => { void toggle(!unlocks?.dhyanbhaari); }} /><AppText variant="meta">Sign in and finish setup to use the mock switch.</AppText></View>
    <TabBar {...nav} />
  </ScrollView>;
}

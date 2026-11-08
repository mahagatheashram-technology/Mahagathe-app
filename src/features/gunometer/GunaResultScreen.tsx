import { useRouter } from 'expo-router';
import { useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, Share, View } from 'react-native';
import { captureRef, releaseCapture } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { AppText, BackPill, GunaBar, GunaRope, Icon, LeafBand, OutlineButton, ReviewTag, Screen } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { useExternalLinks, useGunaResult, useSession } from '@/data';
import { v14Colors as colors, fonts } from '@/theme/tokens';
import GunaInviteScreen from './GunaInviteScreen';
import { useOpenSaptagita } from '@/features/wisdom/useSaptagita';
import { gunaContent } from './lib/recommendations';
import { gunaDate, gunaNames, gunaSections, gunaSummary } from './presentation';
import { GunaShareCard } from './GunaShareCard';

export default function GunaResultScreen() {
  const router = useRouter();
  const result = useGunaResult();
  const session = useSession();
  const links = useExternalLinks();
  const saptagita = useOpenSaptagita(links);
  const insets = useScreenInsets();
  const [expanded, setExpanded] = useState<string[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const card = useRef<ComponentRef<typeof View>>(null);
  const shareLock = useRef(false);
  if (session.status === 'loading' || result === undefined) return <Screen background={colors.leaf} contentStyle={{ justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Loading your Gunometer result" color={colors.ink} /></Screen>;
  if (!result) return <GunaInviteScreen />;
  const guna = gunaNames[result.dominant];
  const share = async () => {
    if (shareLock.current) return;
    shareLock.current = true;
    setSharing(true);
    setError(null);
    let uri: string | undefined;
    try {
      if (Platform.OS !== 'web' && await Sharing.isAvailableAsync()) {
        uri = await captureRef(card, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1920 });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: 'Share your Gunometer' });
      } else {
        await Share.share({ title: 'My Gunometer', message: `My guna: ${guna.title} (${guna.dev}). Sattva ${result.percents.sattva}%, Rajas ${result.percents.rajas}%, Tamas ${result.percents.tamas}%. Find yours in the Mahagathe app.` });
      }
    } catch { setError('Sharing is unavailable here. Please try sharing from the app on your phone.'); }
    finally { if (uri) releaseCapture(uri); shareLock.current = false; setSharing(false); }
  };
  return <>
    <Screen background={colors.limewash} edgeToEdgeTop contentStyle={{ paddingBottom: Math.max(insets.bottom, 36) }}>
      <LeafBand style={{ paddingTop: insets.top + 2, paddingHorizontal: 16, paddingBottom: 26 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 51 }}><BackPill destination="Profile" onPress={() => router.replace('/profile')} /><Pressable accessibilityRole="button" accessibilityLabel="Share your Gunometer" onPress={() => { setError(null); setShareOpen(true); }} style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}><Icon name="share" size={22} color={colors.ink} strokeWidth={1.8} /></Pressable></View>
        <View style={{ paddingHorizontal: 8, paddingTop: 18 }}>
          <AppText style={{ fontSize: 15, lineHeight: 23.25, color: colors.darkLeaf }}>Your Gunometer, taken {gunaDate(result.takenAt)}</AppText>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 14, marginTop: 4, minHeight: 59 }}><AppText accessibilityRole="header" style={{ fontFamily: fonts.displaySemibold, fontSize: 52, lineHeight: 52, color: guna.color }}>{guna.title}</AppText><AppText style={{ fontFamily: fonts.display, fontSize: 36, lineHeight: 55.8, color: guna.color, opacity: .8 }}>{guna.dev}</AppText></View>
          <AppText style={{ marginTop: 6, fontSize: 16, lineHeight: 24.8, color: colors.darkLeaf }}>{gunaSummary(result)}</AppText>
          <GunaRope percents={result.percents} width={342} height={74} style={{ marginTop: 18, marginBottom: 9, marginHorizontal: -6 }} />
          <GunaBar percents={result.percents} style={{ marginTop: 14 }} />
        </View>
      </LeafBand>
      <View style={{ paddingTop: 24, paddingHorizontal: 24 }}>
        <AppText variant="v14Section" accessibilityRole="header">What this means</AppText>
        <AppText style={{ marginTop: 8, fontSize: 17, lineHeight: 27.2, color: colors.ink }}>{gunaContent[result.dominant].interpretation}</AppText>
        <ReviewTag label="Result text needs content review" style={{ marginTop: 10 }} />
      </View>
      <View style={{ paddingTop: 18, paddingHorizontal: 24 }}>
        {gunaSections(result.dominant).map(section => {
          const open = expanded.includes(section.title);
          return <View key={section.title} style={{ borderTopWidth: 1, borderTopColor: colors.line }}>
            <Pressable accessibilityRole="button" accessibilityLabel={section.title} accessibilityState={{ expanded: open }} aria-expanded={open} onPress={() => setExpanded(v => open ? v.filter(t => t !== section.title) : [...v, section.title])} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, minHeight: 44 }}>
              <View style={{ flex: 1 }}><AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 18, lineHeight: 27.9, color: colors.ink }}>{section.title}</AppText><AppText style={{ fontSize: 14, lineHeight: 21.7, color: colors.text2 }}>{section.summary}</AppText></View>
              <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}><Icon name="down" size={18} color={colors.text2} /></View>
            </Pressable>
            {open && <View style={{ gap: 8, paddingBottom: 18 }}>{section.items.filter(item => item !== section.summary).map(item => <AppText key={item} style={{ fontSize: 16, lineHeight: 24.8, color: colors.ink }}>{item}</AppText>)}</View>}
          </View>;
        })}
      </View>
      <Pressable accessibilityRole="link" accessibilityLabel="The three gunas in the Gita, open Saptagita" disabled={links === undefined} onPress={saptagita.open} style={{ marginTop: 16, marginHorizontal: 16, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, backgroundColor: colors.lateriteSoft, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ width: 44, height: 44, backgroundColor: colors.actionRed, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 22, color: colors.white }}>७</AppText></View><View style={{ flex: 1 }}><AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 17, lineHeight: 26.35, color: colors.ink }}>The three gunas in the Gita</AppText><AppText style={{ fontSize: 14, lineHeight: 21.7, color: colors.text2 }}>Gita, chapter 14, in the Saptagita app</AppText></View>
      </Pressable>
      {saptagita.message && <AppText accessibilityLiveRegion="polite" style={{ marginTop: 10, marginHorizontal: 24, fontSize: 14, lineHeight: 21.7, color: colors.text2 }}>{saptagita.message}</AppText>}
      <View style={{ paddingTop: 22, paddingHorizontal: 16, alignItems: 'center', gap: 10 }}>
        <OutlineButton label="Take it again" onPress={() => router.push('/gunometer/quiz')} style={{ width: '100%' }} />
        <AppText style={{ fontSize: 14, lineHeight: 21.7, color: colors.text2 }}>Your new result replaces this one.</AppText>
        {!shareOpen && error && <AppText accessibilityRole="alert" style={{ color: colors.actionRed }}>{error}</AppText>}
      </View>
    </Screen>
    <Modal visible={shareOpen} animationType="fade" onRequestClose={() => { if (!sharing) setShareOpen(false); }}>
      <Screen background={colors.shareBackdrop} contentStyle={{ paddingTop: 2, paddingBottom: Math.max(insets.bottom, 20), alignItems: 'center' }}>
        <View style={{ width: '100%', paddingHorizontal: 16, alignItems: 'flex-end' }}><Pressable accessibilityRole="button" accessibilityLabel="Close share card" disabled={sharing} onPress={() => setShareOpen(false)} style={{ width: 44, height: 44, justifyContent: 'center', alignItems: 'center' }}><Icon name="close" size={22} color={colors.white} /></Pressable></View>
        <View style={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 20 }}><View ref={card} collapsable={false}><GunaShareCard result={result} /></View></View>
        {error && <AppText accessibilityRole="alert" style={{ color: colors.white, paddingHorizontal: 24, marginBottom: 12 }}>{error}</AppText>}
        <OutlineButton label="Share as a story" color={colors.white} icon={<Icon name="share" size={20} color={colors.white} />} onPress={share} loading={sharing} style={{ alignSelf: 'center', width: 330 }} />
      </Screen>
    </Modal>
  </>;
}

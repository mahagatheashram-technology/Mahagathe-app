import { View } from 'react-native';
import { AppText, GunaBar, GunaRope, Leaf } from '@/components/ui';
import { Emblem } from '@/components/ui/Emblem';
import type { GunaResult } from '@/data';
import { v14Colors as colors, fonts } from '@/theme/tokens';
import { gunaNames } from './presentation';

const shareLines = {
  sattva: 'Clarity, steadiness and meaningful engagement.',
  rajas: 'Motion, challenge and visible results.',
  tamas: 'Stability, familiarity and reduced stimulation.',
};
/** 330 × 586⅔pt: exactly 9:16, independent of the device viewport. */
export function GunaShareCard({ result }: { result: GunaResult }) {
  const guna = gunaNames[result.dominant];
  return <Leaf style={{ width: 330, height: 330 * 16 / 9, borderRadius: 22, paddingTop: 40, paddingLeft: 30, paddingRight: 30, paddingBottom: 30 }}>
    <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color: colors.laterite }}>My guna</AppText>
    <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 64, lineHeight: 64, color: guna.color, marginTop: 8 }}>{guna.title}</AppText>
    <AppText style={{ fontFamily: fonts.display, fontSize: 34, lineHeight: 52.7, color: guna.color, opacity: .8, marginTop: 4 }}>{guna.dev}</AppText>
    <GunaRope percents={result.percents} width={286} height={96} style={{ marginTop: 28, marginBottom: 8, marginHorizontal: -8 }} />
    <GunaBar percents={result.percents} labels={false} style={{ marginTop: 18 }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
      {(['sattva', 'rajas', 'tamas'] as const).map(key => <AppText key={key} style={{ fontSize: 15, lineHeight: 23.25, color: key === 'rajas' ? colors.rajas : colors.ink, fontFamily: key === result.dominant ? fonts.uiSemibold : fonts.ui }}>{gunaNames[key].title} {result.percents[key]}</AppText>)}
    </View>
    <AppText style={{ fontFamily: fonts.display, fontSize: 19, lineHeight: 26.6, color: colors.ink, marginTop: 22 }}>{shareLines[result.dominant]}</AppText>
    <View style={{ marginTop: 'auto', flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.leafEdge }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}><Emblem width={20.5} /></View>
      <View style={{ flex: 1 }}><AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 17, lineHeight: 18.7, color: colors.ink }}>Gunometer by Mahagathe</AppText><AppText style={{ fontSize: 13, lineHeight: 20.15, color: colors.darkLeaf }}>Find yours in the Mahagathe app</AppText></View>
    </View>
  </Leaf>;
}

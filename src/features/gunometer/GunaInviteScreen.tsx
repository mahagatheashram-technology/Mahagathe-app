import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { AppText, GunaRope, Icon, Leaf, PrimaryButton, Screen } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { useGunaPrompt, useSession } from '@/data';
import { v14Colors as colors, fonts } from '@/theme/tokens';
import { coreQuestions } from './lib/questions';

export default function GunaInviteScreen() {
  const router = useRouter();
  const session = useSession();
  const prompt = useGunaPrompt();
  const insets = useScreenInsets();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const later = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (session.canUsePersonalFeatures) await prompt?.markLater();
      router.replace('/(tabs)');
    } catch { setError('We could not save your choice. Please try again.'); }
    finally { setBusy(false); }
  };
  return <Leaf style={{ flex: 1, borderWidth: 0, borderRadius: 0, paddingVertical: 0, paddingLeft: 0, paddingRight: 0 }}>
    <Screen background="transparent" contentStyle={{ paddingTop: 2, paddingHorizontal: 24, paddingBottom: Math.max(insets.bottom, 40) }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Later, go to Home" disabled={busy || session.status === 'loading' || (session.canUsePersonalFeatures && !prompt)} onPress={later} style={{ alignSelf: 'flex-end', minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'flex-end' }}>
        <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: colors.darkLeaf }}>Later</AppText>
      </Pressable>
      <View style={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 28 }}>
        <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color: colors.laterite }}>Gunometer</AppText>
        <AppText style={{ fontFamily: fonts.display, fontSize: 62, lineHeight: 62, color: colors.laterite, marginTop: 6 }}>गुण</AppText>
        <AppText accessibilityRole="header" style={{ fontFamily: fonts.displaySemibold, fontSize: 36, lineHeight: 39.6, color: colors.ink, marginTop: 10 }}>Find your guna</AppText>
        <AppText style={{ marginTop: 12, maxWidth: 320, fontSize: 17, lineHeight: 26.35, color: colors.darkLeaf }}>Guṇa means a strand. Sattva, rajas and tamas are woven through everyone, in different measure. {coreQuestions.length} short questions show which strand runs strongest in you.</AppText>
        <GunaRope percents={{ sattva: 34, rajas: 42, tamas: 24 }} width={330} height={80} style={{ marginTop: 26, marginBottom: 10, marginLeft: -4, maxWidth: '100%' }} />
        <View style={{ marginTop: 22, gap: 10 }}>
          {([['clock', 'About five minutes'], ['save', 'Your result stays in your profile'], ['retake', 'Take it again whenever you like']] as const).map(([icon, text]) => <View key={text} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Icon name={icon} size={20} color={colors.darkLeaf} strokeWidth={1.8} /><AppText style={{ fontSize: 15, lineHeight: 23.25, color: colors.darkLeaf }}>{text}</AppText></View>)}
        </View>
      </View>
      {error && <AppText accessibilityRole="alert" style={{ color: colors.actionRed, marginBottom: 12 }}>{error}</AppText>}
      {session.status === 'loading' ? <ActivityIndicator accessibilityLabel="Loading your account" color={colors.ink} /> : <PrimaryButton label={session.canUsePersonalFeatures ? 'Begin' : 'Sign in to begin'} disabled={busy} onPress={() => router.push(session.canUsePersonalFeatures ? '/gunometer/quiz' : '/welcome')} />}
    </Screen>
  </Leaf>;
}

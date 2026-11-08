import { Redirect, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { AppText, Icon, Leaf, OutlineButton, ProgressSegments, ReviewTag, Screen } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { useGunaPrompt, useSaveGunaResult, useSession } from '@/data';
import { v14Colors as colors, fonts } from '@/theme/tokens';
import { completeGunaQuiz } from './completeQuiz';
import { coreQuestions, likertOptions } from './lib/questions';

export default function GunaQuizScreen() {
  const router = useRouter();
  const session = useSession();
  const save = useSaveGunaResult();
  const prompt = useGunaPrompt();
  const insets = useScreenInsets();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  const startedAt = useRef<number | undefined>(undefined);
  useEffect(() => { startedAt.current = Date.now(); }, []);
  const advance = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (advance.current) clearTimeout(advance.current); }, []);
  const question = coreQuestions[index];
  const finish = async (complete: Record<string, number>) => {
    setBusy(true);
    setError(null);
    try {
      await completeGunaQuiz(complete, save, async () => { await prompt?.markDone(); }, undefined, startedAt.current);
      router.replace('/gunometer');
    } catch {
      setError('We could not save your result. Your answers are still here. Please try again.');
      lock.current = false;
      setBusy(false);
    }
  };
  const answer = (value: number) => {
    if (lock.current) return;
    lock.current = true;
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    setError(null);
    // Briefly show the selected radio/check before advancing, including on the final item.
    advance.current = setTimeout(() => {
      advance.current = null;
      if (index === coreQuestions.length - 1) void finish(next);
      else { setIndex(i => i + 1); lock.current = false; }
    }, 260);
  };
  if (session.status !== 'loading' && !session.canUsePersonalFeatures) return <Redirect href="/welcome" />;
  return <Leaf style={{ flex: 1, borderWidth: 0, borderRadius: 0, paddingVertical: 0, paddingLeft: 0, paddingRight: 0 }}>
    <Screen background="transparent" contentStyle={{ paddingTop: 2, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 34) }}>
      {session.status === 'loading' ? <ActivityIndicator accessibilityLabel="Loading your account" color={colors.ink} /> : <>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={index ? 'Previous question' : 'Back to Gunometer introduction'} disabled={busy} onPress={() => {
            if (advance.current) clearTimeout(advance.current);
            advance.current = null; lock.current = false;
            if (index) setIndex(i => i - 1); else router.replace('/gunometer/intro');
          }} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.pillLight, alignItems: 'center', justifyContent: 'center' }}><Icon name="back" size={20} color={colors.ink} strokeWidth={2.2} /></Pressable>
          <ProgressSegments done={index} total={coreQuestions.length} current={index} color={colors.laterite} accessibilityLabel={`${index} of ${coreQuestions.length} questions answered`} style={{ flex: 1 }} />
          <AppText accessibilityLiveRegion="polite" style={{ fontFamily: fonts.uiSemibold, fontSize: 14, lineHeight: 21.7, color: colors.darkLeaf }}>{index + 1} of {coreQuestions.length}</AppText>
        </View>
        <View style={{ paddingTop: 46, paddingHorizontal: 6 }}>
          <AppText style={{ fontSize: 15, lineHeight: 23.25, color: colors.darkLeaf }}>Over the last four weeks, how often was this true for you?</AppText>
          <AppText accessibilityRole="header" accessibilityLiveRegion="polite" style={{ marginTop: 14, fontFamily: fonts.displayMedium, fontSize: 30, lineHeight: 37.5, color: colors.ink }}>{question.text}</AppText>
        </View>
        <View style={{ flexGrow: 1, minHeight: 30 }} />
        <View accessibilityRole="radiogroup" accessibilityLabel={question.text} style={{ gap: 10 }}>
          {likertOptions.map(option => {
            const selected = answers[question.id] === option.value;
            return <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: selected, disabled: busy }} aria-checked={selected} disabled={busy} onPress={() => answer(option.value)} style={{ minHeight: 54, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1.5, borderColor: selected ? colors.ink : colors.leafEdge, backgroundColor: selected ? colors.ink : colors.sattva, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 17, lineHeight: 26.35, color: selected ? colors.white : colors.ink }}>{option.label}</AppText>
              {selected && <Icon name="check" size={20} color={colors.white} strokeWidth={2.4} />}
            </Pressable>;
          })}
        </View>
        {busy && <ActivityIndicator accessibilityLabel="Saving your Gunometer result" color={colors.ink} style={{ marginTop: 12 }} />}
        {error && <View style={{ gap: 10, marginTop: 12 }}><AppText accessibilityRole="alert" style={{ color: colors.actionRed }}>{error}</AppText><OutlineButton label="Save my result" onPress={() => { lock.current = true; void finish(answers); }} /></View>}
        <ReviewTag label="Question wording needs content review" style={{ alignSelf: 'center', marginTop: 14 }} />
      </>}
    </Screen>
  </Leaf>;
}

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Sheet, SheetHeader } from './Sheet';
import { AppText, Button, Icon } from '@/components/ui';
import type { Episode } from '@/data';
import { colors, fonts, radii } from '@/theme/tokens';

type Question = Episode['questions'][number];

/**
 * W-09: one question at a time. A gentle check-in, no scores, no red/"wrong" states:
 * every answer reveals what the text says, and the answer from the text is marked with a tick and a label.
 */
export function QuestionsSheet({
  visible,
  onClose,
  questions,
}: {
  visible: boolean;
  onClose: () => void;
  questions: Question[];
}) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  // Start from question 1 each time the sheet opens.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setIndex(0);
      setPicked(null);
      setFinished(false);
    }
  }

  const q = questions[index];
  const last = index === questions.length - 1;
  const revealed = picked !== null;
  const hitAnswer = revealed && q && picked === q.answerIndex;

  return (
    <Sheet visible={visible} onClose={onClose} label="Questions about this episode">
      <SheetHeader
        eyebrow={finished ? undefined : `Question ${index + 1} of ${questions.length}`}
        title={finished ? 'Thank you for reading' : 'A gentle check-in'}
        onClose={onClose}
      />
      <ScrollView style={{ flexGrow: 0 }} showsVerticalScrollIndicator={false} bounces={false}>
        {finished || !q ? (
          <View style={{ gap: 16, paddingBottom: 8 }}>
            <View style={styles.doneIcon}>
              <Icon name="check" size={26} color={colors.actionRed} strokeWidth={2.2} />
            </View>
            <AppText variant="bodyLarge" style={{ lineHeight: 26 }}>
              You went through all {questions.length} questions. There are no scores. Come back to them whenever you
              like, or read the episode again.
            </AppText>
            <Button label="Back to the episode" size="md" style={{ height: 52 }} onPress={onClose} />
            <Button
              label="Go through them again"
              variant="quiet"
              size="md"
              style={{ height: 52 }}
              onPress={() => {
                setIndex(0);
                setPicked(null);
                setFinished(false);
              }}
            />
          </View>
        ) : (
          <View style={{ gap: 16, paddingBottom: 8 }}>
            <AppText style={styles.prompt}>{q.prompt}</AppText>
            <View style={{ gap: 10 }} accessibilityRole="radiogroup">
              {q.options.map((opt, i) => {
                const isAnswer = revealed && i === q.answerIndex;
                const isPicked = picked === i;
                return (
                  <Pressable
                    key={i}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isPicked, disabled: revealed }}
                    accessibilityLabel={isAnswer ? `${opt}. This is the answer from the text` : opt}
                    disabled={revealed}
                    onPress={() => setPicked(i)}
                    style={({ pressed }) => [
                      styles.option,
                      isPicked && { borderColor: colors.actionRed, borderWidth: 1.5 },
                      isAnswer && { backgroundColor: colors.sand },
                      pressed && { opacity: 0.85 },
                    ]}>
                    <View style={{ flex: 1, gap: 1 }}>
                      <AppText style={styles.optionLabel}>{opt}</AppText>
                      {isAnswer ? <AppText style={styles.fromText}>From the text</AppText> : null}
                    </View>
                    {isAnswer ? <Icon name="check" size={20} color={colors.actionRed} strokeWidth={2.2} /> : null}
                  </Pressable>
                );
              })}
            </View>

            {revealed ? (
              <View style={styles.feedback} accessibilityLiveRegion="polite">
                <AppText variant="overline" color={colors.actionRed}>
                  {hitAnswer ? 'Yes, that is it' : 'Not quite, and that is fine'}
                </AppText>
                <AppText style={styles.explanation}>{q.explanation}</AppText>
              </View>
            ) : null}

            <Button
              label={last ? 'Finish' : 'Next question'}
              size="md"
              style={{ height: 52 }}
              disabled={!revealed}
              onPress={() => {
                if (last) setFinished(true);
                else {
                  setIndex(index + 1);
                  setPicked(null);
                }
              }}
            />
          </View>
        )}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  prompt: { fontFamily: fonts.serifSemibold, fontSize: 21, lineHeight: 29, color: colors.ink },
  option: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionLabel: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 22, color: colors.ink },
  fromText: { fontFamily: fonts.sansSemibold, fontSize: 11, lineHeight: 16, color: colors.actionRed },
  feedback: { gap: 6, padding: 16, borderRadius: radii.lg, backgroundColor: colors.sand },
  explanation: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 24, color: colors.ink },
  doneIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

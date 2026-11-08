import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { AppText, Icon, Leaf, OutlineButton } from '@/components/ui';
import { useAnswerYaksha, useContinueReading, useEpisode, useTodayYaksha } from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { Skeleton } from './Skeleton';
import { YakshaShareSheet } from './YakshaShareSheet';
import { splitReviewTag, yakshaChoices } from './yakshaText';

function Title() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <View style={{ width: 30, height: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="waves" size={30} color={colors.laterite} strokeWidth={1.6} />
      </View>
      <AppText accessibilityRole="header" style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color: colors.laterite }}>
        The Yakṣa’s question
      </AppText>
    </View>
  );
}

/** Link row pinned to the bottom of the leaf, spanning its full width. */
function ContinueRow() {
  const router = useRouter();
  const reading = useContinueReading();
  const episode = useEpisode(reading?.episode.id);
  if (!reading) return null;
  const { title, number } = reading.episode;
  const total = episode?.totalInSeason;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Continue reading: ${title}, episode ${number}${total ? ` of ${total}` : ''}`}
      onPress={() => router.push(`/episode/${reading.episode.id}`)}
      style={{
        marginTop: 20,
        marginLeft: -30,
        marginRight: -26,
        paddingTop: 14,
        paddingBottom: 16,
        paddingLeft: 30,
        paddingRight: 26,
        borderTopWidth: 1,
        borderTopColor: colors.leafEdge,
        backgroundColor: colors.leafInset,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        minHeight: 44,
      }}>
      <AppText style={{ fontFamily: fonts.displayMedium, fontSize: 22, lineHeight: 22, color: colors.laterite }}>
        {reading.episode.seasonDevanagari}
      </AppText>
      <View style={{ flex: 1, minWidth: 0 }}>
        <AppText style={{ fontFamily: fonts.ui, fontSize: 13, lineHeight: 20.15, color: colors.darkLeaf }}>
          Your story, episode {number}
          {total ? ` of ${total}` : ''}
        </AppText>
        <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 17, lineHeight: 20.4, color: colors.v14Ink }}>{title}</AppText>
      </View>
      <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color: colors.v14Ink, textDecorationLine: 'underline' }}>
        Continue
      </AppText>
    </Pressable>
  );
}

/** The Yakṣa’s question: ask (three choices + “Just show me”) → answered. One reveal per day. */
export function YakshaLeaf() {
  const today = useTodayYaksha();
  const answer = useAnswerYaksha();
  const reading = useContinueReading();
  const [sharing, setSharing] = useState(false);

  const reveal = (choice: string | null) => {
    answer(choice).catch((e: unknown) => Alert.alert('Couldn’t save your answer', e instanceof Error ? e.message : 'Please try again.'));
  };
  const hasRow = reading !== undefined && reading !== null;

  return (
    <Leaf
      holes
      holeTop={44}
      style={{ paddingTop: 22, paddingBottom: hasRow ? 0 : 22, paddingLeft: 30, paddingRight: 26 }}>
      <Title />
      {today === undefined ? (
        <View style={{ marginTop: 16, gap: 10 }}>
          <Skeleton height={64} />
          <Skeleton height={50} />
          <Skeleton height={50} />
          <Skeleton height={50} />
        </View>
      ) : today === null ? (
        <AppText style={{ marginTop: 10, fontFamily: fonts.ui, fontSize: 15, lineHeight: 23.25, color: colors.darkLeaf }}>
          Today’s question will appear here when it is ready.
        </AppText>
      ) : !today.state.revealed ? (
        <>
          <AppText style={{ marginTop: 8, fontFamily: fonts.displaySemibold, fontSize: 31, lineHeight: 37.2, color: colors.v14Ink }}>
            {today.question.question}
          </AppText>
          <AppText style={{ marginTop: 6, marginBottom: 16, fontFamily: fonts.ui, fontSize: 15, lineHeight: 23.25, color: colors.darkLeaf }}>
            Make your guess, then see how Yudhiṣṭhira answered.
          </AppText>
          <View accessibilityRole="radiogroup" accessibilityLabel="Choose an answer" style={{ gap: 8 }}>
            {yakshaChoices(today.question).map((choice) => (
              <Pressable
                key={choice}
                accessibilityRole="radio"
                accessibilityLabel={choice}
                accessibilityState={{ checked: false }}
                onPress={() => reveal(choice)}
                style={({ pressed }) => ({
                  height: 50,
                  borderRadius: 14,
                  backgroundColor: colors.sattva,
                  borderWidth: 1.5,
                  borderColor: colors.leafEdge,
                  paddingHorizontal: 16,
                  justifyContent: 'center',
                  opacity: pressed ? 0.75 : 1,
                })}>
                <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 17, lineHeight: 26.35, color: colors.v14Ink }}>{choice}</AppText>
              </Pressable>
            ))}
          </View>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Just show me"
            onPress={() => reveal(null)}
            style={{ marginTop: 1.6, marginBottom: -10.4, minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' }}>
            <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color: colors.darkLeaf, textDecorationLine: 'underline' }}>
              Just show me
            </AppText>
          </Pressable>
        </>
      ) : (
        <Answered today={today} onShare={() => setSharing(true)} />
      )}
      <ContinueRow />
      {today ? <YakshaShareSheet question={today.question} visible={sharing} onClose={() => setSharing(false)} /> : null}
    </Leaf>
  );
}

function Answered({ today, onShare }: { today: NonNullable<ReturnType<typeof useTodayYaksha>>; onShare: () => void }) {
  const { question, state } = today;
  const reference = splitReviewTag(question.reference);
  const meaning = splitReviewTag(question.meaning);
  const mark =
    state.correct === true
      ? { bg: colors.seriesRamayana, text: 'You guessed it', icon: 'check' as const }
      : state.correct === false
        ? { bg: colors.rajas, text: `Not this time. You chose “${state.choice}”`, icon: 'close' as const }
        : null;
  return (
    <>
      <AppText style={{ marginTop: 8, fontFamily: fonts.displayMedium, fontSize: 22, lineHeight: 27.5, color: colors.darkLeaf }}>
        {question.question}
      </AppText>
      {mark ? (
        <View accessible accessibilityLabel={mark.text} style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: mark.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={mark.icon} size={20} color={colors.white} strokeWidth={2.4} />
          </View>
          <AppText style={{ flex: 1, fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color: mark.bg }}>{mark.text}</AppText>
        </View>
      ) : null}
      <AppText style={{ marginTop: 10, fontFamily: fonts.displaySemibold, fontSize: 38, lineHeight: 41.8, color: colors.laterite }}>
        {question.answer}.
      </AppText>
      <AppText style={{ marginTop: 6, fontFamily: fonts.ui, fontSize: 14, lineHeight: 21.7, color: colors.darkLeaf }}>
        Yudhiṣṭhira’s answer, {reference.body}
        {reference.tag ? ` ${reference.tag}` : ''}
      </AppText>
      <AppText style={{ marginTop: 14, fontFamily: fonts.display, fontSize: 19, lineHeight: 28.5, color: colors.v14Ink }}>
        {meaning.body}
        {meaning.tag ? (
          <AppText style={{ fontFamily: fonts.ui, fontSize: 14, color: colors.darkLeaf }}>{` ${meaning.tag}`}</AppText>
        ) : null}
      </AppText>
      <View style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <OutlineButton
          label="Share as a story"
          onPress={onShare}
          icon={<Icon name="share" size={18} color={colors.v14Ink} strokeWidth={1.8} />}
        />
        <AppText style={{ fontFamily: fonts.ui, fontSize: 14, lineHeight: 21.7, color: colors.darkLeaf, textAlign: 'right' }}>
          {'New question\ntomorrow'}
        </AppText>
      </View>
    </>
  );
}

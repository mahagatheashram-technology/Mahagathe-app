import type { ComponentRef, Ref } from 'react';
import { View } from 'react-native';

import { AppText, Icon, Leaf } from '@/components/ui';
import { Emblem } from '@/components/ui/Emblem';
import type { YakshaQuestion } from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { sourceLine } from './yakshaText';

export const SHARE_CARD_WIDTH = 330;
export const SHARE_CARD_HEIGHT = 587;

/** V131YakshaCard: the 9:16 leaf that is captured and shared as a story. */
export type ShareCardHandle = ComponentRef<typeof View>;
export function YakshaShareCard({ question, cardRef }: { question: YakshaQuestion; cardRef?: Ref<ShareCardHandle> }) {
  return (
    <View ref={cardRef} collapsable={false} style={{ width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }}>
      <Leaf
        holes
        holeTop={60}
        accessibilityLabel={`The Yakṣa asked: ${question.question} Yudhiṣṭhira answered: ${question.answer}.`}
        style={{
          flex: 1,
          borderRadius: 22,
          paddingTop: 40,
          paddingBottom: 30,
          paddingLeft: 34,
          paddingRight: 34,
        }}>
        <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color: colors.laterite }}>
          The Yakṣa asked
        </AppText>
        <AppText style={{ marginTop: 10, fontFamily: fonts.displaySemibold, fontSize: 34, lineHeight: 39.1, color: colors.v14Ink }}>
          {question.question}
        </AppText>
        <View style={{ marginVertical: 26, height: 18, width: 60, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="waves" size={34} color={colors.laterite} strokeWidth={1.4} />
        </View>
        <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color: colors.laterite }}>
          Yudhiṣṭhira answered
        </AppText>
        <AppText style={{ marginTop: 6, fontFamily: fonts.displaySemibold, fontSize: 52, lineHeight: 52, color: colors.laterite }}>
          {question.answer}.
        </AppText>
        <AppText style={{ marginTop: 12, fontFamily: fonts.ui, fontSize: 14, lineHeight: 21.7, color: colors.darkLeaf }}>
          {sourceLine(question)}
        </AppText>
        <View
          style={{
            marginTop: 'auto',
            paddingTop: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            borderTopWidth: 1,
            borderTopColor: colors.leafEdge,
          }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }}>
            <Emblem width={20} />
          </View>
          <View>
            <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 17, lineHeight: 18.7, color: colors.v14Ink }}>Mahagathe</AppText>
            <AppText style={{ fontFamily: fonts.ui, fontSize: 13, lineHeight: 20.15, color: colors.darkLeaf }}>A new question every day</AppText>
          </View>
        </View>
      </Leaf>
    </View>
  );
}

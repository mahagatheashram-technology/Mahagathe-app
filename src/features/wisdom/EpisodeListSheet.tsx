import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Sheet, SheetHeader } from './Sheet';
import { AppText, Icon } from '@/components/ui';
import { useSeasonEpisodes } from '@/data';
import { colors, fonts, radii } from '@/theme/tokens';

/** "All episodes": the season's episode list. Picking one replaces the current reader. */
export function EpisodeListSheet({
  visible,
  onClose,
  seasonId,
  seasonTitle,
  currentId,
  onPick,
}: {
  visible: boolean;
  onClose: () => void;
  seasonId: string;
  seasonTitle: string;
  currentId: string;
  onPick: (episodeId: string) => void;
}) {
  const episodes = useSeasonEpisodes(seasonId);
  return (
    <Sheet visible={visible} onClose={onClose} label={`${seasonTitle}, all episodes`}>
      <SheetHeader eyebrow={seasonTitle} title="All episodes" onClose={onClose} />
      <ScrollView style={{ flexGrow: 0 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {episodes.map((e) => {
          const here = e.id === currentId;
          return (
            <Pressable
              key={e.id}
              accessibilityRole="button"
              accessibilityState={{ selected: here }}
              accessibilityLabel={`Episode ${e.number}: ${e.title}, ${e.readMinutes} minute read${here ? ', you are here' : ''}`}
              onPress={() => (here ? onClose() : onPick(e.id))}
              style={({ pressed }) => [
                styles.row,
                here && { borderColor: colors.actionRed, borderWidth: 1.5 },
                pressed && { opacity: 0.85 },
              ]}>
              <View style={styles.num}>
                <AppText style={styles.numLabel}>{e.number}</AppText>
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.title}>{e.title}</AppText>
                <AppText style={styles.meta}>
                  {here ? 'You are here · ' : ''}
                  {e.readMinutes} min read
                </AppText>
              </View>
              <Icon name="chevronRight" size={18} color={colors.muted} strokeWidth={2.2} />
            </Pressable>
          );
        })}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  num: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numLabel: { fontFamily: fonts.sansSemibold, fontSize: 14, color: colors.actionRed },
  title: { fontFamily: fonts.serifSemibold, fontSize: 17, lineHeight: 23, color: colors.ink },
  meta: { fontFamily: fonts.sansMedium, fontSize: 12, lineHeight: 18, color: colors.muted },
});

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText, Card, Icon, RedFeature, SandBand, Screen } from '@/components/ui';
import {
  useGroupCount,
  useMandala,
  usePractices,
  useProfile,
  useTodayPractice,
  useUpdateProfile,
} from '@/data';
import { colors, fonts, radii } from '@/theme/tokens';
import { EnrolSheet } from './EnrolSheet';
import { formatReminder } from './format';
import { MandalaStrip } from './MandalaStrip';
import { TimePickerSheet } from './TimePickerSheet';
import { useAuthGate } from './useAuthGate';

/** SadhanaV3 — today's free practice, Mandala summary, enrolled-only practices, reminder. */
export function SadhanaScreen() {
  const router = useRouter();
  const { gate } = useAuthGate();
  const today = useTodayPractice();
  const practices = usePractices();
  const mandala = useMandala();
  const group = useGroupCount();
  const profile = useProfile();
  const updateProfile = useUpdateProfile();
  const [enrol, setEnrol] = useState<{ open: boolean; title?: string }>({ open: false });
  const [pickerOpen, setPickerOpen] = useState(false);

  if (!today || !practices) {
    return (
      <Screen contentStyle={{ justifyContent: 'center' }}>
        <ActivityIndicator color={colors.actionRed} accessibilityLabel="Loading" />
      </Screen>
    );
  }

  const enrolledList = practices.filter((p) => p.access === 'enrolled').sort((a, b) => a.order - b.order);
  const enrolled = profile?.enrolled ?? false;
  const openPractice = (id: string) => gate(() => router.push({ pathname: '/player/[id]', params: { id } }));
  const minutes = Math.max(1, Math.round(today.durationSec / 60));
  const sat = mandala?.daysSat ?? 0;

  return (
    <Screen>
      <View style={styles.top}>
        <View style={{ gap: 4 }}>
          <AppText
            accessibilityRole="header"
            style={{ fontFamily: fonts.serifSemibold, fontSize: 32, lineHeight: 41 }}>
            Sādhanā
          </AppText>
          <AppText variant="meta" style={{ fontSize: 14, lineHeight: 21 }}>
            Your daily practice, one sitting at a time.
          </AppText>
        </View>

        <RedFeature style={styles.feature} accessibilityLabel="Today's practice">
          <View style={styles.rowBetween}>
            <AppText variant="eyebrow" color={colors.onFeatureMuted} style={{ lineHeight: 17.5 }}>
              Today · free for everyone
            </AppText>
            <AppText variant="caption" color={colors.onFeatureMuted} style={{ lineHeight: 17.5 }}>
              {minutes} min
            </AppText>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ flex: 1, gap: 6 }}>
              <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 24, lineHeight: 30.5 }} color={colors.white}>
                {today.title}
              </AppText>
              <AppText variant="meta" color={colors.onFeatureMuted} style={{ lineHeight: 19.5 }}>
                {today.description}
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${today.title}`}
              onPress={openPractice(today.id)}
              style={styles.playCircle}>
              <Icon name="play" size={26} color={colors.actionRed} />
            </Pressable>
          </View>
        </RedFeature>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open 40-Day Mandala"
          onPress={() => router.push('/mandala')}>
          <Card style={styles.mandalaCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 19, lineHeight: 24 }}>40-Day Mandala</AppText>
              <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 19.5 }} color={colors.actionRed}>
                {mandala ? `Day ${mandala.currentDay}` : 'Not started'}
              </AppText>
            </View>
            {mandala ? (
              <View
                accessible
                accessibilityRole="image"
                accessibilityLabel={`${sat} days done, today is day ${mandala.currentDay}`}>
                <MandalaStrip days={mandala.days} />
              </View>
            ) : (
              <MandalaStrip days={Array.from({ length: 40 }, () => 'future' as const)} />
            )}
            <AppText variant="meta" style={{ lineHeight: 19.5 }}>
              {mandala
                ? `${sat} days sat${group ? ` · ${group.todayCount} sādhakas have sat today` : ''}`
                : 'Begin a 40-day Mandala when you are ready.'}
            </AppText>
          </Card>
        </Pressable>
      </View>

      <SandBand style={styles.band} accessibilityLabel="Samatha practices">
        <View style={styles.rowBetween}>
          <AppText variant="section" accessibilityRole="header">
            Samatha practices
          </AppText>
          <View style={styles.pill}>
            <Icon name={enrolled ? 'check' : 'lock'} size={12} strokeWidth={2.2} color={colors.ink} />
            <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 12, lineHeight: 18 }}>
              {enrolled ? 'Enrolled' : 'Enrolled only'}
            </AppText>
          </View>
        </View>

        <View style={styles.list}>
          {enrolledList.map((p, i) => (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              accessibilityLabel={p.locked ? `${p.title}, locked. Enrolled only` : `Open ${p.title}`}
              onPress={p.locked ? () => setEnrol({ open: true, title: p.title }) : openPractice(p.id)}
              style={[styles.listRow, i < enrolledList.length - 1 && styles.rowDivider]}>
              <AppText
                style={{ fontFamily: fonts.serifSemibold, fontSize: 18, lineHeight: 23, width: 18 }}
                color={colors.actionRed}>
                {i + 1}
              </AppText>
              <View style={{ flex: 1 }}>
                <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23 }}>{p.title}</AppText>
                <AppText variant="caption" style={{ lineHeight: 17.5 }}>{p.subtitle}</AppText>
              </View>
              {p.locked ? (
                <Icon name="lock" size={18} color={colors.muted} />
              ) : (
                <Icon name="play" size={18} color={colors.actionRed} />
              )}
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={enrolled ? 'Dhyānbāri resources' : 'Dhyānbāri resources, locked'}
          onPress={() => setEnrol({ open: true, title: 'Dhyānbāri resources' })}
          style={[styles.listRow, styles.resources]}>
          <View style={styles.fileTile}>
            <Icon name="file" size={20} color={colors.actionRed} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23 }}>Dhyānbāri resources</AppText>
            <AppText variant="caption" style={{ lineHeight: 17.5 }}>Notes and files from your teachers</AppText>
          </View>
          <Icon name={enrolled ? 'chevronRight' : 'lock'} size={18} color={colors.muted} />
        </Pressable>

        {enrolled ? null : (
        <View style={{ gap: 6, paddingTop: 4, paddingHorizontal: 4 }}>
          <AppText style={{ lineHeight: 22.4 }}>
            These are taught in person. Your teacher opens them in the app after you enrol.
          </AppText>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="How to enrol"
            onPress={() => router.navigate('/sangha')}
            style={styles.link}>
            <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 21 }} color={colors.actionRed}>
              How to enrol
            </AppText>
            <Icon name="chevronRight" size={16} strokeWidth={2.2} color={colors.actionRed} />
          </Pressable>
        </View>
        )}
      </SandBand>

      <View style={{ paddingTop: 22, paddingHorizontal: 20, paddingBottom: 28 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Daily reminder, ${formatReminder(profile?.reminderTime)}. Change`}
          onPress={gate(() => setPickerOpen(true))}
          style={styles.reminder}>
          <Icon name="clock" size={20} color={colors.actionRed} />
          <AppText style={{ flex: 1, fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 23 }}>Daily reminder</AppText>
          <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23 }}>
            {formatReminder(profile?.reminderTime)}
          </AppText>
        </Pressable>
      </View>

      <EnrolSheet visible={enrol.open} practiceTitle={enrol.title} onClose={() => setEnrol((s) => ({ ...s, open: false }))} />
      <TimePickerSheet
        visible={pickerOpen}
        value={profile?.reminderTime ?? null}
        onClose={() => setPickerOpen(false)}
        onSave={(reminderTime) => updateProfile({ reminderTime })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: 4, paddingHorizontal: 20, paddingBottom: 24, gap: 18 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feature: { gap: 18, padding: 22, borderRadius: 24 },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalaCard: { gap: 14, paddingVertical: 18, paddingHorizontal: 20 },
  band: { paddingVertical: 26, paddingHorizontal: 20, gap: 14 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 28,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
  },
  list: { backgroundColor: colors.white, borderRadius: 18 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 15, paddingHorizontal: 16 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.sand },
  resources: { backgroundColor: colors.white, borderRadius: 18 },
  fileTile: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.tile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 40 },
  reminder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 58,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
});

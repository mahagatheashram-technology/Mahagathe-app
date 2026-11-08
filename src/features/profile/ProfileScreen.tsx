import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { AppText, BackPill, BottomSheet, Button, GunaRope, Icon, LampRing, Leaf, PrimaryButton, Screen } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { useAccountActions, useGunaResult, useMandala, useNotificationPrefs, useProfile, useSession, useSetNotificationPref, useUpdateProfile, type Language, type NotificationPrefs } from '@/data';
import { gunaDate, gunaNames } from '@/features/gunometer/presentation';
import { TimePickerSheet } from '@/features/sadhana/TimePickerSheet';
import { formatReminder } from '@/features/sadhana/format';
import { v14Colors as colors, fonts } from '@/theme/tokens';
import { OptionSheet } from './OptionSheet';
import { ToggleSwitch } from './ToggleSwitch';
import { useToast } from './Toast';

type Sheet = null | 'time' | 'language' | 'account' | 'delete' | 'edit' | 'morning';
const NOTIFICATIONS: { key: keyof NotificationPrefs; label: string; timing: string }[] = [
  { key: 'practiceReminder', label: 'Daily sitting', timing: '6:00 AM' },
  { key: 'dailyVakyam', label: 'Mahamuni’s word', timing: '7:00 AM' },
  { key: 'registeredEvents', label: 'Gatherings I’m going to', timing: 'The day before' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { status, canUsePersonalFeatures, signOut } = useSession();
  const profile = useProfile();
  const prefs = useNotificationPrefs();
  const mandala = useMandala();
  const guna = useGunaResult();
  const insets = useScreenInsets();
  const setPref = useSetNotificationPref();
  const updateProfile = useUpdateProfile();
  const { requestDataExport, deleteAccount } = useAccountActions();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [busy, setBusy] = useState(false);
  const [draftName, setDraftName] = useState('');
  const toast = useToast();
  const changePref = async (key: keyof NotificationPrefs, value: boolean) => {
    try { await setPref(key, value); }
    catch { toast.show('We could not save this change. Please try again.'); }
  };
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try { await action(); }
    catch { toast.show('We could not save this change. Please try again.'); }
    finally { setBusy(false); }
  };
  if (status === 'loading' || (canUsePersonalFeatures && (profile === undefined || prefs === undefined || guna === undefined))) return <Screen background={colors.limewash} contentStyle={{ justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Loading your profile" color={colors.indigo} /></Screen>;
  if (!canUsePersonalFeatures || !profile || !prefs) return <Screen background={colors.limewash} contentStyle={{ paddingTop: 2, paddingHorizontal: 24, gap: 24 }}><BackPill destination="Home" onPress={() => router.replace('/(tabs)')} /><AppText variant="v14Title">Your profile</AppText><AppText variant="v14Body">Sign in to keep your practice and reminders.</AppText><PrimaryButton label="Sign in" onPress={() => router.push('/welcome')} /></Screen>;
  const name = profile.displayName.trim() || 'Friend';
  return (<View style={{ flex: 1 }}>
    <Screen background={colors.limewash} contentStyle={{ paddingTop: 2, paddingHorizontal: 16, paddingBottom: Math.max(insets.bottom, 40) }}>
      <BackPill destination="Home" onPress={() => router.replace('/(tabs)')} />
      <View style={{ marginTop: 14, padding: 18, borderRadius: 20, backgroundColor: colors.indigo, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <LampRing done={mandala?.sittingsDone ?? 0} size={78} center={false} />
        <View style={{ flex: 1 }}><AppText accessibilityRole="header" style={{ fontFamily: fonts.displaySemibold, fontSize: 24, lineHeight: 37.2, color: colors.white }}>{name}</AppText><AppText style={{ fontSize: 15, lineHeight: 23.25, color: colors.onDark2 }}>{mandala === undefined ? 'Loading your Mandala…' : `${mandala?.sittingsDone ?? 0} lamps lit in this Mandala`}</AppText></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" hitSlop={{ left: 8, right: 8 }} onPress={() => { setDraftName(name); setSheet('edit'); }} style={{ minHeight: 44, minWidth: 28, justifyContent: 'center', alignItems: 'flex-end' }}><AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 15, lineHeight: 23.25, color: colors.white, textDecorationLine: 'underline' }}>Edit</AppText></Pressable>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={guna ? `Your guna, ${gunaNames[guna.dominant].title}, taken ${gunaDate(guna.takenAt)}` : 'Take the Gunometer'} onPress={() => router.push(guna ? '/gunometer' : '/gunometer/intro')} style={{ marginTop: 12 }}>
        <Leaf style={{ borderRadius: 20, paddingTop: 16, paddingLeft: 18, paddingRight: 18, paddingBottom: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 }}>
            <View style={{ flex: 1 }}><AppText style={{ fontSize: 14, lineHeight: 21.7, color: colors.darkLeaf }}>{guna ? 'Your guna, from the Gunometer' : 'Find your strongest strand'}</AppText>
              {guna ? <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}><AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 28, lineHeight: 32.2, color: gunaNames[guna.dominant].color }}>{gunaNames[guna.dominant].title}</AppText><AppText style={{ fontSize: 14, lineHeight: 21.7, color: colors.darkLeaf }}>taken {gunaDate(guna.takenAt)}</AppText></View> : <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 24, lineHeight: 31.2, color: colors.ink }}>Take the Gunometer</AppText>}
            </View><Icon name="chevronRight" size={20} color={colors.darkLeaf} />
          </View>
          {guna && <GunaRope percents={guna.percents} width={320} height={40} style={{ marginTop: 8, marginBottom: 9, marginHorizontal: -4 }} />}
        </Leaf>
      </Pressable>
      <View style={{ paddingTop: 28, paddingHorizontal: 8 }}>
        <AppText style={styles.heading} accessibilityRole="header">Reminders</AppText>
        {NOTIFICATIONS.map((item, i) => {
          const on = prefs[item.key];
          const time = item.key === 'practiceReminder' ? formatReminder(profile.reminderTime ?? '06:00') : item.timing;
          const text = <><AppText style={styles.setting}>{item.label}</AppText><AppText style={{ fontSize: 14, lineHeight: 21.7, color: colors.text2 }}>{on ? '' : 'Off, '}{time}</AppText></>;
          return <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderTopWidth: i ? 1 : 0, borderTopColor: colors.line }}>
            {i < 2 ? <Pressable accessibilityRole="button" accessibilityLabel={`Change time for ${item.label}, ${time}`} onPress={() => setSheet(i === 0 ? 'time' : 'morning')} style={{ flex: 1, minHeight: 44, justifyContent: 'center' }}>{text}</Pressable> : <View style={{ flex: 1 }}>{text}</View>}
            <ToggleSwitch value={on} label={item.label} onValueChange={v => changePref(item.key, v)} />
          </View>;
        })}
      </View>
      <View style={{ paddingTop: 22, paddingHorizontal: 8 }}>
        <AppText style={styles.heading} accessibilityRole="header">Settings</AppText>
        <Pressable accessibilityRole="button" accessibilityLabel="Language" onPress={() => setSheet('language')} style={styles.settingsRow}><AppText style={styles.setting}>Language</AppText><AppText style={{ fontSize: 15, lineHeight: 23.25, color: colors.text2 }}>English</AppText></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Your data and account" onPress={() => setSheet('account')} style={[styles.settingsRow, { borderTopWidth: 1, borderTopColor: colors.line }]}><AppText style={styles.setting}>Your data and account</AppText></Pressable>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Sign out" disabled={busy} onPress={() => run(async () => { await signOut(); router.replace('/welcome'); })} style={{ marginTop: 10, marginHorizontal: 8, minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center' }}><AppText style={{ ...styles.link, color: colors.laterite }}>Sign out</AppText></Pressable>
    </Screen>
      <TimePickerSheet
        visible={sheet === 'time'}
        value={profile.reminderTime}
        onClose={() => setSheet(null)}
        onSave={(reminderTime) => updateProfile({ reminderTime })}
      />
      <BottomSheet
        visible={sheet === 'morning'}
        title="Mahamuni’s word"
        onClose={() => setSheet(null)}
      >
        <AppText>
          Mahamuni’s word arrives at 7:00 AM. You can turn this reminder on or
          off in Profile.
        </AppText>
        <Button label="Done" variant="quiet" onPress={() => setSheet(null)} />
      </BottomSheet>
      <BottomSheet
        visible={sheet === 'edit'}
        title="Your name"
        onClose={() => setSheet(null)}
      >
        <TextInput
          accessibilityLabel="Your name"
          value={draftName}
          onChangeText={setDraftName}
          maxLength={80}
          style={{
            borderWidth: 1,
            borderColor: colors.divider,
            borderRadius: 12,
            padding: 14,
            fontFamily: fonts.sans,
            fontSize: 16,
            color: colors.ink,
          }}
        />
        <Button
          label="Save"
          disabled={!draftName.trim()}
          loading={busy}
          onPress={() =>
            run(async () => {
              await updateProfile({ displayName: draftName.trim() });
              setSheet(null);
            })
          }
        />
      </BottomSheet>
      <OptionSheet
        visible={sheet === 'language'}
        title="Language"
        options={[
          { key: 'en', label: 'English' },
          { key: 'te', label: 'తెలుగు · Coming soon', disabled: true },
          { key: 'hi', label: 'हिन्दी · Coming soon', disabled: true },
        ]}
        selected={[profile.language]}
        onClose={() => setSheet(null)}
        onSubmit={([language]) =>
          updateProfile({ language: language as Language })
        }
        hint="Hindi and Telugu are coming soon. English is available now."
      />
      <BottomSheet
        visible={sheet === 'account'}
        title="Your data and account"
        onClose={() => setSheet(null)}
      >
        <Button
          label="Download my data"
          variant="quiet"
          loading={busy}
          onPress={() =>
            run(async () => {
              await requestDataExport();
              toast.show('Data export requested');
            })
          }
        />
        <Button
          label="Delete account"
          variant="quiet"
          onPress={() => setSheet('delete')}
        />
      </BottomSheet>
      <BottomSheet
        visible={sheet === 'delete'}
        title="Delete your account?"
        onClose={() => {
          if (!busy) setSheet(null);
        }}
      >
        <AppText>
          This removes your profile and practice record from the app. It cannot
          be undone.
        </AppText>
        <Button
          label="Delete account"
          loading={busy}
          onPress={() =>
            run(async () => {
              await deleteAccount();
              setSheet(null);
              router.replace('/welcome');
            })
          }
        />
        <Button
          label="Keep my account"
          variant="quiet"
          disabled={busy}
          onPress={() => setSheet(null)}
        />
      </BottomSheet>
      {toast.node}
    </View>
  );
}

const styles = {
  heading: { fontFamily: fonts.displaySemibold, fontSize: 21, lineHeight: 32.55, color: colors.ink, marginBottom: 4 },
  link: { fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8 },
  settingsRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, minHeight: 53, paddingVertical: 14 },
  setting: { flex: 1, fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: colors.ink },
};

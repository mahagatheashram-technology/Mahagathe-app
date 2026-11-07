import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';
import { AppText, BottomSheet, Button, Icon, Screen, DetailHeader } from '@/components/ui';
import {
  useAccountActions,
  useMandala,
  useNotificationPrefs,
  useProfile,
  useSession,
  useSetNotificationPref,
  useUpdateProfile,
  type Language,
  type NotificationPrefs,
} from '@/data';
import { TimePickerSheet } from '@/features/sadhana/TimePickerSheet';
import { formatReminder } from '@/features/sadhana/format';
import { colors, fonts } from '@/theme/tokens';
import { OptionSheet } from './OptionSheet';
import { ToggleSwitch } from './ToggleSwitch';
import { useToast } from './Toast';

type Sheet =
  null | 'time' | 'language' | 'account' | 'delete' | 'edit' | 'morning';
const NOTIFICATIONS: {
  key: keyof NotificationPrefs;
  label: string;
  timing: string;
}[] = [
  { key: 'practiceReminder', label: 'Daily practice', timing: '6:00 AM' },
  { key: 'dailyVakyam', label: 'Morning teaching', timing: '7:00 AM' },
  { key: 'registeredEvents', label: 'My gatherings', timing: 'The day before' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { status, canUsePersonalFeatures, signOut } = useSession();
  const profile = useProfile();
  const prefs = useNotificationPrefs();
  const mandala = useMandala();
  const setPref = useSetNotificationPref();
  const updateProfile = useUpdateProfile();
  const { requestDataExport, deleteAccount } = useAccountActions();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [busy, setBusy] = useState(false);
  const [draftName, setDraftName] = useState('');
  const toast = useToast();
  const changePref = async (key: keyof NotificationPrefs, value: boolean) => {
    try {
      await setPref(key, value);
    } catch {
      toast.show('We could not save this change. Please try again.');
    }
  };
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    try {
      await action();
    } catch {
      toast.show('We could not save this change. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  if (
    status === 'loading' ||
    (canUsePersonalFeatures && (profile === undefined || prefs === undefined))
  )
    return (
      <Screen contentStyle={{ justifyContent: 'center' }}>
        <ActivityIndicator
          accessibilityLabel="Loading your profile"
          color={colors.actionRed}
        />
      </Screen>
    );
  if (!canUsePersonalFeatures || !profile || !prefs)
    return (
      <Screen contentStyle={{ paddingTop: 4, paddingHorizontal: 24, gap: 24 }}>
        <DetailHeader backLabel="Home" backHref="/" />
        <AppText variant="title">Your profile</AppText>
        <AppText>Sign in to keep your practice and reminders.</AppText>
        <Button label="Sign in" onPress={() => router.push('/welcome')} />
      </Screen>
    );
  const name = profile.displayName.trim() || 'Friend';
  return (
    <View style={{ flex: 1 }}>
      <Screen
        contentStyle={{
          paddingTop: 4,
          paddingHorizontal: 24,
          paddingBottom: 24,
        }}
      >
        <DetailHeader backLabel="Home" backHref="/" />
        <View style={{ paddingTop: 22, gap: 24 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={() => {
              setDraftName(name);
              setSheet('edit');
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                backgroundColor: colors.iconSand,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AppText
                style={{ fontFamily: fonts.serifSemibold, fontSize: 26 }}
              >
                {name.charAt(0).toUpperCase()}
              </AppText>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText
                accessibilityRole="header"
                style={{
                  fontFamily: fonts.serifSemibold,
                  fontSize: 24,
                  lineHeight: 31.2,
                }}
              >
                {name}
              </AppText>
              <AppText
                style={{
                  fontSize: 15,
                  lineHeight: 22.5,
                  color: colors.textSecondary,
                }}
              >
                {mandala === undefined
                  ? 'Loading your Mandala…'
                  : `${mandala?.sittingsDone ?? 0} sittings in your Mandala`}
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText style={styles.link}>Edit</AppText>
              <Icon name="chevronRight" size={15} />
            </View>
          </Pressable>
          <View>
            <AppText style={styles.heading}>Reminders</AppText>
            {NOTIFICATIONS.map((item, i) => {
              const on = prefs[item.key];
              const time =
                item.key === 'practiceReminder'
                  ? formatReminder(profile.reminderTime ?? '06:00')
                  : item.timing;
              return (
                <View
                  key={item.key}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    minHeight: 81,
                    paddingVertical: 8,
                    borderBottomWidth: i === 2 ? 0 : 1,
                    borderBottomColor: colors.divider,
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText
                      style={{
                        fontFamily: fonts.sansMedium,
                        fontSize: 16,
                        lineHeight: 24,
                      }}
                    >
                      {item.label}
                    </AppText>
                    {on && i < 2 ? (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Change time for ${item.label}`}
                        hitSlop={6}
                        onPress={() => setSheet(i === 0 ? 'time' : 'morning')}
                        style={{
                          alignSelf: 'flex-start',
                          height: 32,
                          justifyContent: 'center',
                          marginTop: 4,
                        }}
                      >
                        <View
                          style={{
                            height: 32,
                            paddingHorizontal: 10,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: colors.outline,
                            backgroundColor: colors.white,
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <AppText
                            style={{
                              fontFamily: fonts.sansSemibold,
                              fontSize: 13,
                              lineHeight: 20,
                            }}
                          >
                            {time}
                          </AppText>
                          <Icon
                            name="chevronDown"
                            size={12}
                            strokeWidth={2.4}
                          />
                        </View>
                      </Pressable>
                    ) : (
                      <AppText
                        style={{
                          fontSize: 14,
                          lineHeight: 21,
                          color: colors.textSecondary,
                        }}
                      >
                        {on ? '' : 'Off · '}
                        {time}
                      </AppText>
                    )}
                  </View>
                  <ToggleSwitch
                    value={on}
                    label={item.label}
                    onValueChange={(v) => changePref(item.key, v)}
                  />
                </View>
              );
            })}
          </View>
          <View>
            <AppText style={styles.heading}>Settings</AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Language"
              onPress={() => setSheet('language')}
              style={[
                styles.settingsRow,
                { borderBottomWidth: 1, borderBottomColor: colors.divider },
              ]}
            >
              <AppText style={styles.setting}>Language</AppText>
              <AppText style={{ fontSize: 15, color: colors.textSecondary }}>
                English
              </AppText>
              <Icon name="chevronRight" size={18} color={colors.chevron} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Your data and account"
              onPress={() => setSheet('account')}
              style={styles.settingsRow}
            >
              <AppText style={styles.setting}>Your data and account</AppText>
              <Icon name="chevronRight" size={18} color={colors.chevron} />
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            onPress={() =>
              run(async () => {
                await signOut();
                router.replace('/welcome');
              })
            }
            disabled={busy}
            style={{
              minHeight: 44,
              alignSelf: 'flex-start',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Icon name="signOut" size={18} strokeWidth={1.8} />
            <AppText style={{ ...styles.link, fontSize: 16 }}>Sign out</AppText>
          </Pressable>
        </View>
      </Screen>
      <TimePickerSheet
        visible={sheet === 'time'}
        value={profile.reminderTime}
        onClose={() => setSheet(null)}
        onSave={(reminderTime) => updateProfile({ reminderTime })}
      />
      <BottomSheet
        visible={sheet === 'morning'}
        title="Morning teaching"
        onClose={() => setSheet(null)}
      >
        <AppText>
          Morning teachings arrive at 7:00 AM. You can turn this reminder on or
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
  heading: {
    fontFamily: fonts.sansSemibold,
    fontSize: 13,
    lineHeight: 24,
    letterSpacing: 1.04,
    textTransform: 'uppercase' as const,
    color: colors.textSecondary,
  },
  link: { fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23 },
  settingsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    minHeight: 56,
  },
  setting: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 16,
    lineHeight: 24,
  },
};

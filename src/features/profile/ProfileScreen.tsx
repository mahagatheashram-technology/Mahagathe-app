import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';

import { AppText, BottomSheet, Button, Card, Icon, Screen } from '@/components/ui';
import {
  AGE_BANDS,
  ROLE_LABELS,
  brand,
  useAccountActions,
  useNotificationPrefs,
  useProfile,
  useSession,
  useSetNotificationPref,
  useUpdateProfile,
  type Language,
  type NotificationPrefs,
  type Role,
} from '@/data';
import { colors, fonts, radii } from '@/theme/tokens';
import { formatReminder } from '@/features/sadhana/format';
import { TimePickerSheet } from '@/features/sadhana/TimePickerSheet';
import { OptionSheet } from './OptionSheet';
import { SettingsRow, SettingsSection } from './Settings';
import { ToggleSwitch } from './ToggleSwitch';
import { useToast } from './Toast';

const LANGUAGES: { key: Language; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'te', label: 'తెలుగు' },
  { key: 'hi', label: 'हिन्दी' },
];

const NOTIFICATIONS: { key: keyof NotificationPrefs; label: string }[] = [
  { key: 'practiceReminder', label: 'Practice reminder' },
  { key: 'dailyVakyam', label: 'Guru Vākyam each morning' },
  { key: 'registeredEvents', label: 'Events I registered for' },
];

type Sheet = null | 'time' | 'roles' | 'language' | 'delete';

/** ProfileV3 — identity, practice, notifications, app settings. Guests see a sign-in card. */
export default function ProfileScreen() {
  const router = useRouter();
  const { status, signOut } = useSession();
  const profile = useProfile();
  const prefs = useNotificationPrefs();
  const setPref = useSetNotificationPref();
  const updateProfile = useUpdateProfile();
  const { requestDataExport, deleteAccount } = useAccountActions();
  const [sheet, setSheet] = useState<Sheet>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const version = (Constants.expoConfig?.version ?? '1.0').split('.').slice(0, 2).join('.');
  const footer = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', paddingTop: 6 }}>
      <Image source={brand.emblem} style={{ width: 18, height: 26.3 }} accessibilityIgnoresInvertColors />
      <AppText variant="caption">Mahagathe Foundation · v{version}</AppText>
    </View>
  );

  if (status === 'loading' || (status === 'signedIn' && (profile === undefined || prefs === undefined))) {
    return (
      <Screen contentStyle={{ justifyContent: 'center' }}>
        <ActivityIndicator color={colors.actionRed} accessibilityLabel="Loading" />
      </Screen>
    );
  }

  if (status !== 'signedIn' || !profile || !prefs) {
    return (
      <Screen contentStyle={styles.main}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={[styles.avatar, { backgroundColor: colors.sand }]}>
            <Icon name="profile" size={28} color={colors.muted} />
          </View>
          <AppText variant="title" style={{ fontSize: 26, lineHeight: 33 }}>
            Your profile
          </AppText>
        </View>
        <Card style={{ padding: 20, gap: 14 }}>
          <AppText variant="cardTitle">Sign in to keep your practice</AppText>
          <AppText>
            Your reminders, Mandala and registrations are kept for you once you sign in. Home and Wisdom stay open to
            everyone.
          </AppText>
          <Button label="Sign in" onPress={() => router.push('/welcome')} />
        </Card>
        {footer}
      </Screen>
    );
  }

  const ageLabel = AGE_BANDS.find((b) => b.value === profile.ageBand)?.label;
  const name = profile.displayName.trim() || 'Friend';
  const roles = profile.roles.map((r) => ROLE_LABELS[r]).join(', ');
  const language = LANGUAGES.find((l) => l.key === profile.language)?.label ?? 'English';

  return (
    <View style={{ flex: 1 }}>
      <Screen contentStyle={styles.main}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
            <AppText style={{ fontFamily: fonts.serifSemibold, fontSize: 26, lineHeight: 34 }} color={colors.white}>
              {name.charAt(0).toUpperCase()}
            </AppText>
          </View>
          <View style={{ gap: 2, flexShrink: 1 }}>
            <AppText
              accessibilityRole="header"
              numberOfLines={1}
              style={{ fontFamily: fonts.serifSemibold, fontSize: 26, lineHeight: 33 }}>
              {name}
            </AppText>
            <AppText variant="meta">{[profile.phoneMasked, ageLabel].filter(Boolean).join(' · ')}</AppText>
          </View>
        </View>

        <SettingsSection title="Practice">
          <SettingsRow
            label="Daily reminder"
            value={formatReminder(profile.reminderTime)}
            strongValue
            onPress={() => setSheet('time')}
          />
          <SettingsRow
            label="I am here as"
            value={roles || 'Choose'}
            last
            onPress={() => setSheet('roles')}
          />
        </SettingsSection>

        <SettingsSection title="Notifications">
          {NOTIFICATIONS.map((n, i) => (
            <SettingsRow
              key={n.key}
              label={n.label}
              last={i === NOTIFICATIONS.length - 1}
              onPress={() => setPref(n.key, !prefs[n.key])}
              accessibilityLabel={`${n.label}, ${prefs[n.key] ? 'on' : 'off'}`}
              right={<ToggleSwitch value={prefs[n.key]} label={n.label} onValueChange={(v) => setPref(n.key, v)} />}
            />
          ))}
        </SettingsSection>

        <SettingsSection title="App">
          <SettingsRow label="Language" value={language} onPress={() => setSheet('language')} />
          <SettingsRow
            label="Download my data"
            onPress={async () => {
              await requestDataExport();
              toast.show('Data export requested');
            }}
          />
          <SettingsRow
            label="Sign out"
            onPress={async () => {
              await signOut();
              router.replace('/welcome');
            }}
          />
          <SettingsRow label="Delete account" danger last onPress={() => setSheet('delete')} />
        </SettingsSection>

        {footer}
      </Screen>

      <TimePickerSheet
        visible={sheet === 'time'}
        value={profile.reminderTime}
        onClose={() => setSheet(null)}
        onSave={(reminderTime) => updateProfile({ reminderTime })}
      />
      <OptionSheet
        visible={sheet === 'roles'}
        title="I am here as"
        multi
        options={(Object.keys(ROLE_LABELS) as Role[]).map((r) => ({ key: r, label: ROLE_LABELS[r] }))}
        selected={profile.roles}
        onClose={() => setSheet(null)}
        onSubmit={(keys) => updateProfile({ roles: keys as Role[] })}
        hint="Choose all that apply."
      />
      <OptionSheet
        visible={sheet === 'language'}
        title="Language"
        options={LANGUAGES}
        selected={[profile.language]}
        onClose={() => setSheet(null)}
        onSubmit={([key]) => updateProfile({ language: key as Language })}
      />
      <BottomSheet visible={sheet === 'delete'} onClose={() => (deleting ? undefined : setSheet(null))} title="Delete your account?">
        <AppText style={{ fontSize: 15, lineHeight: 24 }}>
          This removes your profile and practice record from the app. It cannot be undone.
        </AppText>
        <View style={{ gap: 10, marginTop: 4 }}>
          <Button
            label="Delete account"
            loading={deleting}
            onPress={async () => {
              setDeleting(true);
              try {
                await deleteAccount();
                setSheet(null);
                router.replace('/welcome');
              } finally {
                setDeleting(false);
              }
            }}
          />
          <Button label="Keep my account" variant="quiet" onPress={() => setSheet(null)} disabled={deleting} />
        </View>
      </BottomSheet>
      {toast.node}
    </View>
  );
}

const styles = {
  main: { paddingTop: 4, paddingHorizontal: 20, paddingBottom: 24, gap: 22 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    backgroundColor: colors.actionRed,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
};

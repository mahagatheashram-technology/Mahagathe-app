import { Redirect, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText, Button, Icon, RedFeature } from '@/components/ui';
import { Emblem } from '@/components/ui/Emblem';
import { MOCK_STATUS_BAR, useStatusBarInset, useScreenInsets } from '@/components/ui/useStatusBarInset';
import { useProfile, useSession } from '@/data';
import { LanguagePill } from '@/features/onboarding/LanguagePill';
import { colors, fonts } from '@/theme/tokens';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useScreenInsets();
  const top = useStatusBarInset();
  const { status, continueAsGuest } = useSession();
  const profile = useProfile();

  // A signed-in user with a finished profile has no business here (e.g. after Back from Setup).
  if (status === 'signedIn' && profile?.displayName && profile.ageBand) return <Redirect href="/(tabs)" />;

  const explore = () => {
    continueAsGuest();
    // Guests prompted from inside the app arrive here on top of the tabs: go back to them.
    if (router.canGoBack()) router.dismissTo('/(tabs)');
    else router.replace('/(tabs)');
  };

  return (
    <RedFeature
      style={{
        ...styles.root,
        paddingTop: top + (60 - MOCK_STATUS_BAR),
        paddingBottom: Math.max(40, insets.bottom),
      }}>
      <View style={styles.langRow}>
        <LanguagePill />
      </View>

      <View style={styles.center}>
        <View style={styles.badge}>
          <Emblem width={98} />
        </View>
        <View style={styles.titleBlock}>
          <AppText accessibilityRole="header" style={styles.title}>
            Mahagathe
          </AppText>
          <AppText style={styles.motto}>सत्यं वद · धर्मं चर</AppText>
        </View>
        <AppText style={styles.tagline}>Daily guidance and practice from a living lineage.</AppText>
      </View>

      <View style={styles.actions}>
        <Button
          label="Continue with phone number"
          variant="onFeature"
          icon={<Icon name="phone" size={20} color={colors.actionRed} />}
          iconGap={10}
          onPress={() => router.push('/sign-in')}
        />
        <Button label="Explore as a guest" variant="ghostOnFeature" onPress={explore} />
        <AppText style={styles.note}>
          Guests can read Guru Vākyams and Wisdom. Sign in to practise, register for events and give.
        </AppText>
      </View>
    </RedFeature>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 28 },
  langRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  center: { flexGrow: 1, flexShrink: 1, alignItems: 'center', justifyContent: 'center', gap: 22 },
  badge: {
    width: 176,
    height: 176,
    borderRadius: 999,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadowNeutral,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  titleBlock: { alignItems: 'center', gap: 6 },
  title: { fontFamily: fonts.serifSemibold, fontSize: 40, lineHeight: 51, color: colors.white, textAlign: 'center' },
  motto: { fontFamily: fonts.deva, fontSize: 18, lineHeight: 30, color: colors.onFeatureMuted, textAlign: 'center' },
  tagline: {
    fontFamily: fonts.serif,
    fontSize: 18,
    lineHeight: 27,
    color: colors.white,
    textAlign: 'center',
    maxWidth: 290,
  },
  actions: { gap: 12 },
  note: {
    marginTop: 6,
    fontFamily: fonts.sans,
    fontSize: 12,
    lineHeight: 19.2,
    color: colors.onFeatureMuted,
    textAlign: 'center',
  },
});

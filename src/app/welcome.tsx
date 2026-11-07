import { Redirect, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Button, LineOrnament, Screen } from '@/components/ui';
import { Emblem } from '@/components/ui/Emblem';
import { useProfile, useSession } from '@/data';
import { LanguagePill } from '@/features/onboarding/LanguagePill';
import { colors, fonts } from '@/theme/tokens';
import { v12 } from '@/theme/v12';

export default function WelcomeScreen() {
  const router = useRouter();
  const { status, continueAsGuest } = useSession();
  const profile = useProfile();
  if (status === 'signedIn' && profile?.displayName && profile.ageBand) return <Redirect href="/(tabs)" />;

  const explore = () => {
    continueAsGuest();
    if (router.canGoBack()) router.dismissTo('/(tabs)');
    else router.replace('/(tabs)');
  };

  return (
    <Screen contentStyle={{ paddingTop: 4, paddingBottom: 64 }}>
      <View style={{ alignItems: 'flex-end', paddingHorizontal: 24 }}>
        <LanguagePill />
      </View>
      <View style={styles.center}>
        <View style={styles.ornament}>
          <View style={StyleSheet.absoluteFill}>
            <LineOrnament size={210} />
          </View>
          <View style={styles.badge}>
            <Emblem width={70} />
          </View>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <AppText accessibilityRole="header" style={styles.title}>
            Mahagathe
          </AppText>
          <AppText style={styles.motto}>सत्यं वद · धर्मं चर</AppText>
        </View>
        <AppText style={styles.tagline}>Daily practice and wisdom from a living lineage.</AppText>
      </View>
      <View style={{ paddingHorizontal: 24, gap: 6 }}>
        <Button
          label="Begin your practice"
          onPress={() => router.push(status === 'signedIn' ? '/setup' : '/sign-in')}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Look around first"
          onPress={explore}
          style={{ alignSelf: 'center', minHeight: 44, justifyContent: 'center' }}>
          <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 23, color: v12.muted }}>
            Look around first
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    paddingHorizontal: 32,
    paddingBottom: 8,
  },
  ornament: { width: 210, height: 210, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 124,
    height: 124,
    borderRadius: 999,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  title: { fontFamily: fonts.serifSemibold, fontSize: 38, lineHeight: 49, textAlign: 'center' },
  motto: {
    fontFamily: fonts.deva,
    fontSize: 17,
    lineHeight: 26,
    color: v12.label,
    textAlign: 'center',
  },
  tagline: { fontFamily: fonts.serif, fontSize: 19, lineHeight: 29.45, textAlign: 'center', maxWidth: 290 },
});

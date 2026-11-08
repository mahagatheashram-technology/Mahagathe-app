import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, View } from 'react-native';

import { AppText, LampRing, PrimaryButton, Screen } from '@/components/ui';
import { Emblem } from '@/components/ui/Emblem';
import { useProfile, useSession } from '@/data';
import { LanguagePill } from '@/features/onboarding/LanguagePill';
import { colors, fonts } from '@/theme/tokens';

const RING = 290;
/** V13Welcome: inset 50 inside the 290 ring, 6pt lamp halo around the white disc. */
const DISC = RING - 100;
const HALO = 6;

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
    <Screen background={colors.indigo} contentStyle={{ paddingBottom: 40 }}>
      <StatusBar style="light" />
      <View style={{ alignItems: 'flex-end', paddingHorizontal: 20 }}>
        <LanguagePill dark />
      </View>
      <View style={{ flexGrow: 1, alignItems: 'center', paddingTop: 24, paddingHorizontal: 28 }}>
        <LampRing
          done={1}
          size={RING}
          label="1 of 40 lamps lit"
          center={
            <View
              style={{
                width: DISC + HALO * 2,
                height: DISC + HALO * 2,
                borderRadius: (DISC + HALO * 2) / 2,
                backgroundColor: colors.lampGlow,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  width: DISC,
                  height: DISC,
                  borderRadius: DISC / 2,
                  backgroundColor: colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Emblem width={103} />
              </View>
            </View>
          }
        />
        <AppText
          accessibilityRole="header"
          style={{
            marginTop: 30,
            fontFamily: fonts.displaySemibold,
            fontSize: 44,
            lineHeight: 46.2,
            letterSpacing: -0.44,
            color: colors.white,
            textAlign: 'center',
          }}>
          Mahagathe
        </AppText>
        <AppText
          style={{
            marginTop: 8,
            fontFamily: fonts.display,
            fontSize: 21,
            lineHeight: 32.5,
            color: colors.lamp,
            textAlign: 'center',
          }}>
          सत्यं वद धर्मं चर
        </AppText>
        <AppText
          style={{
            marginTop: 16,
            maxWidth: 300,
            fontFamily: fonts.ui,
            fontSize: 17,
            lineHeight: 25.5,
            color: colors.onDark2,
            textAlign: 'center',
          }}>
          Sit each day, read the words of the Most Venerable Mahamuni and follow the Mahabharata, with the sangha of
          Mahagathe Ashram.
        </AppText>
      </View>
      <View style={{ paddingTop: 28, paddingHorizontal: 24, gap: 14, alignItems: 'center' }}>
        <PrimaryButton
          label="Begin your practice"
          onPress={() => router.push(status === 'signedIn' ? '/setup' : '/sign-in')}
          style={{ alignSelf: 'stretch' }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Look around first"
          onPress={explore}
          style={{ minHeight: 44, justifyContent: 'center' }}>
          <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: colors.white }}>
            Look around first
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

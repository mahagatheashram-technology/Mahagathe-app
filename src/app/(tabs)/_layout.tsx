import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/ui';
import { useProfile, useSession } from '@/data';

export default function TabsLayout() {
  const { status } = useSession();
  const profile = useProfile();
  // First run: signed-out users see Welcome. Guests can browse (T-01).
  if (status === 'signedOut') return <Redirect href="/welcome" />;
  // Signed in but setup unfinished (P-03/T-02): finish setup first. A minor waiting for
  // guardian consent may browse (setup's waiting step sends them here deliberately).
  if (
    status === 'signedIn' &&
    profile &&
    profile.guardianConsent !== 'pending' &&
    !(profile.displayName && profile.ageBand)
  ) {
    return <Redirect href="/setup" />;
  }

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="wisdom" />
      <Tabs.Screen name="sadhana" />
      <Tabs.Screen name="sangha" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

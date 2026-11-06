import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/ui';
import { useSession } from '@/data';

export default function TabsLayout() {
  const { status } = useSession();
  // First run: signed-out users see Welcome. Guests can browse (T-01).
  if (status === 'signedOut') return <Redirect href="/welcome" />;

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

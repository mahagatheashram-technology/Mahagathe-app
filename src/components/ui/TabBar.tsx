import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, View } from 'react-native';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { colors, fonts } from '@/theme/tokens';
const tabs: Record<string, { label: string; icon: IconName; color: string }> = {
  index: { label: 'Home', icon: 'home', color: colors.v14Ink },
  practice: { label: 'Practice', icon: 'lampi', color: colors.indigo },
  wisdom: { label: 'Wisdom', icon: 'leafi', color: colors.wisdomTab },
  sangha: { label: 'Sangha', icon: 'people', color: colors.laterite },
};
/** v14 tab colours locate each place. The hall uses its indigo variant. */
export function TabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  const dark = state.routes[state.index]?.name === 'practice';
  return <View accessibilityRole="tablist" style={{ flexDirection: 'row', backgroundColor: dark ? colors.indigo : colors.white, borderTopWidth: 1, borderTopColor: dark ? colors.darkLine : colors.line, paddingBottom: Math.max(insets.bottom, 18), minHeight: 78 }}>
    {state.routes.map((route, i) => {
      const tab = tabs[route.name]; if (!tab) return null;
      const active = state.index === i;
      const color = active ? dark ? colors.lamp : tab.color : dark ? colors.onDark2 : colors.v14TabInactive;
      return <Pressable key={route.key} accessibilityRole="tab" accessibilityState={{ selected: active }} aria-selected={active} accessibilityLabel={tab.label} onPress={() => navigateToTab(route.key)} style={{ position: 'relative', flex: 1, alignItems: 'center', gap: 2, paddingTop: 9, minHeight: 59 }}>
        {active && <View style={{ position: 'absolute', top: 0, width: 28, height: 3, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, backgroundColor: color }} />}
        <Icon name={tab.icon} size={24} color={color} strokeWidth={active ? 2 : 1.7} />
        <AppText style={{ fontSize: 12.5, lineHeight: 19.375, color, fontFamily: active ? fonts.uiSemibold : fonts.uiMedium }}>{tab.label}</AppText>
      </Pressable>;
    })}
  </View>;
}

import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { colors, fonts } from '@/theme/tokens';

/** Bottom nav exactly as in the mocks: white bar, 1px top border, 24px icons, 11px labels. */
const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Home', icon: 'home' },
  wisdom: { label: 'Wisdom', icon: 'wisdom' },
  sadhana: { label: 'Sādhanā', icon: 'sadhana' },
  sangha: { label: 'Sangha', icon: 'sangha' },
  profile: { label: 'Profile', icon: 'profile' },
};

export function TabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) + 8 }]}>
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const active = state.index === i;
        const color = active ? colors.actionRed : colors.muted;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => navigateToTab(route.key)}
            style={styles.item}>
            <Icon name={tab.icon} size={24} color={color} strokeWidth={active ? 2.2 : 2} />
            <AppText
              style={{ fontSize: 11, lineHeight: 16, color, fontFamily: active ? fonts.sansSemibold : fonts.sansMedium }}>
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    paddingHorizontal: 6,
  },
  item: { alignItems: 'center', gap: 4, minWidth: 60, minHeight: 44 },
});

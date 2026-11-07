import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { colors, fonts } from '@/theme/tokens';

/** Bottom nav exactly as in the mocks: white bar, 1px top border, 24px icons, 11px labels. */
const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Home', icon: 'home' },
  practice: { label: 'Practice', icon: 'sadhana' },
  wisdom: { label: 'Wisdom', icon: 'wisdom' },
  sangha: { label: 'Sangha', icon: 'sangha' },
};

export function TabBar({ state, navigateToTab, insets }: BottomTabBarProps) {
  return (
    <View
      accessibilityRole="tablist"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 26) }]}
    >
      {state.routes.map((route, i) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const active = state.index === i;
        const color = active ? colors.actionRed : colors.tabInactive;
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            onPress={() => navigateToTab(route.key)}
            style={styles.item}
          >
            <Icon
              name={tab.icon}
              size={24}
              color={color}
              strokeWidth={active ? 2.1 : 1.8}
            />
            <AppText
              style={{
                fontSize: 13,
                lineHeight: 20,
                color,
                fontFamily: active ? fonts.sansSemibold : fonts.sansMedium,
              }}
            >
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
    borderTopColor: colors.divider,
    paddingTop: 10,
    paddingHorizontal: 6,
  },
  item: { alignItems: 'center', gap: 4, minWidth: 72, minHeight: 48 },
});

import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View, type ScrollViewProps, type ViewStyle } from 'react-native';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { colors } from '@/theme/tokens';

/**
 * Scrollable cream page. `edgeToEdgeTop` lets a red feature block run under the status bar
 * (Home, Wisdom, Sādhanā, Sangha); otherwise the top safe-area inset is applied.
 */
export function Screen({
  children,
  edgeToEdgeTop,
  background = colors.cream,
  contentStyle,
  scroll = true,
  footer,
  scrollProps,
}: {
  children: ReactNode;
  edgeToEdgeTop?: boolean;
  background?: string;
  contentStyle?: ViewStyle;
  scroll?: boolean;
  /** Pinned bottom area (e.g. primary CTA on detail screens). */
  footer?: ReactNode;
  /** Extra ScrollView props (e.g. keyboardShouldPersistTaps). */
  scrollProps?: ScrollViewProps;
}) {
  const insets = useScreenInsets();
  const top = edgeToEdgeTop ? 0 : insets.top;
  const body = scroll ? (
    <ScrollView
      {...scrollProps}
      style={{ flex: 1 }}
      contentContainerStyle={[{ flexGrow: 1 }, contentStyle, { paddingTop: top + (typeof contentStyle?.paddingTop === 'number' ? contentStyle.paddingTop : 0) }]}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, contentStyle, { paddingTop: top + (typeof contentStyle?.paddingTop === 'number' ? contentStyle.paddingTop : 0) }]}>{children}</View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: background }}>
      {body}
      {footer ? <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>{footer}</View> : null}
    </View>
  );
}

/** Top row on detail screens: 44px back button · centered meta label · optional trailing action. */
export function DetailHeader({
  label,
  onBack,
  backIcon = 'back',
  trailing,
  tint = colors.ink,
  labelColor = colors.muted,
}: {
  label?: string;
  onBack?: () => void;
  backIcon?: IconName;
  trailing?: ReactNode;
  tint?: string;
  labelColor?: string;
}) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/')))}
        style={[styles.iconBtn, { marginLeft: -10 }]}>
        <Icon name={backIcon} size={22} color={tint} />
      </Pressable>
      {label ? (
        <AppText variant="meta" color={labelColor}>
          {label}
        </AppText>
      ) : (
        <View />
      )}
      <View style={[styles.iconBtn, { marginRight: -10 }]}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});

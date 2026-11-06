import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { MOCK_STATUS_BAR, useStatusBarInset, useScreenInsets } from '@/components/ui/useStatusBarInset';
import { colors, fonts, radii } from '@/theme/tokens';

/**
 * Calm cream page shared by Sign-in, Setup and the guardian-consent step (SetupV3 layout):
 * 24px gutters, 26px between blocks, a spacer, then the pinned-feeling primary CTA.
 * Children and `cta` are siblings of one column so the spacer pushes the CTA down exactly as in the mock.
 */
export function AuthScaffold({
  stepLabel,
  onBack,
  children,
  cta,
}: {
  stepLabel: string;
  onBack: () => void;
  children: ReactNode;
  cta: ReactNode;
}) {
  const insets = useScreenInsets();
  const top = useStatusBarInset();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          gap: 26,
          paddingHorizontal: 24,
          paddingTop: top + (56 - MOCK_STATUS_BAR),
          paddingBottom: Math.max(32, insets.bottom),
        }}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onBack}
            style={[styles.back, { marginLeft: -10 }]}>
            <Icon name="back" size={22} color={colors.ink} />
          </Pressable>
          <AppText variant="meta" style={{ fontSize: 13, lineHeight: 19.5 }}>
            {stepLabel}
          </AppText>
          <View style={{ width: 34 }} />
        </View>
        {children}
        <View style={{ flexGrow: 1 }} />
        {cta}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ gap: 8 }}>
      <AppText
        accessibilityRole="header"
        style={{ fontFamily: fonts.serifSemibold, fontSize: 30, lineHeight: 36, color: colors.ink }}>
        {title}
      </AppText>
      <AppText style={{ fontSize: 14, lineHeight: 22.4, color: colors.muted }}>{subtitle}</AppText>
    </View>
  );
}

/** Sand callout with a red shield (SetupV3 consent note). */
export function InfoCallout({ children }: { children: ReactNode }) {
  return (
    <View style={styles.callout}>
      <View style={{ marginTop: 2 }}>
        <Icon name="shield" size={20} color={colors.actionRed} />
      </View>
      <AppText style={{ flex: 1, fontSize: 13, lineHeight: 20.8 }}>{children}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  callout: { flexDirection: 'row', gap: 12, padding: 16, borderRadius: radii.xl, backgroundColor: colors.sand },
});

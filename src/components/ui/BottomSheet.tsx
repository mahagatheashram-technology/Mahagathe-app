import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';

import { AppText } from './AppText';
import { colors, radii } from '@/theme/tokens';

/**
 * Bottom sheet used for pickers, explainers and confirmations.
 * White surface, 24pt top radius, scrim behind. Closes on scrim tap, Android back, or the caller.
 * Stays mounted while it animates out so the exit is smooth.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  scrollable = true,
  label,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  scrollable?: boolean;
  label?: string;
}) {
  const insets = useScreenInsets();
  const [mounted, setMounted] = useState(visible);
  const [progress] = useState(() => new Animated.Value(visible ? 1 : 0));
  const native = Platform.OS !== 'web';

  // Mount as soon as it is asked to show (adjusting state during render, not in an effect).
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 260 : 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: native,
    });
    anim.start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
    return () => anim.stop();
  }, [visible, progress, native]);

  if (!mounted) return null;

  return (
    <Modal transparent animationType="none" visible onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim, opacity: progress }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          accessibilityLabel={label ?? title}
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 16) + 8,
              transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [360, 0] }) }],
            },
          ]}>
          <View style={styles.handle} />
          {title ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <AppText variant="section" style={{ flex: 1 }} accessibilityRole="header">{title}</AppText>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}>
                <AppText color={colors.actionRed}>Close</AppText>
              </Pressable>
            </View>
          ) : null}
          {scrollable ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 12, paddingBottom: 4 }}>{children}</ScrollView> : children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 12,
    maxHeight: '88%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginBottom: 8,
  },
});

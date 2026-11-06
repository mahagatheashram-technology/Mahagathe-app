import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Dimensions, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { colors, fonts, radii } from '@/theme/tokens';

/** Title row with a visible Close action (not only scrim tap / swipe). */
export function SheetHeader({ title, eyebrow, onClose }: { title: string; eyebrow?: string; onClose: () => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <View style={{ flexShrink: 1 }}>
        {eyebrow ? <AppText variant="eyebrow">{eyebrow}</AppText> : null}
        <AppText accessibilityRole="header" variant="section">
          {title}
        </AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        style={{ minWidth: 44, height: 44, alignItems: 'flex-end', justifyContent: 'center', marginRight: -4 }}>
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, color: colors.actionRed }}>Close</AppText>
      </Pressable>
    </View>
  );
}

/** Bottom sheet on the cream surface: scrim, grabber, 24pt top radius. Tap the scrim or press back to close. */
export function Sheet({
  visible,
  onClose,
  label,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  /** Accessibility name of the dialog. */
  label: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const [progress] = useState(() => new Animated.Value(visible ? 1 : 0));
  if (visible && !mounted) setMounted(true);

  useEffect(() => {
    if (visible) {
      Animated.timing(progress, { toValue: 1, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    } else {
      Animated.timing(progress, { toValue: 0, duration: 180, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(
        ({ finished }) => {
          if (finished) setMounted(false);
        },
      );
    }
  }, [visible, progress]);

  const height = Dimensions.get('window').height;
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [height * 0.6, 0] });

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim, opacity: progress }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          accessibilityLabel={label}
          style={[
            styles.sheet,
            { paddingBottom: Math.max(insets.bottom, 16) + 8, maxHeight: height * 0.88, transform: [{ translateY }] },
          ]}>
          <View style={styles.grabber} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
});

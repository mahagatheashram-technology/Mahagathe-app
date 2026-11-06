import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, fonts, radii } from '@/theme/tokens';

/** Small confirmation toast. `show('text')` displays it for ~2.6 s; render `node` above the screen content. */
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string) => {
      if (timer.current) clearTimeout(timer.current);
      setMessage(text);
      Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: Platform.OS !== 'web' }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: Platform.OS !== 'web' }).start(({ finished }) => {
          if (finished) setMessage(null);
        });
      }, 2600);
    },
    [opacity],
  );
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const node = message ? (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={[styles.toast, { opacity }]} accessibilityLiveRegion="polite" accessibilityRole="alert">
        <AppText style={styles.text}>{message}</AppText>
      </Animated.View>
    </View>
  ) : null;
  return { show, node };
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 20, right: 20, bottom: 20, alignItems: 'center' },
  toast: { backgroundColor: colors.ink, borderRadius: radii.pill, paddingVertical: 12, paddingHorizontal: 20 },
  text: { fontFamily: fonts.sansMedium, fontSize: 14, lineHeight: 20, color: colors.white, textAlign: 'center' },
});

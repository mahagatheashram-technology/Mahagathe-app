import { useEffect, useState } from 'react';
import { Animated, Platform, Pressable } from 'react-native';

import { colors, radii } from '@/theme/tokens';

/**
 * Switch from ProfileV3: 48×28 track, 22pt white knob 3pt inset. Red track when on, #D6C3AE when off.
 * The knob's position and the state label ("On"/"Off") are exposed to assistive tech, so it never relies on colour alone.
 */
export function ToggleSwitch({
  value,
  onValueChange,
  label,
}: {
  value: boolean;
  onValueChange: (next: boolean) => void;
  label: string;
}) {
  const [x] = useState(() => new Animated.Value(value ? 1 : 0));
  useEffect(() => {
    Animated.timing(x, {
      toValue: value ? 1 : 0,
      duration: 140,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [value, x]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      aria-checked={value}
      accessibilityState={{ checked: value }}
      hitSlop={{ top: 7, bottom: 7, left: 0, right: 0 }}
      onPress={() => onValueChange(!value)}
      style={{
        width: 50,
        height: 30,
        borderRadius: radii.pill,
        backgroundColor: value ? colors.actionRed : colors.switchOff,
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 3,
          left: 3,
          width: 24,
          height: 24,
          borderRadius: radii.pill,
          backgroundColor: colors.white,
          transform: [
            {
              translateX: x.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 20],
              }),
            },
          ],
        }}
      />
    </Pressable>
  );
}

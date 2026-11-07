import { useEffect, useState } from 'react';
import { PanResponder, Platform, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';
import { formatClock } from './format';

const fractionAt = (x: number, w: number) => (w > 0 ? Math.min(1, Math.max(0, x / w)) : 0);

/**
 * Player scrubber from PlayerV3: 4pt track on rgba white, 16pt white thumb, elapsed/total below.
 * Drag (or tap) anywhere on the 44pt-tall touch area to seek; the seek is committed on release.
 * Exposed to screen readers as an adjustable slider (swipe up/down = ±15 s).
 */
export function Scrubber({
  positionSec,
  durationSec,
  onSeek,
  disabled,
}: {
  positionSec: number;
  durationSec: number;
  onSeek: (sec: number) => void;
  disabled?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const [dragFraction, setDragFraction] = useState<number | null>(null);
  // Mutable bag read by the gesture callbacks (created once); refreshed after every render.
  const [live] = useState(() => ({ width: 0, durationSec, onSeek, disabled: !!disabled, startX: 0 }));
  useEffect(() => {
    Object.assign(live, { width, durationSec, onSeek, disabled: !!disabled });
  });

  const [responder] = useState(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => !live.disabled,
      onMoveShouldSetPanResponder: () => !live.disabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        live.startX = e.nativeEvent.locationX;
        setDragFraction(fractionAt(live.startX, live.width));
      },
      onPanResponderMove: (_e, g) => setDragFraction(fractionAt(live.startX + g.dx, live.width)),
      onPanResponderRelease: (_e, g) => {
        const f = fractionAt(live.startX + g.dx, live.width);
        setDragFraction(null);
        live.onSeek(f * live.durationSec);
      },
      onPanResponderTerminate: () => setDragFraction(null),
    }),
  );

  const fraction = dragFraction ?? (durationSec > 0 ? Math.min(1, positionSec / durationSec) : 0);
  const shownSec = dragFraction != null ? dragFraction * durationSec : positionSec;

  return (
    <View style={{ gap: 8 }}>
      <View
        {...responder.panHandlers}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        accessible
        accessibilityRole="adjustable"
        accessibilityState={{ disabled: !!disabled }}
        tabIndex={disabled ? -1 : 0}
        accessibilityLabel="Position"
        accessibilityValue={{ min: 0, max: Math.round(durationSec), now: Math.round(positionSec) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) =>
          !disabled && onSeek(Math.max(0, Math.min(durationSec, positionSec + (e.nativeEvent.actionName === 'increment' ? 15 : -15))))
        }
        {...(Platform.OS === 'web' ? { onKeyDown: (event: object) => {
          const e = event as { key: string; preventDefault: () => void };
          if (disabled) return;
          const next = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? positionSec + 15
            : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? positionSec - 15
            : e.key === 'Home' ? 0 : e.key === 'End' ? durationSec : null;
          if (next !== null) { e.preventDefault(); onSeek(Math.max(0, Math.min(durationSec, next))); }
        } } : {})}
        style={styles.hit}>
        <View pointerEvents="none" style={styles.track}>
          <View style={[styles.fill, { width: `${fraction * 100}%` }]} />
          <View style={[styles.thumb, { left: fraction * width - 8 }]} />
        </View>
      </View>
      <View style={styles.times}>
        <AppText style={styles.time}>{formatClock(shownSec)}</AppText>
        <AppText style={styles.time}>{formatClock(durationSec)}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 44pt touch target around a 4pt track; negative margins keep the layout height at 4pt.
  hit: { height: 44, marginVertical: -20, justifyContent: 'center' },
  track: { height: 4, borderRadius: 4, backgroundColor: colors.playerTrack, justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 4, backgroundColor: colors.playerMuted },
  thumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: colors.white,
  },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontSize: 12, lineHeight: 17.5, fontFamily: fonts.sansMedium, color: colors.playerMuted },
});

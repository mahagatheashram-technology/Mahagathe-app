import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, G } from 'react-native-svg';

import { AppText } from './AppText';
import { colors, fonts } from '@/theme/tokens';

/** The fine-line lotus from the locked v12 mock. Decorative, never announced. */
export function MandalaOrnament({
  size,
  opacity = 0.6,
  color = colors.ornament,
}: {
  size: number;
  opacity?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      stroke={color}
      strokeWidth={0.8}
      opacity={opacity}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Circle cx={100} cy={100} r={96} />
      <Circle cx={100} cy={100} r={80} />
      <Circle cx={100} cy={100} r={30} />
      <Circle cx={100} cy={100} r={18} />
      {Array.from({ length: 16 }, (_, i) => (
        <Ellipse
          key={i}
          cx={100}
          cy={52}
          rx={9}
          ry={22}
          transform={`rotate(${i * 22.5} 100 100)`}
        />
      ))}
    </Svg>
  );
}

/** Forty sittings clockwise from noon. Stroke-inclusive dot diameters stay below their chord spacing. */
export function MandalaRing({
  size = 250,
  sittingsDone,
  showCount = false,
}: {
  size?: number;
  sittingsDone: number;
  showCount?: boolean;
}) {
  const count = Math.min(
    40,
    Math.max(0, Math.floor(Number.isFinite(sittingsDone) ? sittingsDone : 0)),
  );
  const diameter = Number.isFinite(size) ? Math.max(1, size) : 250;
  const center = diameter / 2;
  const radius = diameter / 2 - Math.min(14, diameter * 0.135);
  const orbit = Math.max(0, radius);
  const chord = 2 * orbit * Math.sin(Math.PI / 40);
  const stroke = Math.min(1.2, chord * 0.2);
  const dot = Math.min(
    Math.max(diameter * 0.01, (diameter - 28) * 0.0266),
    (chord - stroke) * 0.45,
  );
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`${count} of 40 sittings`}
      style={{ width: diameter, height: diameter }}
    >
      {diameter >= 100 ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { alignItems: 'center', justifyContent: 'center', opacity: 0.35 },
          ]}
        >
          <MandalaOrnament size={diameter * 0.6} />
        </View>
      ) : null}
      <Svg
        width={diameter}
        height={diameter}
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        <G>
          {Array.from({ length: 40 }, (_, i) => {
            const angle = (i * Math.PI) / 20 - Math.PI / 2;
            return (
              <Circle
                key={i}
                cx={center + orbit * Math.cos(angle)}
                cy={center + orbit * Math.sin(angle)}
                r={dot}
                fill={i < count ? colors.actionRed : 'none'}
                stroke={i < count ? 'none' : colors.mandalaPending}
                strokeWidth={stroke}
              />
            );
          })}
        </G>
      </Svg>
      {showCount ? (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { alignItems: 'center', justifyContent: 'center' },
          ]}
        >
          <AppText
            style={{
              fontFamily: fonts.serifSemibold,
              fontSize: diameter * 0.24,
              lineHeight: diameter * 0.24,
            }}
          >
            {count}
          </AppText>
          <AppText
            style={{
              fontFamily: fonts.sansMedium,
              fontSize: 15,
              lineHeight: 22.5,
              color: colors.textSecondary,
            }}
          >
            of 40 sittings
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

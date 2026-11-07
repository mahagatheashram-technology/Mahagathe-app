import Svg, { Circle, Ellipse } from 'react-native-svg';
import { colors } from '@/theme/tokens';

/** The sixteen-petal gold line ornament from the locked Welcome and Paramparā mocks. */
export function LineOrnament({ size, opacity = 0.7 }: { size: number; opacity?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      stroke={colors.ornament}
      strokeWidth={0.8}
      opacity={opacity}
      accessibilityElementsHidden
      importantForAccessibility="no">
      {[96, 80, 30, 18].map((r) => (
        <Circle key={r} cx={100} cy={100} r={r} />
      ))}
      {Array.from({ length: 16 }, (_, i) => (
        <Ellipse key={i} cx={100} cy={52} rx={9} ry={22} transform={`rotate(${i * 22.5} 100 100)`} />
      ))}
    </Svg>
  );
}

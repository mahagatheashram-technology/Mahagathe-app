import { View, type DimensionValue } from 'react-native';

/** Quiet placeholder block shown while a query is loading (hook returned `undefined`). */
export function Skeleton({
  width = '100%',
  height,
  radius = 8,
  onRed,
}: {
  width?: DimensionValue;
  height: number;
  radius?: number;
  onRed?: boolean;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: onRed ? 'rgba(255,255,255,0.18)' : 'rgba(76,21,21,0.08)',
      }}
    />
  );
}

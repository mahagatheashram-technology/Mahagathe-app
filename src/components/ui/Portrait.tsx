import type { ReactNode } from 'react';
import { Image, View, useWindowDimensions, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme/tokens';
const photo = require('../../../assets/photos/mahamuni-portrait.jpg');
export type PortraitProps = ViewProps & { size?: number; ringColor?: string };
/** 560px square centered on (450,470) in the original 900×1600 image. */
export function Portrait({ size = 34, ringColor, style, ...props }: PortraitProps) {
  const k = size / 560;
  return <View accessible accessibilityRole="image" accessibilityLabel="Mahamuni" {...props} style={[{ width: size, height: size, borderRadius: size / 2, flexShrink: 0, overflow: 'hidden', outlineColor: ringColor, outlineWidth: ringColor ? 2 : 0 }, style]}><Image accessible={false} source={photo} resizeMode="stretch" style={{ position: 'absolute', width: 900 * k, height: 1600 * k, left: -170 * k, top: -190 * k }} /></View>;
}
export type PortraitHeaderProps = ViewProps & { width?: number; height?: number; title?: ReactNode; titleSlot?: ReactNode };
export function PortraitHeader({ width, height = 470, title, titleSlot, children, style, ...props }: PortraitHeaderProps) {
  const window = useWindowDimensions();
  const w = width ?? window.width;
  return <View accessibilityLabel="Portrait of Most Venerable Mahamuni" {...props} style={[{ width: w, height, overflow: 'hidden' }, style]}><Image accessible={false} source={photo} resizeMode="stretch" style={{ position: 'absolute', width: w, height: w * 1600 / 900, top: -26 * w / 390 }} /><LinearGradient pointerEvents="none" colors={[colors.portraitScrimTop, 'transparent', 'transparent', colors.portraitScrimBottom]} locations={[0, .22, .62, 1]} style={{ position: 'absolute', inset: 0 }} />{children}<View style={{ position: 'absolute', left: 24, right: 24, bottom: 22 }}>{titleSlot ?? title}</View></View>;
}

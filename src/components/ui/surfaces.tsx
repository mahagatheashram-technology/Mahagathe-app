import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { colors, gradients, radii, shadows } from '@/theme/tokens';

/**
 * The four surfaces of the v3 system: cream page, sand band, white card, red feature.
 * "One red feature block per browsing screen, at most."
 */

export function RedFeature({ style, children, ...rest }: ViewProps & { style?: ViewStyle }) {
  return (
    <LinearGradient colors={gradients.feature} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={style} {...rest}>
      {children}
    </LinearGradient>
  );
}

export function SandBand({ style, ...rest }: ViewProps) {
  return <View style={[{ backgroundColor: colors.sand }, style]} {...rest} />;
}

/** White card, 1px #E9DFD3 border. `raised` = floating card with shadow, no border (Home practice card). */
export function Card({
  style,
  raised,
  radius = radii.card,
  ...rest
}: ViewProps & { raised?: boolean; radius?: number }) {
  return (
    <View
      style={[
        { backgroundColor: colors.white, borderRadius: radius },
        raised ? shadows.card : { borderWidth: 1, borderColor: colors.border },
        style,
      ]}
      {...rest}
    />
  );
}

/** Small pill tag: sand fill with optional red icon ("Verbatim"), or dashed outline ("Paraphrase"). */
export function Chip({
  label,
  icon,
  variant = 'sand',
  style,
}: {
  label: string;
  icon?: IconName;
  variant?: 'sand' | 'dashed';
  style?: ViewStyle;
}) {
  const dashed = variant === 'dashed';
  return (
    <View
      style={[
        chipStyles.chip,
        dashed ? { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.muted } : { backgroundColor: colors.sand },
        style,
      ]}>
      {icon ? <Icon name={icon} size={13} color={colors.actionRed} strokeWidth={2.2} /> : null}
      <AppText variant="label" style={{ fontSize: 12, color: dashed ? colors.muted : colors.ink }}>
        {label}
      </AppText>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 30,
    paddingHorizontal: 12,
    borderRadius: radii.pill,
  },
});

/** Placeholder for a photo that needs approval (e.g. Gurudev portrait). */
export function ApprovedPhotoPlaceholder({
  size = 48,
  onRed,
  label = 'Approved photo',
}: {
  size?: number;
  onRed?: boolean;
  label?: string;
}): ReactNode {
  return (
    <View
      accessibilityLabel="Photo placeholder, awaiting approved photo"
      style={{
        width: size,
        height: size,
        borderRadius: radii.pill,
        borderWidth: 2,
        borderColor: onRed ? colors.onFeatureMuted : colors.actionRed,
        backgroundColor: onRed ? colors.featureDeep : colors.sand,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
      }}>
      <AppText
        style={{ fontSize: Math.max(8, size / 6), lineHeight: Math.max(10, size / 5), textAlign: 'center' }}
        color={onRed ? colors.onFeatureMuted : colors.muted}>
        {label}
      </AppText>
    </View>
  );
}

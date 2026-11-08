import type { ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, View, type TextProps, type ViewStyle } from 'react-native';
import { AppText, BackPill, LeafBand, Portrait, Screen } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import { fonts, v14Colors as c } from '@/theme/tokens';

export function LibraryText({ style, ...props }: TextProps) {
  return (
    <AppText
      {...props}
      style={[{ fontFamily: fonts.ui, fontSize: 16, lineHeight: 24.8, color: c.ink }, style]}
    />
  );
}
export function LibraryHeading({ size = 21, style, ...props }: TextProps & { size?: number }) {
  return (
    <AppText
      accessibilityRole="header"
      {...props}
      style={[
        {
          fontFamily: fonts.displaySemibold,
          fontSize: size,
          lineHeight: size * 1.55,
          color: c.ink,
        },
        style,
      ]}
    />
  );
}
export function LibraryPage({
  children,
  ...props
}: Omit<Parameters<typeof Screen>[0], 'background'>) {
  return (
    <Screen edgeToEdgeTop background={c.limewash} {...props}>
      {children}
    </Screen>
  );
}
export function LibraryHeader({
  children,
  style,
  back = true,
}: {
  children?: ReactNode;
  style?: ViewStyle;
  back?: boolean;
}) {
  const insets = useScreenInsets();
  const router = useRouter();
  return (
    <LeafBand
      style={[{ paddingTop: insets.top + 2, paddingHorizontal: 16, paddingBottom: 20 }, style]}
    >
      {back && <BackPill destination="Wisdom" onPress={() => router.dismissTo('/(tabs)/wisdom')} />}
      {children}
    </LeafBand>
  );
}
export function Attribution({
  children = 'Mahamuni’s word for today',
  color = c.darkLeaf,
}: {
  children?: ReactNode;
  color?: string;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Portrait />
      <LibraryText style={{ fontSize: 15, lineHeight: 23.25, color }}>{children}</LibraryText>
    </View>
  );
}
export function LibraryRow({
  children,
  onPress,
  label,
  style,
}: {
  children: ReactNode;
  onPress: () => void;
  label: string;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [{ minHeight: 44, opacity: pressed ? 0.7 : 1 }, style]}
    >
      {children}
    </Pressable>
  );
}
export function wordDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Kolkata',
  });
}

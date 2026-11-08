import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { AppText, BottomSheet } from '@/components/ui';
import { v14Colors as colors, fonts } from '@/theme/tokens';

/** Title row with a visible Close action (not only scrim tap / swipe). */
export function SheetHeader({
  title,
  eyebrow,
  onClose,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}
    >
      <View style={{ flexShrink: 1 }}>
        {eyebrow ? (
          <AppText style={{ fontSize: 15, lineHeight: 23.25, color: colors.text2 }}>
            {eyebrow}
          </AppText>
        ) : null}
        <AppText accessibilityRole="header" variant="v14Section">
          {title}
        </AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        onPress={onClose}
        style={{
          minWidth: 44,
          height: 44,
          alignItems: 'flex-end',
          justifyContent: 'center',
          marginRight: -4,
        }}
      >
        <AppText style={{ fontFamily: fonts.sansSemibold, fontSize: 14, color: colors.actionRed }}>
          Close
        </AppText>
      </Pressable>
    </View>
  );
}

export function Sheet({
  visible,
  onClose,
  label,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} label={label} scrollable={false}>
      {children}
    </BottomSheet>
  );
}

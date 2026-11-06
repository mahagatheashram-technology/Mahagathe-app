import { ActivityIndicator, Pressable } from 'react-native';

import { AppText, Icon } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';

/** Register (outline) ↔ Going (sand + check). `lg` = 44px on the photo card, `sm` = 40px in list rows. */
export function RegisterButton({
  registered,
  busy,
  size,
  eventTitle,
  onPress,
}: {
  registered: boolean;
  busy?: boolean;
  size: 'lg' | 'sm';
  eventTitle: string;
  onPress: () => void;
}) {
  const lg = size === 'lg';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={registered ? `Going to ${eventTitle}. Double tap to cancel` : `Register for ${eventTitle}`}
      accessibilityState={{ selected: registered, busy: !!busy, disabled: !!busy }}
      disabled={busy}
      onPress={onPress}
      hitSlop={size === 'sm' ? 2 : 0}
      style={({ pressed }) => [
        {
          height: lg ? 44 : 40,
          paddingHorizontal: registered ? (lg ? 16 : 12) : lg ? 18 : 14,
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          minWidth: 44,
        },
        registered
          ? { backgroundColor: colors.sand }
          : { borderWidth: 1.5, borderColor: colors.actionRed, backgroundColor: 'transparent' },
        pressed && { opacity: 0.8 },
      ]}>
      {busy ? (
        <ActivityIndicator size="small" color={registered ? colors.ink : colors.actionRed} />
      ) : (
        <>
          {registered ? <Icon name="check" size={14} color={colors.ink} strokeWidth={2.6} /> : null}
          <AppText
            style={{
              fontFamily: fonts.sansSemibold,
              fontSize: lg ? (registered ? 13 : 14) : 13,
              lineHeight: 20,
              color: registered ? colors.ink : colors.actionRed,
            }}>
            {registered ? 'Going' : 'Register'}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

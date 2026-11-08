import { Pressable, View } from 'react-native';

import { Sheet, SheetHeader } from './Sheet';
import { TEXT_SIZES, setTextSize, useTextSize, type TextSizeKey } from './textSize';
import { AppText, Icon } from '@/components/ui';
import { v14Colors as colors, fonts, radii } from '@/theme/tokens';

export function TextSizeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const current = useTextSize();
  return (
    <Sheet visible={visible} onClose={onClose} label="Text size">
      <SheetHeader title="Text size" onClose={onClose} />
      <View style={{ gap: 10 }}>
        {(Object.keys(TEXT_SIZES) as TextSizeKey[]).map((key) => {
          const active = key === current;
          const t = TEXT_SIZES[key];
          return (
            <Pressable
              key={key}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, checked: active }}
              aria-checked={active}
              accessibilityLabel={`${t.label} text`}
              onPress={() => {
                setTextSize(key);
                onClose();
              }}
              style={{
                minHeight: 56,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingHorizontal: 16,
                borderRadius: radii.lg,
                backgroundColor: colors.white,
                borderWidth: active ? 1.5 : 1,
                borderColor: active ? colors.actionRed : colors.border,
              }}
            >
              <AppText
                style={{
                  fontFamily: fonts.serifSemibold,
                  fontSize: t.fontSize,
                  lineHeight: t.fontSize * 1.3,
                  width: 36,
                }}
              >
                Aa
              </AppText>
              <AppText variant="label" style={{ flexGrow: 1, fontSize: 15 }}>
                {t.label}
              </AppText>
              {active ? (
                <Icon name="check" size={20} color={colors.actionRed} strokeWidth={2.2} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}

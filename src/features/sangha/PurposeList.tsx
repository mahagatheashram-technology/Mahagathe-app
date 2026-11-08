import { useRef, type ComponentRef } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/components/ui';
import type { DonationPurpose } from '@/data';
import { colors, fonts } from '@/theme/tokens';

/** "Where should it go?" radio list, in the village language (laterite radio, hairlines). */
export function PurposeList({
  purposes,
  value,
  onChange,
}: {
  purposes: DonationPurpose[];
  value: string;
  onChange: (id: string) => void;
}) {
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const rowHeight = 72;
  return (
    <View
      accessibilityRole="radiogroup"
      style={{ overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white }}>
      <ScrollView
        ref={scroll}
        nestedScrollEnabled
        style={{ maxHeight: rowHeight * 4 }}
        onContentSizeChange={() => {
          const selected = purposes.findIndex((p) => p.id === value);
          if (selected > 3) scroll.current?.scrollTo({ y: (selected - 3) * rowHeight, animated: false });
        }}>
        {purposes.map((p, i) => {
          const checked = p.id === value;
          return (
            <Pressable
              key={p.id}
              accessibilityRole="radio"
              accessibilityLabel={`${p.name}, ${p.tagline}`}
              accessibilityState={{ checked }}
              onPress={() => onChange(p.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                minHeight: 56,
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: checked ? colors.lateriteSoft : colors.white,
                borderBottomWidth: i === purposes.length - 1 ? 0 : 1,
                borderBottomColor: colors.line,
              }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: checked ? 2 : 1.5,
                  borderColor: checked ? colors.laterite : colors.text2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {checked ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.laterite }} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={{ fontFamily: fonts.displaySemibold, fontSize: 19, lineHeight: 26, color: colors.v14Ink }}>{p.name}</AppText>
                <AppText style={{ fontFamily: fonts.ui, fontSize: 14, lineHeight: 21, color: colors.text2 }}>{p.tagline}</AppText>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

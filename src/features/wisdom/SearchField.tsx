import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui';
import { colors, fonts } from '@/theme/tokens';

/** WisdomV3 search pill: 50 high, white, 1px border, 18pt muted search icon. */
export function SearchField({ value, onChangeText }: { value: string; onChangeText: (t: string) => void }) {
  return (
    <View style={styles.field}>
      <Icon name="search" size={18} color={colors.muted} />
      <TextInput
        accessibilityLabel="Search Wisdom"
        value={value}
        onChangeText={onChangeText}
        placeholder="Search — dharma, Arjuna, seva…"
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        style={styles.input}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={12}
          onPress={() => onChangeText('')}
          style={styles.clear}>
          <View style={styles.clearDot}>
            <View style={[styles.bar, { transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.bar, { transform: [{ rotate: '-45deg' }] }]} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52, // mock: 50 + 1px border each side (content-box)
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    height: 50,
    padding: 0,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    // @ts-expect-error web only: remove the browser focus ring (the field itself is the target)
    outlineStyle: 'none',
  },
  clear: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  clearDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: { position: 'absolute', width: 10, height: 1.6, borderRadius: 1, backgroundColor: colors.muted },
});

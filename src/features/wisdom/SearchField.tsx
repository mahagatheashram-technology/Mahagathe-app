import { useRouter } from 'expo-router';
import { Pressable, TextInput, View } from 'react-native';
import { Icon } from '@/components/ui';
import { fonts, v14Colors as c } from '@/theme/tokens';
import { LibraryText } from './Library';

export function SearchField({
  value = '',
  onChangeText,
}: {
  value?: string;
  onChangeText?: (t: string) => void;
}) {
  const router = useRouter();
  const content = (
    <>
      <Icon name="search" size={20} color={c.darkLeaf} />
      {onChangeText ? (
        <TextInput
          accessibilityLabel="Search Wisdom"
          value={value}
          onChangeText={onChangeText}
          placeholder="Search, or ask a question"
          placeholderTextColor={c.darkLeaf}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          style={{
            flex: 1,
            minWidth: 0,
            height: 50,
            padding: 0,
            fontFamily: fonts.ui,
            fontSize: 16,
            color: c.ink,
          }}
        />
      ) : (
        <LibraryText style={{ color: c.darkLeaf, flex: 1 }}>Search, or ask a question</LibraryText>
      )}
      {value && onChangeText ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChangeText('')}
          style={{
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: -12,
          }}
        >
          <Icon name="close" size={18} color={c.text2} />
        </Pressable>
      ) : null}
    </>
  );
  const style = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: c.sattva,
    borderWidth: 1.5,
    borderColor: c.leafEdge,
  };
  return onChangeText ? (
    <View style={style}>{content}</View>
  ) : (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Search, or ask a question"
      onPress={() => router.push('/search')}
      style={style}
    >
      {content}
    </Pressable>
  );
}

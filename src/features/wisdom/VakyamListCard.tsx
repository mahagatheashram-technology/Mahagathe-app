import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { THEME_LABELS, type Vakyam } from '@/data';
import { fonts, v14Colors as c } from '@/theme/tokens';
import { LibraryRow, LibraryText, wordDate } from './Library';
import { SaveVakyam } from './SaveVakyam';

export function VakyamListCard({
  vakyam,
  first = false,
  save = true,
  showTheme = true,
  quoteSize = 19,
}: {
  vakyam: Vakyam;
  first?: boolean;
  save?: boolean;
  showTheme?: boolean;
  quoteSize?: number;
}) {
  const router = useRouter();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 4,
        paddingVertical: 14,
        borderTopWidth: first ? 0 : 1,
        borderColor: c.line,
      }}
    >
      <LibraryRow
        label={`Read Vākyam: ${vakyam.text}`}
        onPress={() => router.push(`/vakyam/${vakyam.id}`)}
        style={{ flex: 1 }}
      >
        <LibraryText
          style={{ fontFamily: fonts.display, fontSize: quoteSize, lineHeight: quoteSize * 1.4 }}
        >
          {vakyam.text.startsWith('[') ? vakyam.text : `“${vakyam.text}”`}
        </LibraryText>
        <LibraryText style={{ fontSize: 14, lineHeight: 21.7, color: c.text2 }}>
          {showTheme ? `${THEME_LABELS[vakyam.theme]}, ` : ''}
          {wordDate(vakyam.date)}
        </LibraryText>
      </LibraryRow>
      {save && (
        <View style={{ marginRight: -12, marginTop: -2 }}>
          <SaveVakyam id={vakyam.id} />
        </View>
      )}
    </View>
  );
}

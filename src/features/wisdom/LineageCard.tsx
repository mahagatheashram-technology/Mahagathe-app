import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { Portrait } from '@/components/ui';
import { v14Colors as c } from '@/theme/tokens';
import { LibraryHeading, LibraryRow, LibraryText } from './Library';
export function LineageCard() {
  const router = useRouter();
  return (
    <LibraryRow
      label="Our lineage. The Paramparā"
      onPress={() => router.push('/parampara')}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        padding: 16,
        borderRadius: 16,
        backgroundColor: c.lateriteSoft,
      }}
    >
      <Portrait size={58} />
      <View style={{ flex: 1 }}>
        <LibraryHeading size={19}>Our lineage</LibraryHeading>
        <LibraryText style={{ fontSize: 14, lineHeight: 21.7, color: c.text2 }}>
          Seventy heads of the Paramparā, from the founding ācārya to the Most Venerable Mahamuni
        </LibraryText>
      </View>
    </LibraryRow>
  );
}

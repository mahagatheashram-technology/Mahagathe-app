import { Linking, View } from 'react-native';

import { AppText, Button, Card, Icon } from '@/components/ui';
import { externalLinks, useContactInfo } from '@/data';
import { BottomSheet } from './BottomSheet';
import { colors } from '@/theme/tokens';

/** Opens WhatsApp (or the browser fallback). Fails quietly: the number is also shown above the button. */
export async function openWhatsApp() {
  try {
    await Linking.openURL(externalLinks.whatsapp);
  } catch {
    /* no handler available: nothing to do */
  }
}

export function AboutSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const contact = useContactInfo();
  return (
    <BottomSheet visible={visible} onClose={onClose} title="About Mahagathe">
      <AppText variant="body" style={{ lineHeight: 23 }}>
        The Mahagathe Foundation is a Public Charitable Trust. [About text, as approved]
      </AppText>
      <Card radius={18}>
        {[
          { label: 'Trust', value: contact.legalName },
          { label: 'Address', value: contact.address },
          { label: 'Phone', value: contact.phone },
          { label: 'Email', value: contact.email },
        ].map((r, i, a) => (
          <View
            key={r.label}
            style={{ paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: i === a.length - 1 ? 0 : 1, borderBottomColor: colors.sand }}>
            <AppText variant="caption">{r.label}</AppText>
            <AppText variant="label" style={{ fontSize: 14 }}>
              {r.value}
            </AppText>
          </View>
        ))}
      </Card>
      <Button
        label="Contact on WhatsApp"
        onPress={openWhatsApp}
        icon={<Icon name="externalLink" size={18} color={colors.white} />}
      />
    </BottomSheet>
  );
}

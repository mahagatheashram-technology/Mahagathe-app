import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

import { AppText, Icon, PrimaryButton } from '@/components/ui';
import { useScreenInsets } from '@/components/ui/useStatusBarInset';
import type { YakshaQuestion } from '@/data';
import { colors, fonts } from '@/theme/tokens';
import { YakshaShareCard, type ShareCardHandle } from './YakshaShareCard';
import { yakshaShareText } from './yakshaText';

/** Story size: the card is 330×587 (9:16); capture it at 1080×1920. */
const STORY = { width: 1080, height: 1920 };

/**
 * Shares the card as an image (react-native-view-shot + expo-sharing, both in Expo Go).
 * Where capture or file sharing is unavailable (web, some devices) it falls back to text.
 */
async function shareText(question: YakshaQuestion) {
  await Share.share({ message: yakshaShareText(question) });
}

export function YakshaShareSheet({ question, visible, onClose }: { question: YakshaQuestion; visible: boolean; onClose: () => void }) {
  const insets = useScreenInsets();
  const card = useRef<ShareCardHandle>(null);
  const [busy, setBusy] = useState(false);

  const share = async () => {
    if (busy) return;
    setBusy(true);
    try {
      let sharedImage = false;
      if (Platform.OS !== 'web' && card.current && (await Sharing.isAvailableAsync())) {
        try {
          const uri = await captureRef(card, { format: 'png', quality: 1, result: 'tmpfile', ...STORY });
          await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: 'Share as a story' });
          sharedImage = true;
        } catch {
          sharedImage = false;
        }
      }
      if (!sharedImage) await shareText(question);
    } catch {
      Alert.alert('Sharing isn’t available here', 'Try again from your phone.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: colors.shareBackdrop }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            paddingTop: insets.top + 8,
            paddingBottom: Math.max(insets.bottom, 16) + 16,
            paddingHorizontal: 24,
          }}>
          <YakshaShareCard cardRef={card} question={question} />
          <View style={{ alignSelf: 'stretch', gap: 10, maxWidth: 330, width: '100%' }}>
            <PrimaryButton
              label="Share as a story"
              loading={busy}
              onPress={share}
              icon={<Icon name="share" size={18} color={colors.white} strokeWidth={1.8} />}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
              <AppText style={{ fontFamily: fonts.uiSemibold, fontSize: 16, lineHeight: 24.8, color: colors.white }}>Close</AppText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

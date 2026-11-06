import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AppText, BottomSheet, Button } from '@/components/ui';

/** Explains that the Samatha practices are taught in person and points to Sangha (events) to enrol. */
export function EnrolSheet({
  visible,
  onClose,
  practiceTitle,
}: {
  visible: boolean;
  onClose: () => void;
  practiceTitle?: string;
}) {
  const router = useRouter();
  return (
    <BottomSheet visible={visible} onClose={onClose} title={practiceTitle ? `${practiceTitle} is for enrolled sādhakas` : 'How to enrol'}>
      <AppText variant="bodyLarge" style={{ fontSize: 15, lineHeight: 24 }}>
        These practices are taught in person. Your teacher opens them in the app after you enrol.
      </AppText>
      <View style={{ gap: 10, marginTop: 4 }}>
        <Button
          label="See how to enrol"
          onPress={() => {
            onClose();
            router.navigate('/sangha');
          }}
        />
        <Button label="Not now" variant="quiet" onPress={onClose} />
      </View>
    </BottomSheet>
  );
}

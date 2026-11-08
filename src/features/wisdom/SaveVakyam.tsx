import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Icon } from '@/components/ui';
import { useSavedVakyam, useSession } from '@/data';
import { v14Colors as c } from '@/theme/tokens';
import { LibraryText } from './Library';

export function SaveVakyam({ id }: { id: string }) {
  const { isSaved, toggle } = useSavedVakyam(id);
  const session = useSession();
  const router = useRouter();
  const [failed, setFailed] = useState(false);
  const save = async () => {
    if (!session.canUsePersonalFeatures) {
      router.push(session.status === 'signedIn' ? '/setup' : '/welcome');
      return;
    }
    try {
      await toggle();
      setFailed(false);
    } catch {
      setFailed(true);
    }
  };
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isSaved ? 'Remove from saved Vākyams' : 'Save Vākyam'}
        accessibilityState={{ selected: isSaved }}
        aria-pressed={isSaved}
        onPress={save}
        style={{ width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name={isSaved ? 'check' : 'save'} size={22} color={isSaved ? c.laterite : c.ink} />
      </Pressable>
      {failed && (
        <LibraryText accessibilityLiveRegion="polite" style={{ color: c.actionRed, fontSize: 13 }}>
          Try again
        </LibraryText>
      )}
    </View>
  );
}

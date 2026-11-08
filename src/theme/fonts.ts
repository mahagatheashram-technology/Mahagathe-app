import { Eczar_400Regular, Eczar_500Medium, Eczar_600SemiBold, Eczar_700Bold } from '@expo-google-fonts/eczar';
import { Mukta_400Regular, Mukta_500Medium, Mukta_600SemiBold, Mukta_700Bold } from '@expo-google-fonts/mukta';
import { useFonts } from 'expo-font';

/** Called by the root layout before rendering any route. */
export function useAppFonts() {
  const [loaded, error] = useFonts({ Eczar_400Regular, Eczar_500Medium, Eczar_600SemiBold, Eczar_700Bold,
    Mukta_400Regular, Mukta_500Medium, Mukta_600SemiBold, Mukta_700Bold });
  return loaded || !!error;
}

import { Image } from 'expo-image';

import { brand } from '@/data/assets';

const ASPECT = 547 / 800;

/** The Mahagathe emblem (trishula + banner), sized by width like the mocks (`width: Npx; height: auto`). */
export function Emblem({ width }: { width: number }) {
  return <Image source={brand.emblem} contentFit="contain" style={{ width, aspectRatio: ASPECT }} accessibilityLabel="" />;
}

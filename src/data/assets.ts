import type { PhotoKey } from './types';

export const brand = {
  emblem: require('@/assets/brand/mahagathe-emblem.png'),
  wordmark: require('@/assets/brand/mahagathe-logo-wordmark.png'),
};

/** Real Mahagathe program photos (from mahagathe.com), as used in the v3 mocks. */
export const photos: Record<PhotoKey, number> = {
  abhyudaya: require('@/assets/photos/abhyudaya-elders.jpg'),
  adhyaya: require('@/assets/photos/adhyaya-children.jpg'),
  ayuri: require('@/assets/photos/ayuri-elders.jpg'),
  bhandara: require('@/assets/photos/bhandara-food.jpg'),
  samriddhi: require('@/assets/photos/samriddhi-sewing.jpg'),
};

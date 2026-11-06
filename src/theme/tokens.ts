/**
 * Mahagathe design tokens — taken 1:1 from docs/design/mocks/BrandV3.dc.html.
 * Never hard-code a hex in a screen; add it here first.
 */
export const colors = {
  /** Brand colour (mahagathe.com). Logo moments and the Mandala ring only; too bright for text. */
  brandRed: '#F60000',
  /** Buttons, links, active tab, icons, progress. White text on it is 6.3:1. */
  actionRed: '#C20000',
  /** Feature gradient stops: one lead block per browsing screen. */
  featureTop: '#CC0000',
  featureBottom: '#9A0A0A',
  /** Dark circle behind the guru photo placeholder on red. */
  featureDeep: '#A30000',
  /** Labels on the red feature block. */
  onFeatureMuted: '#FFE0C2',

  cream: '#FFFBF5',
  sand: '#F0E8DE',
  white: '#FFFFFF',
  /** Light inset tile inside white cards (Mandala row, Paramparā icon tile). */
  tile: '#F8F4EE',
  border: '#E9DFD3',

  ink: '#2A1F1A',
  muted: '#6E5F50',
  /** "Small step" accent. */
  earth: '#8A5236',

  /** Season covers (content, not surfaces). */
  maroon: '#4C1515',
  gold: '#D69E2E',
  coverText: '#FFF0E3',

  /** Practice player (dark, calm). */
  playerTop: '#4A0B0B',
  playerBottom: '#220606',
  playerMuted: '#FFC9B0',
  playerBody: '#FFE3D6',

  shadow: '#4C1515',
} as const;

export const gradients = {
  feature: [colors.featureTop, colors.featureBottom] as const,
  player: [colors.playerTop, colors.playerBottom] as const,
};

/**
 * Custom fonts must be selected by family (fontWeight does not pick a face on Android).
 * Lora = titles & teachings, Poppins = interface, Noto Serif Devanagari = scripture.
 */
export const fonts = {
  serif: 'Lora_400Regular',
  serifItalic: 'Lora_400Regular_Italic',
  serifMedium: 'Lora_500Medium',
  serifSemibold: 'Lora_600SemiBold',
  sans: 'Poppins_400Regular',
  sansMedium: 'Poppins_500Medium',
  sansSemibold: 'Poppins_600SemiBold',
  deva: 'NotoSerifDevanagari_500Medium',
  devaSemibold: 'NotoSerifDevanagari_600SemiBold',
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  card: 22,
  sheet: 24,
  pill: 999,
} as const;

export const space = {
  gutter: 20,
  gutterWide: 24,
} as const;

/** Minimum touch target (WCAG 2.2 / PRD accessibility). */
export const minTouch = 44;

export const shadows = {
  card: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  playButton: {
    shadowColor: colors.actionRed,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
} as const;

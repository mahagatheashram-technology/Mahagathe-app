/**
 * Mahagathe design tokens — v14 palette plus preserved historical exports.
 * Never hard-code a hex in a screen; add it here first.
 */
export const colors = {
  // v14: four places, natural dyes and content review. Legacy values below stay compatible.
  limewash: '#FBFAF7', indigo: '#1F2347', indigo2: '#2B3160', lamp: '#F2B544',
  onDark2: '#B9BCD9', leaf: '#E7D3A8', leafEdge: '#C9AE78', darkLeaf: '#5B4628',
  v14Ink: '#2A1E14', laterite: '#9C3D22', lateriteSoft: '#F3E2D9', text2: '#6A5B50', line: '#E6E0D6',
  seriesMahabharata: '#9C3D22', seriesRamayana: '#4C6639', seriesPashupata: '#5E5A57', seriesIks: '#9A6B12',
  sattva: '#FFFDF6', sattvaEdge: '#C9AE78', rajas: '#B5341F', tamas: '#2A1E14',
  reviewText: '#7A5200', reviewBackground: '#FFF4D6', reviewDarkBackground: 'rgba(242,181,68,.10)',
  v14TabInactive: '#75685E', wisdomTab: '#8A6A2E', lateriteShadow: '#501A0A',
  leafRule: 'rgba(120,90,40,.07)', segmentOff: 'rgba(42,30,20,.18)',
  pillLight: 'rgba(42,30,20,.06)', pillDark: 'rgba(255,255,255,.1)',
  darkLine: 'rgba(255,255,255,.1)', photoStripe: 'rgba(255,255,255,.06)', photoText: '#F6DCCF',
  cord: 'rgba(255,236,200,.55)', knot: '#EBD9B4', motif: 'rgba(255,255,255,.85)', motifDot: '#E0463A',
  portraitScrimTop: 'rgba(0,0,0,.28)', portraitScrimBottom: 'rgba(20,10,4,.78)',
  /** v14 Welcome/Home additions: lamp halo behind the emblem, band under a leaf, share-card backdrop. */
  lampGlow: 'rgba(242,181,68,.18)', leafInset: 'rgba(255,253,246,.35)', shareBackdrop: '#2B2622',

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

  label: '#6A4710',
  tabInactive: '#5E5045',
  headerTop: '#F7EDE1',
  textSecondary: '#6B5A4B',
  divider: '#EADFD2',
  cardBorder: '#EFE5D9',
  iconSand: '#F5EDE3',
  chevron: '#8F7E70',
  mandalaPending: '#9C8A7C',
  ornament: '#B98A2E',
  outline: '#D9CBBB',
  /** Disabled primary button (Give before an amount is chosen). */
  disabled: '#E6DACB',
  disabledText: '#5E5045',
  cream: '#FFFBF5',
  sand: '#F0E8DE',
  white: '#FFFFFF',
  /** Light inset tile inside white cards (Mandala row, Paramparā icon tile). */
  tile: '#F8F4EE',
  border: '#E9DFD3',
  /** Stronger outline: Pathway chips, timeline dots (Sangha, Paramparā). */
  borderStrong: '#D6C3AE',
  /** Hairline divider on the red feature block. */
  onFeatureDivider: 'rgba(255,255,255,0.25)',
  /** Ghost button border on the red feature block. */
  onFeatureBorder: 'rgba(255,255,255,0.7)',
  /** Icon-button outline on the red feature block (Home bell). */
  onFeatureOutline: 'rgba(255,255,255,0.35)',
  /** Language pill outline on Welcome. */
  onFeaturePillBorder: 'rgba(255,255,255,0.45)',
  /** Loading skeleton blocks: on the red feature block / on cream. */
  skeletonOnFeature: 'rgba(255,255,255,0.18)',
  skeleton: 'rgba(76,21,21,0.08)',
  /** Neutral drop shadow (Welcome emblem disc). */
  shadowNeutral: '#000000',

  ink: '#2A1F1A',
  muted: '#6E5F50',
  /** "Small step" accent. */
  earth: '#8A5236',

  /** Season covers (content, not surfaces). */
  maroon: '#4C1515',
  gold: '#D69E2E',
  coverText: '#FFF0E3',
  /** Sub-label on season covers ("Ādi", "Coming"). */
  coverSub: '#F1DDC8',
  /** Upcoming-season cover backgrounds (Sabhā, Āraṇyaka, Virāṭa, Udyoga). */
  coverPlum: '#44233B',
  coverMoss: '#2F3A26',
  coverBrown: '#5B3A1E',
  coverRose: '#7E4555',
  /** Gold hairline on covers: 70% on the lead cover, 45% on the small ones. */
  coverGoldLine: 'rgba(214, 158, 46, 0.7)',
  coverGoldLineSoft: 'rgba(214, 158, 46, 0.45)',
  /** Gold hairline on the Home continue-reading cover (60%, per HomeV3). */
  coverGoldLineMid: 'rgba(214, 158, 46, 0.6)',
  /** Dim scrim behind bottom sheets. */
  scrim: 'rgba(42, 31, 26, 0.45)',

  /** Practice player (dark, calm). */
  playerTop: '#3A1A16',
  playerBottom: '#1C0D0A',
  playerOrnament: '#FFC9B0',
  playerMuted: '#FFD9C7',
  playerBody: '#FFE9DF',

  shadow: '#4C1515',

  /** Switch track when off (Profile notifications). */
  switchOff: '#A8968A',
  /** Translucent white tile on the red feature block (Mandala stats). */
  onFeatureTile: 'rgba(255, 255, 255, 0.12)',
  /** Player surfaces: info card, scrubber track, the two rings around the drop. */
  playerCard: 'rgba(255, 255, 255, 0.07)',
  playerTrack: 'rgba(255, 255, 255, 0.28)',
  playerRingOuter: 'rgba(255, 201, 176, 0.35)',
  playerRingInner: 'rgba(255, 201, 176, 0.55)',
} as const;

export const gradients = {
  feature: [colors.featureTop, colors.featureBottom] as const,
  player: [colors.playerTop, colors.playerBottom] as const,
};

/**
 * Custom fonts must be selected by family (fontWeight does not pick a face on Android).
 * Eczar = display, teachings and Devanagari; Mukta = interface.
 */
export const fonts = {
  serif: 'Eczar_400Regular', serifItalic: 'Eczar_400Regular', serifMedium: 'Eczar_500Medium', serifSemibold: 'Eczar_600SemiBold',
  sans: 'Mukta_400Regular', sansMedium: 'Mukta_500Medium', sansSemibold: 'Mukta_600SemiBold',
  devaRegular: 'Eczar_400Regular', deva: 'Eczar_500Medium', devaSemibold: 'Eczar_600SemiBold',
  display: 'Eczar_400Regular', displayMedium: 'Eczar_500Medium', displaySemibold: 'Eczar_600SemiBold', displayBold: 'Eczar_700Bold',
  ui: 'Mukta_400Regular', uiMedium: 'Mukta_500Medium', uiSemibold: 'Mukta_600SemiBold', uiBold: 'Mukta_700Bold',
} as const;

export const radii = {
  leaf: 16, photo: 12, button: 14, v14Card: 20,
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
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  playButton: {
    shadowColor: colors.actionRed,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
} as const;

/** v12 white card, including its quiet border and shadow. */
export const cardStyle = {
  backgroundColor: colors.white,
  borderRadius: 24,
  borderWidth: 1,
  borderColor: colors.cardBorder,
  ...shadows.card,
} as const;

/** v14 scale; line heights are absolute React Native points. */
export const typeScale = { small: 13, label: 15, medium: 17, section: 21, heading: 26, title: 33, display: 41 } as const;
export const typography = {
  body: { fontFamily: fonts.ui, fontSize: 16, lineHeight: 24.8 },
  reading: { fontFamily: fonts.display, fontSize: 18.5, lineHeight: 31.82 },
} as const;
export const placeColors = { today: colors.limewash, hall: colors.indigo, library: colors.leaf, village: colors.laterite } as const;

/** Canonical v14 names; historical `colors.ink`/`tabInactive` remain untouched above. */
export const v14Colors = { ...colors, ink: colors.v14Ink, tabInactive: colors.v14TabInactive } as const;
export const v14Radii = { leaf: 16, photo: 12, button: 14, card: 20 } as const;

import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';

import { colors, fonts } from '@/theme/tokens';

/**
 * Every icon used in the v3 mocks, with the exact path data from docs/design/mocks.
 * Stroke icons on a 24×24 grid. Use `strokeWidth` to match the mock (2 default, 2.2 on active tab/chevrons).
 */
export type IconName =
  | 'lampi' | 'open-book' | 'leafi' | 'people' | 'save' | 'pin' | 'close' | 'waves' | 'down'
  | 'lamp'
  | 'offering-hands'
  | 'globe'
  | 'grid'
  | 'home'
  | 'wisdom'
  | 'sadhana'
  | 'sangha'
  | 'profile'
  | 'bell'
  | 'play'
  | 'pause'
  | 'chevronRight'
  | 'chevronDown'
  | 'back'
  | 'check'
  | 'lock'
  | 'shield'
  | 'shieldCheck'
  | 'book'
  | 'signOut'
  | 'drop'
  | 'heart'
  | 'homeHeart'
  | 'externalLink'
  | 'info'
  | 'help'
  | 'clock'
  | 'search'
  | 'mic'
  | 'phone'
  | 'briefcase'
  | 'calendar'
  | 'video'
  | 'file'
  | 'bookmark'
  | 'flag'
  | 'share'
  | 'scales'
  | 'replay15'
  | 'forward15';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 24, color = colors.ink, strokeWidth = 2 }: Props) {
  const p = {
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox={name === 'waves' ? '0 0 30 16' : '0 0 24 24'} accessibilityElementsHidden importantForAccessibility="no">
      {render(name, p, color)}
    </Svg>
  );
}

function render(name: IconName, p: Record<string, unknown>, color: string) {
  switch (name) {
    case 'lampi':
    case 'lamp':
      return <><Path {...p} d="M12 3.5c1.4 1.8 2.3 3 2.3 4.4a2.3 2.3 0 0 1-4.6 0c0-1.4.9-2.6 2.3-4.4z" /><Path {...p} d="M4.5 13h15c0 3.2-3.4 5.5-7.5 5.5S4.5 16.2 4.5 13z" /></>;
    case 'open-book':
    case 'leafi':
      return <><Path {...p} d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" /><Path {...p} d="M12 6.5v13" /></>;
    case 'people':
      return <><Circle {...p} cx={9} cy={8.5} r={3} /><Path {...p} d="M3.5 19a5.5 5.5 0 0 1 11 0M15.5 6a3 3 0 0 1 0 6M17 14.5a5.5 5.5 0 0 1 3.5 4.5" /></>;
    case 'save': return <Path {...p} d="M7 4h10v16l-5-4-5 4z" />;
    case 'pin': return <><Path {...p} d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" /><Circle {...p} cx={12} cy={10} r={2.3} /></>;
    case 'close': return <Path {...p} d="M7 7l10 10M17 7L7 17" />;
    case 'down': return <Path {...p} d="M6 9l6 6 6-6" />;
    case 'waves': return <><Path {...p} d="M1 5c3.5-3 7-3 10.5 0s7 3 10.5 0 5-2.5 7-1" /><Path {...p} d="M1 12c3.5-3 7-3 10.5 0s7 3 10.5 0 5-2.5 7-1" /></>;
    case 'offering-hands':
      return <><Path {...p} d="M12 21c-4.5 0-8-2.8-8-6.2V12l3.2 2.4" /><Path {...p} d="M12 21c4.5 0 8-2.8 8-6.2V12l-3.2 2.4" /><Path {...p} d="M12 8.5c-1.6-2.1-4.5-1.4-4.5 1 0 2 4.5 4.5 4.5 4.5s4.5-2.5 4.5-4.5c0-2.4-2.9-3.1-4.5-1z" /></>;
    case 'globe':
      return <><Circle {...p} cx="12" cy="12" r="8.5" /><Path {...p} d="M3.5 12h17M12 3.5c2.4 2.6 2.4 14.4 0 17M12 3.5c-2.4 2.6-2.4 14.4 0 17" /></>;
    case 'grid':
      return <><Rect {...p} x="4" y="4" width="7" height="7" rx="1.5" /><Rect {...p} x="13" y="4" width="7" height="7" rx="1.5" /><Rect {...p} x="4" y="13" width="7" height="7" rx="1.5" /><Rect {...p} x="13" y="13" width="7" height="7" rx="1.5" /></>;
    case 'home':
      return <><Path {...p} d="M4 11l8-6.5 8 6.5V20H4z" /></>;
    case 'wisdom':
      return (
        <>
          <Path {...p} d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z" />
          <Path {...p} d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3" />
        </>
      );
    case 'book':
      return <Path {...p} d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z" />;
    case 'sadhana':
      return (
        <>
          <Path {...p} d="M12 3c2.5 3 4.5 5.3 4.5 8.5a4.5 4.5 0 0 1-9 0C7.5 8.3 9.5 6 12 3z" />
          <Path {...p} d="M4 17c2 2.5 5 4 8 4s6-1.5 8-4" />
        </>
      );
    case 'signOut':
      return (
        <>
          <Path {...p} d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
          <Path {...p} d="M10 16l-4-4 4-4M6 12h10" />
        </>
      );
    case 'drop':
      return <Path {...p} d="M12 3c2.5 3 4.5 5.3 4.5 8.5a4.5 4.5 0 0 1-9 0C7.5 8.3 9.5 6 12 3z" />;
    case 'sangha':
      return (
        <>
          <Circle {...p} cx="9" cy="8" r="3.5" />
          <Path {...p} d="M2.5 20a6.5 6.5 0 0 1 13 0" />
          <Path {...p} d="M16 4.5a3.5 3.5 0 0 1 0 7" />
          <Path {...p} d="M18 14a6.5 6.5 0 0 1 3.5 6" />
        </>
      );
    case 'profile':
      return (
        <>
          <Circle {...p} cx="12" cy="8" r="4" />
          <Path {...p} d="M4 21a8 8 0 0 1 16 0" />
        </>
      );
    case 'bell':
      return <><Path {...p} d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><Path {...p} d="M10 20.5a2 2 0 0 0 4 0" /></>;
    case 'play':
      return <><Path {...p} d="M8 5.5v13l10.5-6.5z" fill={color} stroke="none" /></>;
    case 'pause':
      return <Path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" fill={color} />;
    case 'chevronRight':
      return <Path {...p} d="M9 5l7 7-7 7" />;
    case 'chevronDown':
      return <Path {...p} d="m6 9 6 6 6-6" />;
    case 'back':
      return <><Path {...p} d="M15 5l-7 7 7 7" /></>;
    case 'check':
      return <><Path {...p} d="M5 12.5l4.5 4.5L19 7.5" /></>;
    case 'lock':
      return <><Rect {...p} x="5" y="11" width="14" height="9" rx="2" /><Path {...p} d="M8 11V8a4 4 0 0 1 8 0v3" /></>;
    case 'shield':
      return <Path {...p} d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />;
    case 'shieldCheck':
      return (
        <>
          <Path {...p} d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />
          <Path {...p} d="m9 12 2 2 4-4" />
        </>
      );
    case 'heart':
      return <Path {...p} d="M12 20s-7.5-4.5-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3c0 5.5-7.5 10-7.5 10z" />;
    case 'homeHeart':
      return (
        <>
          <Path {...p} d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
          <Path {...p} d="M12 17s-3-1.8-3-4a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2.2-3 4-3 4z" />
        </>
      );
    case 'externalLink':
      return (
        <>
          <Path {...p} d="M14 4h6v6M20 4l-9 9" />
          <Path {...p} d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </>
      );
    case 'info':
      return (
        <>
          <Circle {...p} cx="12" cy="12" r="9" />
          <Path {...p} d="M12 11v6M12 7.5h.01" />
        </>
      );
    case 'help':
      return (
        <>
          <Circle {...p} cx="12" cy="12" r="9" />
          <Path {...p} d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14" />
          <Path {...p} d="M12 17.5h.01" />
        </>
      );
    case 'clock':
      return (
        <>
          <Circle {...p} cx="12" cy="12" r="9" />
          <Path {...p} d="M12 7v5l3 2" />
        </>
      );
    case 'search': return <><Circle {...p} cx={11} cy={11} r={6.5} /><Path {...p} d="M16 16l4 4" /></>;
    case 'mic':
      return (
        <>
          <Rect {...p} x="9" y="3" width="6" height="11" rx="3" />
          <Path {...p} d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </>
      );
    case 'phone':
      return (
        <>
          <Rect {...p} x="6" y="2.5" width="12" height="19" rx="2.5" />
          <Path {...p} d="M11 18h2" />
        </>
      );
    case 'briefcase':
      return (
        <>
          <Rect {...p} x="3" y="7" width="18" height="13" rx="2" />
          <Path {...p} d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </>
      );
    case 'calendar':
      return (
        <>
          <Rect {...p} x="3" y="5" width="18" height="16" rx="2" />
          <Path {...p} d="M3 10h18M8 3v4M16 3v4" />
        </>
      );
    case 'video':
      return (
        <>
          <Rect {...p} x="2.5" y="5" width="19" height="14" rx="3" />
          <Path d="m10 9 5 3-5 3z" fill={color} />
        </>
      );
    case 'file':
      return (
        <>
          <Path {...p} d="M6 3h9l4 4v14H6z" />
          <Path {...p} d="M14 3v5h5" />
        </>
      );
    case 'bookmark':
      return <Path {...p} d="M6 3h12v18l-6-4-6 4z" />;
    case 'flag':
      return <Path {...p} d="M5 21V4M5 4h11l-2 4 2 4H5" />;
    case 'share':
      return <><Path {...p} d="M12 4v11M7.5 8.5L12 4l4.5 4.5M5 14v5h14v-5" /></>;
    case 'scales':
      return <Path {...p} d="M12 3v18M5 7h14M7 7l-3 7a3 3 0 0 0 6 0zM17 7l-3 7a3 3 0 0 0 6 0z" />;
    case 'replay15':
      return (
        <>
          <Path {...p} d="M4 12a8 8 0 1 0 2.5-5.8" />
          <Path {...p} d="M4 4v4h4" />
          <SvgText x="12" y="15" fontSize="7" textAnchor="middle" fill={color} fontFamily={fonts.sans}>
            15
          </SvgText>
        </>
      );
    case 'forward15':
      return (
        <>
          <Path {...p} d="M20 12a8 8 0 1 1-2.5-5.8" />
          <Path {...p} d="M20 4v4h-4" />
          <SvgText x="12" y="15" fontSize="7" textAnchor="middle" fill={color} fontFamily={fonts.sans}>
            15
          </SvgText>
        </>
      );
  }
}

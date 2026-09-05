export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface CategoryColors {
  cattle: string;
  pig: string;
  chicken: string;
  goat: string;
  sheep: string;
  duck: string;
  other: string;
}

export interface ThemeColors {
  primary: ColorScale;
  earth: ColorScale;
  neutral: ColorScale;
  category: CategoryColors;
  white: string;
  black: string;
  background: string;
  card: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

export interface ThemeDef {
  key: string;
  name: string;
  light: ThemeColors;
  dark: ThemeColors;
}

const CATEGORY: CategoryColors = {
  cattle: '#8B5CF6',
  pig: '#EC4899',
  chicken: '#F59E0B',
  goat: '#10B981',
  sheep: '#6366F1',
  duck: '#06B6D4',
  other: '#78716C',
};

const WHITE = '#FFFFFF';
const BLACK = '#000000';

const EARTH_LIGHT_SCALE: ColorScale = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
};

function makePalette(
  primary: ColorScale,
  neutral: ColorScale,
  background: string,
  card: string,
  border: string,
  opts: Partial<Pick<ThemeColors, 'error' | 'success' | 'warning' | 'earth'>> = {}
): ThemeColors {
  return {
    primary,
    earth: opts.earth ?? EARTH_LIGHT_SCALE,
    neutral,
    category: CATEGORY,
    white: WHITE,
    black: BLACK,
    background,
    card,
    border,
    error: opts.error ?? '#EF4444',
    success: opts.success ?? '#10B981',
    warning: opts.warning ?? '#F59E0B',
  };
}

/* Earth Green */
const EARTH_PRIMARY_LIGHT: ColorScale = {
  50: '#F0FFF4',
  100: '#C6F6D5',
  200: '#9AE6B4',
  300: '#68D391',
  400: '#48BB78',
  500: '#38A169',
  600: '#2F855A',
  700: '#276749',
  800: '#22543D',
  900: '#1C4532',
};

const EARTH_NEUTRAL_LIGHT: ColorScale = {
  50: '#FAFAF9',
  100: '#F5F5F4',
  200: '#E7E5E4',
  300: '#D6D3D1',
  400: '#A8A29E',
  500: '#78716C',
  600: '#57534E',
  700: '#44403C',
  800: '#292524',
  900: '#1C1917',
};

const EARTH_PRIMARY_DARK: ColorScale = {
  50: '#0C1F16',
  100: '#14321F',
  200: '#1E4A2E',
  300: '#2A6640',
  400: '#388355',
  500: '#4AA26E',
  600: '#5FBF87',
  700: '#85D6A8',
  800: '#BCEACD',
  900: '#E6F8ED',
};

const EARTH_NEUTRAL_DARK: ColorScale = {
  50: '#1C1B1A',
  100: '#262421',
  200: '#33302C',
  300: '#4A463F',
  400: '#6B665E',
  500: '#8C867C',
  600: '#ADA79B',
  700: '#C9C3B8',
  800: '#E4DED4',
  900: '#F7F4EE',
};

/* Ocean Blue */
const OCEAN_PRIMARY_LIGHT: ColorScale = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A8A',
};

const OCEAN_NEUTRAL_LIGHT: ColorScale = {
  50: '#F8FAFC',
  100: '#F1F5F9',
  200: '#E2E8F0',
  300: '#CBD5E1',
  400: '#94A3B8',
  500: '#64748B',
  600: '#475569',
  700: '#334155',
  800: '#1E293B',
  900: '#0F172A',
};

const OCEAN_PRIMARY_DARK: ColorScale = {
  50: '#0B1424',
  100: '#132242',
  200: '#1C335F',
  300: '#27477F',
  400: '#3360A5',
  500: '#427CC9',
  600: '#5B96E0',
  700: '#8CB8EF',
  800: '#C2D8F7',
  900: '#EAF2FE',
};

const OCEAN_NEUTRAL_DARK: ColorScale = {
  50: '#12161C',
  100: '#1A2027',
  200: '#262E37',
  300: '#37414D',
  400: '#5A6675',
  500: '#7C8899',
  600: '#9FABBB',
  700: '#C2CBD8',
  800: '#E3E8EF',
  900: '#F5F8FB',
};

/* Sunset Amber */
const SUNSET_PRIMARY_LIGHT: ColorScale = {
  50: '#FFFBEB',
  100: '#FEF3C7',
  200: '#FDE68A',
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
  800: '#92400E',
  900: '#78350F',
};

const SUNSET_NEUTRAL_LIGHT: ColorScale = {
  50: '#FAFAF9',
  100: '#F5F5F4',
  200: '#E7E5E4',
  300: '#D6D3D1',
  400: '#A8A29E',
  500: '#78716C',
  600: '#57534E',
  700: '#44403C',
  800: '#292524',
  900: '#1C1917',
};

const SUNSET_EARTH_SCALE: ColorScale = {
  50: '#FEF3F2',
  100: '#FEE5E3',
  200: '#FBC9C4',
  300: '#F7A79E',
  400: '#F18075',
  500: '#E8604F',
  600: '#D64536',
  700: '#B5372A',
  800: '#963022',
  900: '#7C2D1C',
};

const SUNSET_PRIMARY_DARK: ColorScale = {
  50: '#241705',
  100: '#3A2508',
  200: '#52330A',
  300: '#6E420E',
  400: '#8F5510',
  500: '#B06B12',
  600: '#D18418',
  700: '#E3A43F',
  800: '#EFC877',
  900: '#F9EAC2',
};

const SUNSET_NEUTRAL_DARK: ColorScale = {
  50: '#201C16',
  100: '#2A251D',
  200: '#383127',
  300: '#504637',
  400: '#6F6350',
  500: '#8E8171',
  600: '#ADA08F',
  700: '#CABFB0',
  800: '#E6DED1',
  900: '#F8F3EA',
};

export const THEMES: ThemeDef[] = [
  {
    key: 'earth',
    name: 'Earth Green',
    light: makePalette(EARTH_PRIMARY_LIGHT, EARTH_NEUTRAL_LIGHT, '#F5F5F4', '#FFFFFF', '#E7E5E4'),
    dark: makePalette(
      EARTH_PRIMARY_DARK,
      EARTH_NEUTRAL_DARK,
      '#14120F',
      '#1E1C18',
      '#33302B',
      { error: '#F87171', success: '#34D399', warning: '#FBBF24' }
    ),
  },
  {
    key: 'ocean',
    name: 'Ocean Blue',
    light: makePalette(OCEAN_PRIMARY_LIGHT, OCEAN_NEUTRAL_LIGHT, '#F1F5F9', '#FFFFFF', '#E2E8F0'),
    dark: makePalette(
      OCEAN_PRIMARY_DARK,
      OCEAN_NEUTRAL_DARK,
      '#0F141B',
      '#1A2028',
      '#2A323D',
      { error: '#F87171', success: '#34D399', warning: '#FBBF24' }
    ),
  },
  {
    key: 'sunset',
    name: 'Sunset Amber',
    light: makePalette(
      SUNSET_PRIMARY_LIGHT,
      SUNSET_NEUTRAL_LIGHT,
      '#FAF7F2',
      '#FFFFFF',
      '#EAE3D8',
      { earth: SUNSET_EARTH_SCALE }
    ),
    dark: makePalette(
      SUNSET_PRIMARY_DARK,
      SUNSET_NEUTRAL_DARK,
      '#191512',
      '#241F1A',
      '#38312A',
      { earth: SUNSET_EARTH_SCALE, error: '#F87171', success: '#34D399', warning: '#FBBF24' }
    ),
  },
];

export function getTheme(key: string): ThemeDef {
  return THEMES.find((t) => t.key === key) ?? THEMES[0];
}

export function getThemeOption(key: string): { key: string; name: string; primary: string; darkPrimary: string } {
  const t = getTheme(key);
  return {
    key: t.key,
    name: t.name,
    primary: t.light.primary[600],
    darkPrimary: t.dark.primary[600],
  };
}
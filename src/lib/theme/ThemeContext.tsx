import React, { createContext, useContext, useMemo } from 'react';
import { View, useColorScheme } from 'react-native';
import { vars } from 'nativewind';
import { ThemeColors, getTheme } from './themes';
import { Colors, setActiveColors } from './colors';
import { useAuth } from '../auth/AuthContext';
import { Appearance, ColorMode } from '../../features/profile/types';

interface ThemeContextValue {
  colors: ThemeColors;
  themeKey: string;
  darkMode: boolean;
  appearance: Appearance;
  colorMode: ColorMode;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: Colors,
  themeKey: 'earth',
  darkMode: false,
  appearance: 'system',
  colorMode: 'colorful',
});

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;

function paletteToVariables(p: ThemeColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const shade of SHADES) {
    out[`--primary-${shade}`] = p.primary[shade];
    out[`--earth-${shade}`] = p.earth[shade];
    out[`--neutral-${shade}`] = p.neutral[shade];
  }
  out['--background'] = p.background;
  out['--card'] = p.card;
  out['--border'] = p.border;
  out['--error'] = p.error;
  out['--success'] = p.success;
  out['--warning'] = p.warning;
  out['--on-primary'] = p.onPrimary;
  out['--on-success'] = p.onSuccess;
  out['--on-error'] = p.onError;
  return out;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { profile, draft } = useAuth();
  const systemScheme = useColorScheme();
  const themeKey = profile?.themeKey ?? draft.themeKey ?? 'earth';
  const appearance: Appearance =
    profile?.appearance ?? draft.appearance ?? (profile?.darkMode ? 'dark' : 'light');
  const darkMode = appearance === 'system' ? systemScheme !== 'light' : appearance === 'dark';
  const colorMode: ColorMode = profile?.colorMode ?? draft.colorMode ?? 'colorful';
  const theme = getTheme(themeKey);
  const palette = darkMode ? theme.dark : theme.light;

  setActiveColors(palette);

  const variables = useMemo(() => paletteToVariables(palette), [palette]);

  return (
    <ThemeContext.Provider value={{ colors: palette, themeKey, darkMode, appearance, colorMode }}>
      <View className="flex-1" style={vars(variables)}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
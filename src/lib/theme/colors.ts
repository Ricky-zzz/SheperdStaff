import { ThemeColors, getTheme } from './themes';

function clonePalette(p: ThemeColors): ThemeColors {
  return {
    ...p,
    primary: { ...p.primary },
    earth: { ...p.earth },
    neutral: { ...p.neutral },
    category: { ...p.category },
  };
}

const initial = getTheme('earth').light;

export const Colors: ThemeColors = clonePalette(initial);

export function setActiveColors(palette: ThemeColors): void {
  Object.assign(Colors, palette);
  Object.assign(Colors.primary, palette.primary);
  Object.assign(Colors.earth, palette.earth);
  Object.assign(Colors.neutral, palette.neutral);
  Object.assign(Colors.category, palette.category);
}
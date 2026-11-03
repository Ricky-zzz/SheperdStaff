import React, { useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../lib/auth/AuthContext';
import { ThemePicker } from '../../components/ui/ThemePicker';
import { Appearance, ColorMode } from '../../features/profile/types';

export default function ChangeThemeScreen() {
  const { profile, setTheme, setAppearance, setColorMode } = useAuth();
  const [themeKey, setThemeKey] = useState(profile?.themeKey ?? 'earth');
  const [appearance, setLocalAppearance] = useState<Appearance>(
    profile?.appearance ?? (profile?.darkMode ? 'dark' : 'light')
  );

  const handleChange = (key: string) => {
    setThemeKey(key);
    setTheme(key);
  };

  const handleAppearance = (value: Appearance) => {
    setLocalAppearance(value);
    setAppearance(value);
  };

  const handleColorMode = (value: ColorMode) => {
    setColorMode(value);
  };

  return (
    <View className="flex-1 bg-background p-4">
      <ThemePicker
        selected={themeKey}
        onSelect={handleChange}
        appearance={appearance}
        onAppearanceChange={handleAppearance}
        colorMode={profile?.colorMode ?? 'colorful'}
        onColorModeChange={handleColorMode}
      />
    </View>
  );
}

import React, { useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../lib/auth/AuthContext';
import { ThemePicker } from '../../components/ui/ThemePicker';
import { ColorMode } from '../../features/profile/types';

export default function ChangeThemeScreen() {
  const { profile, setTheme, setColorMode } = useAuth();
  const [themeKey, setThemeKey] = useState(profile?.themeKey ?? 'earth');
  const [darkMode, setDarkMode] = useState(profile?.darkMode ?? false);

  const handleChange = (key: string) => {
    setThemeKey(key);
    setTheme(key, darkMode);
  };

  const handleDarkMode = (value: boolean) => {
    setDarkMode(value);
    setTheme(themeKey, value);
  };

  const handleColorMode = (value: ColorMode) => {
    setColorMode(value);
  };

  return (
    <View className="flex-1 bg-background p-4">
      <ThemePicker
        selected={themeKey}
        onSelect={handleChange}
        darkMode={darkMode}
        onDarkModeChange={handleDarkMode}
        colorMode={profile?.colorMode ?? 'colorful'}
        onColorModeChange={handleColorMode}
      />
    </View>
  );
}
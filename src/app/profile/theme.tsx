import React, { useState } from 'react';
import { View } from 'react-native';
import { useAuth } from '../../lib/auth/AuthContext';
import { ThemePicker } from '../../components/ui/ThemePicker';

export default function ChangeThemeScreen() {
  const { profile, setTheme } = useAuth();
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

  return (
    <View className="flex-1 bg-background p-4">
      <ThemePicker selected={themeKey} onSelect={handleChange} darkMode={darkMode} onDarkModeChange={handleDarkMode} />
    </View>
  );
}
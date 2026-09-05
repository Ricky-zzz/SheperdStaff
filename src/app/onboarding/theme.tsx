import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth/AuthContext';
import { useTheme } from '../../lib/theme/ThemeContext';
import { ThemePicker } from '../../components/ui/ThemePicker';

export default function OnboardingThemeScreen() {
  const { draft, setDraft, completeOnboarding } = useAuth();
  const { colors } = useTheme();
  const [themeKey, setThemeKey] = useState(draft.themeKey);
  const [darkMode, setDarkMode] = useState(draft.darkMode);
  const [saving, setSaving] = useState(false);

  const handleSelect = (key: string) => {
    setThemeKey(key);
    setDraft({ themeKey: key });
  };

  const handleDarkMode = (value: boolean) => {
    setDarkMode(value);
    setDraft({ darkMode: value });
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      setDraft({ themeKey, darkMode });
      await completeOnboarding();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background p-6 justify-center">
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-4">
          <Ionicons name="color-palette" size={36} color={colors.primary[600]} />
        </View>
        <Text className="text-2xl font-bold text-neutral-800">Choose your theme</Text>
        <Text className="text-sm text-neutral-500 text-center mt-2">
          Pick a look you like. You can change it later in Settings.
        </Text>
      </View>

      <ThemePicker selected={themeKey} onSelect={handleSelect} darkMode={darkMode} onDarkModeChange={handleDarkMode} />

      <TouchableOpacity className="flex-row items-center justify-center gap-2 py-4 rounded-lg bg-primary-600 mt-6" onPress={handleFinish} disabled={saving}>
        {saving ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <>
            <Text className="text-base font-semibold text-white">Get Started</Text>
            <Ionicons name="checkmark" size={20} color={colors.white} />
          </>
        )}
      </TouchableOpacity>
      <Text className="text-xs text-neutral-400 text-center mt-4">Step 3 of 3</Text>
    </View>
  );
}
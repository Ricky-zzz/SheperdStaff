import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../lib/auth/AuthContext';
import { useTheme } from '../../lib/theme/ThemeContext';
import { ThemePicker } from '../../components/ui/ThemePicker';
import { ColorMode, Appearance } from '../../features/profile/types';

export default function OnboardingThemeScreen() {
  const { draft, setDraft, completeOnboarding } = useAuth();
  const { colors } = useTheme();
  const [themeKey, setThemeKey] = useState(draft.themeKey);
  const [appearance, setAppearance] = useState<Appearance>(draft.appearance);
  const [colorMode, setColorMode] = useState<ColorMode>(draft.colorMode);
  const [saving, setSaving] = useState(false);

  const handleSelect = (key: string) => {
    setThemeKey(key);
    setDraft({ themeKey: key });
  };

  const handleAppearance = (value: Appearance) => {
    setAppearance(value);
    setDraft({ appearance: value });
  };

  const handleColorMode = (value: ColorMode) => {
    setColorMode(value);
    setDraft({ colorMode: value });
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      setDraft({ themeKey, appearance, colorMode });
      await completeOnboarding();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1 bg-background p-6 justify-center">
      <View className="items-center mb-6">
        <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-4">
          <Ionicons name="color-palette-outline" size={36} color={colors.primary[600]} />
        </View>
        <Text className="text-2xl font-bold text-neutral-800 text-center">Choose your theme</Text>
        <Text className="text-sm text-neutral-500 text-center mt-2">
          Pick a look you like. You can change it later in Settings.
        </Text>
      </View>

      <Card className="mb-4">
        <ThemePicker
          selected={themeKey}
          onSelect={handleSelect}
          appearance={appearance}
          onAppearanceChange={handleAppearance}
          colorMode={colorMode}
          onColorModeChange={handleColorMode}
        />

        <Button
          title="Get Started"
          variant="primary"
          size="lg"
          icon="checkmark-outline"
          iconPosition="right"
          className="mt-6"
          loading={saving}
          onPress={handleFinish}
        />
      </Card>
      <Text className="text-xs text-neutral-500 text-center">Step 3 of 3</Text>
    </View>
  );
}
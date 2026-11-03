import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEMES } from '../../lib/theme/themes';
import { useTheme } from '../../lib/theme/ThemeContext';
import { Appearance, ColorMode } from '../../features/profile/types';

interface ThemePickerProps {
  selected: string;
  onSelect: (key: string) => void;
  appearance: Appearance;
  onAppearanceChange: (value: Appearance) => void;
  colorMode: ColorMode;
  onColorModeChange: (value: ColorMode) => void;
}

const APPEARANCE_OPTIONS: { value: Appearance; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export const ThemePicker: React.FC<ThemePickerProps> = ({
  selected,
  onSelect,
  appearance,
  onAppearanceChange,
  colorMode,
  onColorModeChange,
}) => {
  const { colors } = useTheme();
  const systemScheme = useColorScheme();
  const isDark = appearance === 'system' ? systemScheme === 'dark' : appearance === 'dark';
  return (
    <View>
      <Text className="text-sm font-medium text-neutral-600 mb-2">Color theme</Text>
      <View className="flex-row gap-4">
        {THEMES.map((t) => {
          const isSelected = selected === t.key;
          const swatch = isDark ? t.dark.primary[600] : t.light.primary[600];
          const swatchOn = isDark ? t.dark.onPrimary : t.light.onPrimary;
          return (
            <TouchableOpacity
              key={t.key}
              className={`w-16 h-16 rounded-full items-center justify-center border-2 ${isSelected ? 'border-primary-600' : 'border-border'}`}
              style={{ backgroundColor: swatch }}
              onPress={() => onSelect(t.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${t.name} theme`}
            >
              {isSelected && <Ionicons name="checkmark-outline" size={26} color={swatchOn} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <Text className="text-sm font-medium text-neutral-600 mt-4 mb-2">Appearance</Text>
      <View className="flex-row gap-2">
        {APPEARANCE_OPTIONS.map((opt) => {
          const isSel = appearance === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              className={`flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-lg border ${isSel ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
              onPress={() => onAppearanceChange(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSel }}
              accessibilityLabel={`${opt.label} appearance`}
            >
              <Ionicons name={opt.icon} size={16} color={isSel ? colors.onPrimary : colors.neutral[600]} />
              <Text className={`text-sm font-semibold ${isSel ? 'text-onPrimary' : 'text-neutral-600'}`}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text className="text-xs text-neutral-500 mt-2">
        System follows your device’s light and dark setting.
      </Text>

      <Text className="text-sm font-medium text-neutral-600 mt-4 mb-2">Color mode</Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg border ${colorMode === 'colorful' ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
          onPress={() => onColorModeChange('colorful')}
          accessibilityRole="radio"
          accessibilityState={{ selected: colorMode === 'colorful' }}
          accessibilityLabel="Colorful"
        >
          <Text className={`text-sm font-semibold text-center ${colorMode === 'colorful' ? 'text-onPrimary' : 'text-neutral-600'}`}>Colorful</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg border ${colorMode === 'uniform' ? 'bg-primary-600 border-primary-600' : 'bg-card border-border'}`}
          onPress={() => onColorModeChange('uniform')}
          accessibilityRole="radio"
          accessibilityState={{ selected: colorMode === 'uniform' }}
          accessibilityLabel="Uniform"
        >
          <Text className={`text-sm font-semibold text-center ${colorMode === 'uniform' ? 'text-onPrimary' : 'text-neutral-600'}`}>Uniform</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-xs text-neutral-500 mt-2">
        Uniform uses the theme shade for categories and icons; amounts stay red/green.
      </Text>
    </View>
  );
};
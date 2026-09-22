import React from 'react';
import { View, Text, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEMES } from '../../lib/theme/themes';
import { useTheme } from '../../lib/theme/ThemeContext';

interface ThemePickerProps {
  selected: string;
  onSelect: (key: string) => void;
  darkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({ selected, onSelect, darkMode, onDarkModeChange }) => {
  const { colors } = useTheme();
  return (
    <View>
      <Text className="text-sm font-medium text-neutral-600 mb-2">Color theme</Text>
      <View className="flex-row gap-4">
        {THEMES.map((t) => {
          const isSelected = selected === t.key;
          const swatch = darkMode ? t.dark.primary[600] : t.light.primary[600];
          return (
            <TouchableOpacity
              key={t.key}
              className={`w-16 h-16 rounded-full items-center justify-center border-2 ${isSelected ? 'border-primary-600' : 'border-border'}`}
              style={{ backgroundColor: swatch }}
              onPress={() => onSelect(t.key)}
            >
              {isSelected && <Ionicons name="checkmark" size={26} color={colors.white} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="flex-row items-center justify-between bg-card border border-border rounded-xl px-4 py-3 mt-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="moon" size={18} color={colors.neutral[600]} />
          <Text className="text-sm font-medium text-neutral-700">Dark mode</Text>
        </View>
        <Switch value={darkMode} onValueChange={onDarkModeChange} trackColor={{ true: colors.primary[600], false: colors.neutral[300] }} />
      </View>
    </View>
  );
};
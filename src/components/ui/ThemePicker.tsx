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
      <View className="flex-row flex-wrap gap-3">
        {THEMES.map((t) => {
          const isSelected = selected === t.key;
          const swatch = darkMode ? t.dark.primary[600] : t.light.primary[600];
          return (
            <TouchableOpacity
              key={t.key}
              className={`flex-1 flex-row items-center gap-2 py-3 px-3 rounded-xl border ${isSelected ? 'bg-primary-50 border-primary-600' : 'bg-card border-border'}`}
              onPress={() => onSelect(t.key)}
            >
              <View className="w-8 h-8 rounded-full" style={{ backgroundColor: swatch }} />
              <Text className={`text-sm font-medium flex-1 ${isSelected ? 'text-primary-700' : 'text-neutral-700'}`}>{t.name}</Text>
              {isSelected && <Ionicons name="checkmark-circle" size={20} color={colors.primary[600]} />}
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
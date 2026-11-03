import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, selected = false, onPress }) => {
  return (
    <TouchableOpacity
      className={`min-h-[44px] items-center justify-center px-3 py-2 rounded-full border bg-card ${selected ? 'bg-primary-600 border-primary-600' : 'border-border'}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text className={`text-sm font-semibold ${selected ? 'text-onPrimary' : 'text-neutral-600'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

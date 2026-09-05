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
      className={`px-3 py-2 rounded-full border bg-card ${selected ? 'bg-primary-600 border-primary-600' : 'border-border'}`}
      onPress={onPress}
    >
      <Text className={`text-sm font-medium ${selected ? 'text-white' : 'text-neutral-600'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

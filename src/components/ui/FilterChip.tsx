import React from 'react';
import { Pressable, Text } from 'react-native';
import { lightHaptic } from '../../lib/utils/haptics';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, selected = false, onPress }) => {
  return (
    <Pressable
      className={`min-h-[44px] items-center justify-center px-3 py-2 rounded-full border bg-card ${selected ? 'bg-primary-600 border-primary-600' : 'border-border'}`}
      style={({ pressed }) => (pressed ? { transform: [{ scale: 0.95 }], opacity: 0.85 } : null)}
      onPress={() => {
        void lightHaptic();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text className={`text-sm font-semibold ${selected ? 'text-onPrimary' : 'text-neutral-600'}`}>
        {label}
      </Text>
    </Pressable>
  );
};

import React from 'react';
import { View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../../lib/theme/ThemeContext';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ selectedValue, onValueChange, options, placeholder, error }) => {
  const { colors } = useTheme();
  return (
    <View
      className={`bg-card border rounded-lg mb-1 overflow-hidden ${error ? 'border-error' : 'border-border'}`}
    >
      <Picker
        selectedValue={selectedValue}
        onValueChange={(v) => onValueChange(String(v))}
        dropdownIconColor={colors.neutral[500]}
        style={{ color: colors.neutral[800] }}
      >
        {placeholder ? <Picker.Item label={placeholder} value="" enabled={false} color={colors.neutral[400]} /> : null}
        {options.map((o) => (
          <Picker.Item key={o.value} label={o.label} value={o.value} color={colors.neutral[800]} />
        ))}
      </Picker>
    </View>
  );
};
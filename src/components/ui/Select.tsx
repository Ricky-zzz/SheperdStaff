import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';
import { BottomSheet } from './BottomSheet';

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
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === selectedValue);

  return (
    <>
      <TouchableOpacity
        className={`flex-row items-center justify-between bg-card border rounded-lg px-4 py-3 mb-1 ${error ? 'border-error' : 'border-border'}`}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${placeholder ?? 'Select'}, ${selected ? selected.label : 'not set'}`}
        accessibilityHint="Opens a list of options"
      >
        <Text className={`text-base flex-1 mr-2 ${selected ? 'text-neutral-800' : 'text-neutral-500'}`} numberOfLines={1}>
          {selected ? selected.label : placeholder ?? 'Select…'}
        </Text>
        <Ionicons name="chevron-down-outline" size={18} color={colors.neutral[500]} />
      </TouchableOpacity>

      <BottomSheet visible={open} onClose={() => setOpen(false)}>
            <View className="flex-row justify-between items-center pb-2">
              <Text className="text-lg font-semibold text-neutral-800" numberOfLines={1}>{placeholder ?? 'Select'}</Text>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                className="p-2 -mr-2"
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close-outline" size={22} color={colors.neutral[500]} />
              </TouchableOpacity>
            </View>
            <View className="border-t border-border">
              {options.map((o, index) => {
                const isSel = o.value === selectedValue;
                return (
                  <TouchableOpacity
                    key={o.value}
                    className={`flex-row items-center -mx-4 px-4 py-3.5 ${index < options.length - 1 ? 'border-b border-neutral-100' : ''}`}
                    onPress={() => {
                      onValueChange(o.value);
                      setOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSel }}
                    accessibilityLabel={o.label}
                  >
                    <Text className={`flex-1 text-base ${isSel ? 'font-semibold text-primary-700' : 'text-neutral-800'}`} numberOfLines={1}>
                      {o.label}
                    </Text>
                    {isSel ? <Ionicons name="checkmark-outline" size={20} color={colors.primary[600]} /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>
      </BottomSheet>
    </>
  );
};

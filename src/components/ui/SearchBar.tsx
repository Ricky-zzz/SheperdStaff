import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../lib/theme/colors';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}) => {
  return (
    <View className="flex-1 flex-row items-center bg-white rounded-lg px-3 h-11 shadow-sm">
      <Ionicons name="search" size={18} color={Colors.neutral[400]} />
      <TextInput
        className="flex-1 ml-2 text-base text-neutral-800"
        placeholder={placeholder}
        placeholderTextColor={Colors.neutral[400]}
        value={value}
        onChangeText={onChangeText}
      />
      {value !== '' && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={18} color={Colors.neutral[400]} />
        </TouchableOpacity>
      )}
    </View>
  );
};

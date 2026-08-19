import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel = 'See all',
  onAction,
}) => {
  return (
    <View className="flex-row justify-between items-center mt-5 mb-3">
      <Text className="text-lg font-semibold text-neutral-800">{title}</Text>
      {onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text className="text-sm text-primary-600 font-medium">{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

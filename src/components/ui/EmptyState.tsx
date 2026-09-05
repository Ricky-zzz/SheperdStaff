import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../lib/theme/ThemeContext';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, subtitle }) => {
  const { colors } = useTheme();
  return (
    <View className="items-center py-16">
      <Ionicons name={icon} size={48} color={colors.neutral[300]} />
      <Text className="text-lg font-semibold text-neutral-500 mt-4">{title}</Text>
      {subtitle && <Text className="text-base text-neutral-400 mt-2">{subtitle}</Text>}
    </View>
  );
};
